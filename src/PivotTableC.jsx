import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ApiV1, styled } from '@superset-ui/core';
import React, { createRef, useEffect } from 'react';
import buildQuery from './plugin/buildQuery';
import { ColumnHeaders } from './plugin/Components/ColumnHeaders';
import { DimPool } from './plugin/Components/DimPool';
import { Metrics } from './plugin/Components/Metrics';
import { Rows } from './plugin/Components/Rows';
import { Styles } from './plugin/Components/styles';
import { getUniqueValues } from './plugin/utils';


export default function PivotTableC(props) {
  const { 
    height, 
    width, 
    setDataMask,
    groupbyColumns,
    groupbyRows,
    dimensions
  } = props;
  console.log('props', props)
  const [dims, setDims] = React.useState([[...dimensions], [...groupbyColumns], [...groupbyRows]]) // пул измерений, колонки, строки
  const [metrics, setMetrics] = React.useState([...props.metrics])
  const [isMetricsOpened, setIsMetricsOpened] = React.useState(false);
  const [isMetricsInCols, setIsMetricsInCols] = React.useState(false) // по умолчанию - влево (в строках)
  const [data, setData] = React.useState([...props.data])

  const [colsAr, setColsAr] = React.useState(getUniqueValues(data, props.groupbyColumns, isMetricsInCols, props.metrics))
  const [rowsAr, setRowsAr] = React.useState(getUniqueValues(data, props.groupbyRows, !isMetricsInCols, props.metrics))

  async function getNewData(props, dims)  {
    const newFormData = {
      ...props.formData,
      groupbyColumns: dims[1],
      groupbyRows: dims[2],
      groupby: [...dims[1], ...dims[2]],
    }
    delete newFormData.queries

    const newData = await ApiV1.getChartData(buildQuery(newFormData))
    // console.log("🚀 ~ newData:", newData)
    setData([...newData.result[0].data])
    // console.log('new data length:', data.length)
  }
  // на каждое изменение колонок/строк - запрос на апи с новыми данными и ререндер с полученными данными
  useEffect(() => {
    // console.log('old data', data)
    
    getNewData(props, dims)

    
  }, [dims, isMetricsInCols])
  
  useEffect(() => {
    setColsAr(getUniqueValues(data, [...dims[1]], isMetricsInCols, props.metrics))
    setRowsAr(getUniqueValues(data, [...dims[2]], !isMetricsInCols, props.metrics))
  }, [dims, data])

  const handleMetricsOpen = () => {
    setIsMetricsOpened(!isMetricsOpened)
  }
  const handleMetricsSwitch = () => {
    setIsMetricsInCols(!isMetricsInCols)
  }

  const rootElem = createRef();

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
      // console.log('Dims changed!', dims)
      setDims(newState);
    } else {
      const result = move(dims[sInd], dims[dInd], source, destination);
      const newState = [...dims];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      // console.log('Dims changed!', dims)
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
              <div style={{ display: 'flex', position: 'relative' }}>
                <div className='metrics-button' onClick={handleMetricsOpen}>
                  Metrics
                </div>

                {<Metrics 
                  isOpened={isMetricsOpened}
                  metrics={metrics} 
                  checked={isMetricsInCols}
                  handleChange={handleMetricsSwitch}
                />}

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
                  <ColumnHeaders colsArr={colsAr} rowsArr={rowsAr} />
                </thead>
                <tbody>
                  <Rows 
                    rowsArr={rowsAr} 
                    colsArr={colsAr} 
                    data={data} 
                    dims={dims} 
                    isMetricsInCols={isMetricsInCols}
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
