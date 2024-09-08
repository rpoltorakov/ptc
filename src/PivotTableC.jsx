import { DragDropContext } from '@hello-pangea/dnd';
import { ApiV1 } from '@superset-ui/core';
import React, { createRef, useEffect } from 'react';
import buildQuery from './plugin/buildQuery';
import { ColumnHeaders } from './plugin/Components/ColumnHeaders';
import { DimPool } from './plugin/Components/DimPool';
import { Metrics } from './plugin/Components/Metrics';
import { Rows } from './plugin/Components/Rows';
import { Styles } from './plugin/Components/styles';
import { collectMetrics, getSubtotalsDims, getUniqueValues } from './plugin/utils';
import { Button, Popover } from 'antd';


export default function PivotTableC(props) {
  const [reload, setReload] = React.useState(false);
  const handleReload = () => {
    setReload(!reload)
  }
  console.log('-------------------------')
  console.log('props', props)
  const { height, groupbyColumns, groupbyRows, dimensions, subtotalsOn } = props;
  const { grandTotalsOn, subtotalsColsOn, subtotalsRowsOn } = props.formData
  
  const [dims, setDims] = React.useState([[...dimensions], [...groupbyColumns], [...groupbyRows]]) // пул измерений, колонки, строки
  const [metrics, setMetrics] = React.useState([...props.metrics])
  const [metricsAggs, setMetricsAggs] = React.useState([...props.metricsAggs])
  const [metricsFields, setMetricsFields] = React.useState([...props.metricsFields])
  const [isMetricsOpened, setIsMetricsOpened] = React.useState(false);
  const [isMetricsInCols, setIsMetricsInCols] = React.useState(false) // по умолчанию - влево (в строках) = false
  const [data, setData] = React.useState([...props.data])
  const [subtotalsData, setSubtotalsData] = React.useState([])

  const [colsAr, setColsAr] = React.useState(
    getUniqueValues(data, props.groupbyColumns, isMetricsInCols, props.metrics)
  )
  const [rowsAr, setRowsAr] = React.useState(
    getUniqueValues(data, props.groupbyRows, !isMetricsInCols, props.metrics)
  )
  const [metricsFormData, setMetricsFormData] = React.useState([...props.formData.metrics])
  
  // изменение agg + field метрик
  const handleMetricsChange = (metricsFD, i, agg, field) => {
    const generateSQLExpr = (agg, field) => {
      return agg.replaceAll('#', field) 
    }
    const newMetricsFD = [...metricsFormData]
    newMetricsFD[i] = {
      ...metricsFormData[i],
      sqlExpression: generateSQLExpr(agg, field),
      label: generateSQLExpr(agg, field)
    }
    setMetricsFormData(newMetricsFD)
    setMetrics(collectMetrics(newMetricsFD, 'def'))
  }
  
  // данные без сабтоталов
  async function getDataNoSubtotals(formData, dims, metricsFormData) {
    const newFormData = {
      ...formData,
      metrics: metricsFormData,
      groupbyColumns: dims[1],
      groupbyRows: dims[2],
      // groupby: [...dims[1], ...dims[2]],
    }
    delete newFormData.queries
    
    const data = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
    return data
  }
  // Функция получения данных
  async function getNewData(formData, dims, metricsFormData)  {
    const data = []
    // данные без сабтоталов
    const dataNoSubtotals = await getDataNoSubtotals(formData, dims, metricsFormData)
    data.push(...dataNoSubtotals)
    // setData([...newData.result[0].data])


    if (subtotalsRowsOn) {
      const subtotalsDataRows = await getSubtotalsDataRows(props.formData, dims, metricsFormData)
      // setData([...newData, ...subtotalsData])
      data.push(...subtotalsDataRows)  
    }

    if (subtotalsColsOn) {
      const subtotalsDataCols = await getSubtotalsDataCols(props.formData, dims, metricsFormData)
      console.log("🚀 ~ subtotalsDataCols:", subtotalsDataCols)
      data.push(...subtotalsDataCols)
    }
    setData([...data])
  }
  
  // Функция получения данных сабтоталов по строкам
  async function getSubtotalsDataRows(formData, dims, metricsFormData) {
    const cols = dims[1]
    const rows = getSubtotalsDims(dims[2])
    const subtotalDataPopulated = []
    
    for (let i=0; i < rows.length; i++) {
      const newFormData = {
        ...formData,
        metrics: metricsFormData,
        groupbyColumns: cols,
        groupbyRows: rows[i]
      }
      delete newFormData.queries
      const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
      let difference = dims[2].filter(x => !rows[i].includes(x)); // разница между двумя массивами

      // добавление в массива данных измерений, которых нет (отсутствовали в groupby) - со значением 'subtotal'
      const populatedData = newData.map((el, i) => {
        let res = {}
        difference.forEach((diff) => {
          res[diff] = 'subtotal'
        })        
        return {...el, ...res}
      })
      subtotalDataPopulated.push(...populatedData)
    }
    return subtotalDataPopulated
  }  

  // Функция получения данных сабтоталов по столбцам
  async function getSubtotalsDataCols(formData, dims, metricsFormData) {
    const cols = getSubtotalsDims(dims[1])
    console.log("🚀🚀🚀🚀 ~ cols:", cols)
    const rows = dims[2]
    const subtotalDataPopulated = []
    
    for (let i=-1; i < cols.length; i++) {
      // сначала запрос на сабтоталы без колонок
      if (i === -1) {
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: [], // только строки
          groupbyRows: rows
        }
        delete newFormData.queries
        const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
        console.log("🚀 ~ newData -1 :", newData)
        // let difference = cols[0];
        let difference = cols[cols.length-1]
        console.log("🚀🚀 ~ difference:", difference)
  
        // добавление в массива данных измерений, которых нет (отсутствовали в groupby) - со значением 'subtotal'
        const populatedData = newData.map((el, i) => {
          let res = {}
          difference.forEach((diff) => {
            res[diff] = 'subtotal'
          })        
          return {...el, ...res}
        })
        console.log("🚀 ~ populatedData -1 :", populatedData)
        subtotalDataPopulated.push(...populatedData)
      } else {
        if (cols.length === 1) {
          continue
        }
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: cols[i], 
          groupbyRows: rows
        }
        console.log("🚀 ~ cols[i]:", cols[i])
        delete newFormData.queries
        const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
        console.log("🚀 ~ newData:", newData)
        let difference = dims[1].filter(x => !cols[i].includes(x)); // разница между двумя массивами
        console.log("🚀🚀 ~ difference:", difference)
  
        // добавление в массива данных измерений, которых нет (отсутствовали в groupby) - со значением 'subtotal'
        const populatedData = newData.map((el, i) => {
          let res = {}
          difference.forEach((diff) => {
            res[diff] = 'subtotal'
          })        
          return {...el, ...res}
        })
        console.log("🚀 ~ populatedData:", populatedData)
        subtotalDataPopulated.push(...populatedData)
      }
    }
    return subtotalDataPopulated
  } 
  
  

  // на изменение колонок/строк - запрос на апи
  useEffect(() => {
    getNewData(props.formData, dims, metricsFormData)
  }, [dims, metricsFormData, reload])
  // на изменение данных - изменить колонки/строки
  useEffect(() => {
    console.log('data is changed', data.filter(el => Object.values(el).includes('subtotal')))
    setColsAr(getUniqueValues(data, [...dims[1]], isMetricsInCols, metrics, subtotalsColsOn, 'subtotal', true))
    console.log("🚀 ~ getUniqueValues cols:", getUniqueValues(data, [...dims[1]], isMetricsInCols, metrics, subtotalsColsOn, 'subtotal'))
    setRowsAr(getUniqueValues(data, [...dims[2]], !isMetricsInCols, metrics, subtotalsRowsOn, 'subtotal', false))
    console.log("🚀 ~ getUniqueValues rows:", getUniqueValues(data, [...dims[2]], !isMetricsInCols, metrics, subtotalsRowsOn, 'subtotal'))
  }, [dims, data, metricsFormData, isMetricsInCols, reload])
  // на изменение строк - изменить сабототалы (добавить в данные)
  useEffect(() => {
    // if (subtotalsRowsOn) {
    //   getSubtotals(props.formData, dims, metricsFormData, isMetricsInCols)
    // }
  }, [dims, metricsFormData, isMetricsInCols, reload]);
  
  const handleMetricsSwitch = () => {
    // Переключение метрик в строках/столбцах
    setIsMetricsInCols(!isMetricsInCols)
  }
  const handleDeleteMetric = (index) => {
    // Удаление метрики - удаляет только из формы, в массивах аггрегаций и полей - нужно оставить
    setMetricsFormData([...metricsFormData.filter((el, i) => i !== index)])
    setMetrics([...metrics.filter((el, i) => i !== index)])
  }
  const handleAddMetric = () => {
    // При нажатии на "+" - добавить копию последней метрики
    setMetricsFormData([...metricsFormData, metricsFormData[metricsFormData.length-1]])
    setMetrics([...metrics, metrics[metrics.length-1]])
  }
      
    
  // колбэк для драг'н'дропа
  const handleDragEnd = (result) => {
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };
    
    const move = (source, destination, droppableSource, droppableDestination) => {
      const sourceClone = Array.from(source);
      const destClone = Array.from(destination);
      const [removed] = sourceClone.splice(droppableSource.index, 1);
      
      destClone.splice(droppableDestination.index, 0, removed);
      
      const result = {};
      result[droppableSource.droppableId] = sourceClone;
      result[droppableDestination.droppableId] = destClone;
      
      return result;
    };
    
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;
    
    if (sInd === dInd) {
      const items = reorder(dims[sInd], source.index, destination.index);
      const newState = [...dims];
      newState[sInd] = items;
      setDims(newState);
    } else {
      const result = move(dims[sInd], dims[dInd], source, destination);
      const newState = [...dims];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      setDims(newState);
    }
  }
  
  const rootElem = createRef();
  return (
      <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      >
    <div className='ptc-wrapper'>
      <DragDropContext onDragEnd={handleDragEnd}>
      <div className='app-ptc'>
        <DimPool 
          id={'0'}
          items={dims[0]}
          vertical={false}
          classes={'dim-pool-big'}
          direction="horizontal"
          metricsAr={metrics}
          />
        <div className='wrapper'>
          <div className='colss'>
            <div style={{ display: 'flex', position: 'relative', flexDirection:'column' }}>
              
              <Popover
                content={<Metrics 
                  isOpened={isMetricsOpened}
                  metrics={metrics} 
                  checked={isMetricsInCols}
                  handleChange={handleMetricsSwitch}
                  handleDelete={handleDeleteMetric}
                  metricsAggs={metricsAggs}
                  metricsFields={metricsFields}
                  metricsFormData={metricsFormData}
                  handleMetricsChange={handleMetricsChange}
                  handleAddMetric={handleAddMetric}
                />}
                trigger='click'
                placement="bottomLeft"
              >
                <Button block style={{ width: '8em', background: '#fbfbfb', border: '2px solid #c0c0c0' }}>Metrics</Button>
              </Popover>
              <Button onClick={handleReload}>Reload</Button>
            </div>

            <DimPool
              id={'1'}
              items={dims[1]}
              vertical={false}
              direction="horizontal"
              metricsAr={metrics}
            />
          </div>

          <div className='tableWrapper' style={{maxWidth: '100%'}}>
            <DimPool
              id={'2'}
              items={dims[2]}
              vertical={true}
              metricsAr={metrics}
            />

            <table id='t' className='table table-pvc'>
              <thead>
                <ColumnHeaders 
                  colsArr={colsAr} 
                  rowsArr={rowsAr} 
                  isMetricsInCols={isMetricsInCols}
                  subtotalsColsOn={subtotalsColsOn}
                  subtotalsRowsOn={subtotalsRowsOn}
                  subtotalsData={subtotalsData}
                  reload={reload}
                />
              </thead>
              <tbody>
                <Rows
                  reload={reload}
                  rowsArr={rowsAr} 
                  colsArr={colsAr} 
                  data={data} 
                  dims={dims} 
                  isMetricsInCols={isMetricsInCols}
                  subtotalsColsOn={subtotalsColsOn}
                  subtotalsRowsOn={subtotalsRowsOn}
                  subtotalsData={subtotalsData}
                />
              </tbody>
            </table>
          </div>
        </div>
    </div>
    </DragDropContext>
    </div>

    </Styles>

    
  );
}
