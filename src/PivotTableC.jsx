import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ApiV1, styled } from '@superset-ui/core';
import React, { createRef, useEffect } from 'react';
import buildQuery from './plugin/buildQuery';
import { ColumnHeaders } from './plugin/Components/ColumnHeaders';
import { DimPool } from './plugin/Components/DimPool';
import { Metrics } from './plugin/Components/Metrics';
import { Rows } from './plugin/Components/Rows';
import { Styles } from './plugin/Components/styles';
import { collectMetrics, getUniqueValues } from './plugin/utils';
import { Button, Popover } from 'antd';
import { DownOutlined } from '@ant-design/icons'
import { SubtotalsMenu } from './plugin/Components/SubtotalsMenu';


export default function PivotTableC(props) {
  const { height, groupbyColumns, groupbyRows, dimensions } = props;
  const { grandTotalsOn, subtotalsOn } = props.formData
  console.log('props', props)
  const [dims, setDims] = React.useState([[...dimensions], [...groupbyColumns], [...groupbyRows]]) // пул измерений, колонки, строки
  const [metrics, setMetrics] = React.useState([...props.metrics])
  const [metricsAggs, setMetricsAggs] = React.useState([...props.metricsAggs])
  const [metricsFields, setMetricsFields] = React.useState([...props.metricsFields])
  const [isMetricsOpened, setIsMetricsOpened] = React.useState(false);
  const [isMetricsInCols, setIsMetricsInCols] = React.useState(false) // по умолчанию - влево (в строках)
  const [data, setData] = React.useState([...props.data])
  
  const [colsAr, setColsAr] = React.useState(getUniqueValues(data, props.groupbyColumns, isMetricsInCols, props.metrics))
  const [rowsAr, setRowsAr] = React.useState(getUniqueValues(data, props.groupbyRows, !isMetricsInCols, props.metrics))
  
  const [metricsFormData, setMetricsFormData] = React.useState([...props.formData.metrics])
  
  // изменение agg + field метрик
  const handleMetricsChange = (metricsFD, i, agg, field) => {
    const generateSQLExpr = (agg, field) => {
      return agg.replaceAll('#', field)
    }
    // const metricsFD = metricsFormData
    const newMetricsFD = [...metricsFormData]
    newMetricsFD[i] = {
      ...metricsFormData[i],
      sqlExpression: generateSQLExpr(agg, field),
      label: generateSQLExpr(agg, field)
    }
    console.log("🚀 ~ newMetricsFD:", newMetricsFD)
    setMetricsFormData(newMetricsFD)
    setMetrics(collectMetrics(newMetricsFD, 'def'))
  }
  
  // Функция получения данных
  async function getNewData(formData, dims, metricsFormData)  {
    const newFormData = {
      ...formData,
      metrics: metricsFormData,
      groupbyColumns: dims[1],
      groupbyRows: dims[2],
      groupby: [...dims[1], ...dims[2]],
    }
    delete newFormData.queries
    
    const newData = await ApiV1.getChartData(buildQuery(newFormData))
    setData([...newData.result[0].data])

    // по идее не нужно, т.к. стейты метрик обновляются там где они изменяются, а запрос на данные не меняет метрики
    // setMetrics([...props.metrics])
  }
  // на изменение колонок/строк - запрос на апи
  useEffect(() => {
    getNewData(props.formData, dims, metricsFormData)
  }, [dims, metricsFormData])
  useEffect(() => {
    setColsAr(getUniqueValues(data, [...dims[1]], isMetricsInCols, metrics))
    setRowsAr(getUniqueValues(data, [...dims[2]], !isMetricsInCols, metrics))
  }, [dims, data, metricsFormData, isMetricsInCols])
  
  const handleMetricsSwitch = () => {
    setIsMetricsInCols(!isMetricsInCols)
  }
  const handleDeleteMetric = (index) => {
    setMetricsFormData([...metricsFormData.filter((el, i) => i !== index)])
    setMetrics([...metrics.filter((el, i) => i !== index)])
    // setMetricsAggs([...metricsAggs.filter((el, i) => i !== index)])
    // setMetricsFields([...metricsFields.filter((el, i) => i !== index)])
  }
  const handleAddMetric = () => {
    console.log('metrics', metrics)
    // При нажатии на "+" - добавить копию последней метрики
    setMetricsFormData([...metricsFormData, metricsFormData[metricsFormData.length-1]])
    console.log('------', [...metrics, metrics[metrics.length-1]])
    setMetrics([...metrics, metrics[metrics.length-1]])
    // setMetricsAggs([...metricsAggs, metricsAggs[metricsAggs.length-1]])
    // setMetricsFields([...metricsFields, metricsFields[metricsFields.length-1]])
  }

  const rootElem = createRef();

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
              <div style={{ display: 'flex', position: 'relative', width: '9em',flexDirection:'column' }}>
                
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
                  <Button block>Metrics</Button>
                </Popover>

                <Popover
                  content={
                    <SubtotalsMenu 
                    />
                  }
                  trigger='click'
                  placement="bottomLeft"
                >
                  <Button block>Subtotals</Button>
                </Popover>

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
                    // showSubtotal={showSubtotal}\
                    showTotal={grandTotalsOn}
                  />
                </thead>
                <tbody>
                  <Rows 
                    rowsArr={rowsAr} 
                    colsArr={colsAr} 
                    data={data} 
                    dims={dims} 
                    isMetricsInCols={isMetricsInCols}
                    // showSubtotal={showSubtotal}
                    showTotal={grandTotalsOn}
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
