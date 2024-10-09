import { DragDropContext } from '@hello-pangea/dnd';
import { ApiV1 } from '@superset-ui/core';
import { Button, Popover } from 'antd';
import React, { createRef, useEffect } from 'react';
import buildQuery from './plugin/buildQuery';
import { ColumnHeaders } from './plugin/Components/ColumnHeaders';
import { DimPool } from './plugin/Components/DimPool';
import { Metrics } from './plugin/Components/Metrics';
import { Rows } from './plugin/Components/Rows';
import { Styles } from './plugin/Components/styles';
import { collectMetrics, getSubtotalsDims, getUniqueValues } from './plugin/utils';

export default function PivotTableC(props) {
  const { height, groupbyColumns, groupbyRows, dimensions } = props;
  const { subtotalsColsOn, subtotalsRowsOn } = props.formData

  const [reload, setReload] = React.useState(false);
  const [dims, setDims] = React.useState([[...dimensions], [...groupbyColumns], [...groupbyRows]]) // пул измерений, колонки, строки
  const [metrics, setMetrics] = React.useState([...props.metrics])
  const [metricsAggs, setMetricsAggs] = React.useState([...props.metricsAggs])
  const [metricsFields, setMetricsFields] = React.useState([...props.metricsFields])
  const [isMetricsOpened, setIsMetricsOpened] = React.useState(false);
  const [isMetricsInCols, setIsMetricsInCols] = React.useState(false) // по умолчанию - влево (в строках) = false
  const [data, setData] = React.useState([...props.data])
  const [subtotalsData, setSubtotalsData] = React.useState([])
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(props.formData);
  const [warning, setWarning] = React.useState(false);
  const [colsAr, setColsAr] = React.useState(
    getUniqueValues(data, props.groupbyColumns, isMetricsInCols, props.metrics)
  )
  const [rowsAr, setRowsAr] = React.useState(
    getUniqueValues(data, props.groupbyRows, !isMetricsInCols, props.metrics)
  )
  const [metricsFormData, setMetricsFormData] = React.useState([...props.formData.metrics])
  
  // изменение agg + field метрик
  const handleMetricsChange = (metricsFD, i, agg, fieldSQL, field) => {
    const generateSQLExpr = (agg, field) => {
      return agg.replaceAll('#', field) 
    }
    const newMetricsFD = [...metricsFormData]
    if (newMetricsFD[i].expressionType === 'SIMPLE') {
      newMetricsFD[i] = {
        ...metricsFormData[i],
        aggregate: agg,
        label: `${agg}(${field})`,
        column: metricsFields.find(el => el.column_name === field)
      }
      setMetricsFormData(newMetricsFD)
      setMetrics(collectMetrics(newMetricsFD, 'simple'))
    }
  }
 
  // Функция получения данных
  async function getNewData(formData, dims, metricsFormData)  {
    const data = []
    // данные без сабтоталов
    const dataNoSubtotals = await getDataNoSubtotals(formData, dims, metricsFormData)
    data.push(...dataNoSubtotals)

    if (subtotalsRowsOn) {
      // добавить сабтоталы строк
      const subtotalsDataRows = await getSubtotalsDataRows(props.formData, dims, metricsFormData)
      data.push(...subtotalsDataRows)  
    }

    if (subtotalsColsOn) {
      // добавить сабтоталы колонок
      const subtotalsDataCols = await getSubtotalsDataCols(props.formData, dims, metricsFormData)
      data.push(...subtotalsDataCols)
    }
    setData([...data])
  }
   
  // Функция получения данных без сабтоталов
  async function getDataNoSubtotals(formData, dims, metricsFormData) {
    const newFormData = {
      ...formData,
      metrics: metricsFormData,
      groupbyColumns: dims[1],
      groupbyRows: dims[2],
      adhoc_filters: props.formData.adhocFilters,
      extra_form_data: props.formData.extraFormData
    }

    const data = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
    return data
  }
  // Функция получения данных сабтоталов по строкам
  async function getSubtotalsDataRows(formData, dims, metricsFormData) {
    const cols = dims[1]
    const rows = getSubtotalsDims(dims[2])
    const subtotalDataPopulated = []
    
    for (let i=-1; i < rows.length; i++) {

      if (i === -1) {
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: cols, // только строки
          groupbyRows: [],
          adhoc_filters: props.formData.adhocFilters,
          extra_form_data: props.formData.extraFormData
        }

        const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
        let difference = rows[rows.length-1]
  
        // добавление в массива данных измерений, которых нет (отсутствовали в groupby) - со значением 'subtotal'
        const populatedData = newData.map((el, i) => {
          let res = {}
          difference.forEach((diff) => {
            res[diff] = 'subtotal'
          })        
          return {...el, ...res}
        })

        subtotalDataPopulated.push(...populatedData)
      } else {
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: cols,
          groupbyRows: rows[i],
          adhoc_filters: props.formData.adhocFilters,
          extra_form_data: props.formData.extraFormData
        }
  
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
    }
    return subtotalDataPopulated
  }  
  // Функция получения данных сабтоталов по столбцам
  async function getSubtotalsDataCols(formData, dims, metricsFormData) {
    const cols = getSubtotalsDims(dims[1])
    const rows = dims[2]
    const subtotalDataPopulated = []
    
    for (let i=-1; i < cols.length; i++) {
      // сначала запрос на сабтоталы без колонок
      if (i === -1) {
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: [], // только строки
          groupbyRows: rows,
          adhoc_filters: props.formData.adhocFilters,
          extra_form_data: props.formData.extraFormData
        }

        const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
        let difference = cols[cols.length-1]
  
        // добавление в массива данных измерений, которых нет (отсутствовали в groupby) - со значением 'subtotal'
        const populatedData = newData.map((el, i) => {
          let res = {}
          difference.forEach((diff) => {
            res[diff] = 'subtotal'
          })        
          return {...el, ...res}
        })

        subtotalDataPopulated.push(...populatedData)
      } else {
        if (cols.length === 1) {
          continue
        }
        const newFormData = {
          ...formData,
          metrics: metricsFormData,
          groupbyColumns: cols[i], 
          groupbyRows: rows,
          adhoc_filters: props.formData.adhocFilters,
          extra_form_data: props.formData.extraFormData
        }
        const newData = (await ApiV1.getChartData(buildQuery(newFormData))).result[0].data
        let difference = dims[1].filter(x => !cols[i].includes(x)); // разница между двумя массивами
  
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
    }
    return subtotalDataPopulated
  } 
  
  // на изменение колонок/строк - запрос на апи
  useEffect(() => {
    setWarning('')
    getNewData(formData, dims, metricsFormData)
  }, [dims, metricsFormData, reload, props])
  // на изменение данных - изменить колонки/строки
  useEffect(() => {
    setColsAr(getUniqueValues(data, [...dims[1]], isMetricsInCols, metrics, subtotalsColsOn, 'subtotal', true))
    setRowsAr(getUniqueValues(data, [...dims[2]], !isMetricsInCols, metrics, subtotalsRowsOn, 'subtotal', false))
  }, [dims, data, metricsFormData, isMetricsInCols, reload, props])
  
  // Переключение метрик в строках/столбцах
  const handleMetricsSwitch = () => {
    if (isMetricsInCols) {
      if (dims[1].length > 0) {
        setIsMetricsInCols(false)
        setWarning('')
      } else {
        setWarning('Columns cannot be empty')
      }
    } else {
      if (dims[2].length > 0) {
        setIsMetricsInCols(true)
        setWarning('')
      } else {
        setWarning('Rows cannot be empty')
      }
    }
  }
  // Удаление метрики - удаляет только из формы, в массивах аггрегаций и полей - нужно оставить
  const handleDeleteMetric = (index) => {
    setMetricsFormData([...metricsFormData.filter((el, i) => i !== index)])
    setMetrics([...metrics.filter((el, i) => i !== index)])
  }
  // При нажатии на "+" - добавить копию последней SIMPLE метрики
  const handleAddMetric = () => {
    const simpleMetricsFD = metricsFormData.filter(metric => metric.expressionType === 'SIMPLE')    
    setMetricsFormData([...metricsFormData, simpleMetricsFD[simpleMetricsFD.length-1]])
    setMetrics([...metrics, simpleMetricsFD[simpleMetricsFD.length-1].label])
  }
  // кнопка перезагрузки
  const handleReload = () => {
    setMetricsFormData([...props.formData.metrics])
    setMetrics([...props.metrics])
    setDims([[...dimensions], [...groupbyColumns], [...groupbyRows]])
    setReload(!reload)
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
        height={height}
        headerFontSize={props.headerFontSize}
        cellFontSize={props.cellFontSize}
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
          type={'pool'}
          dims={dims}
          />
        <div className='wrapper'>
          <div className='colss'>
            <div style={{ display: 'flex', position: 'relative', flexDirection: 'column', gap: '0.25em' }}>
              
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
                  warning={warning}
                />}
                trigger='click'
                placement="bottomLeft"
              >
                <Button block style={{ width: '8em', background: '#fbfbfb', border: '2px solid #c0c0c0' }}>Metrics</Button>
              </Popover>
              <Button onClick={handleReload}>Reset</Button>
            </div>

            <DimPool
              id={'1'}
              items={dims[1]}
              vertical={false}
              direction="horizontal"
              metricsAr={metrics}
              type={'cols'}
              dims={dims}
              isMetricsInCols={isMetricsInCols}
            />
          </div>

          <div className='tableWrapper' style={{maxWidth: '100%'}}>
            <DimPool
              id={'2'}
              items={dims[2]}
              vertical={true}
              metricsAr={metrics}
              type={'rows'}
              dims={dims}
              isMetricsInCols={isMetricsInCols}
            />

            <table id='t' className='table table-pvc'>
              <thead>
                <ColumnHeaders
                  colsArr={colsAr}
                  rowsArr={rowsAr}
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
