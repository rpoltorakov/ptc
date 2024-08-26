import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ApiV1, styled } from '@superset-ui/core';
import React, { createRef, useEffect } from 'react';
import buildQuery from './plugin/buildQuery';
import { Dim } from './plugin/Components/Dim';
import { DimPool } from './plugin/Components/DimPool';
import { Metrics } from './plugin/Components/Metrics';
import {
  getColumnHeaders,
  getRows
} from './plugin/pvc';
import {
  getDimSpan,
  getMultiplicators,
  getUniqueValues
} from './plugin/utils';

const Styles = styled.div<PivotTableCStylesProps>`
  .app-ptc {
    padding: 4em;
    text-align: center;
    background-color: #282c34;
    overflow: scroll;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: ${({ theme }) => theme.gridUnit * 2}px;
    height: ${({height}) => height}px;
  }
  .ptc-wrapper {
  
  }
  
  .table {
    width: 100%;
    border: 1px solid white;
    border-collapse: collapse;
  }

  td {
    border: 1px solid white;
  }

  .wrapper {
    width: 90%;
    padding: 0 1em;
  }

  .tableWrapper {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    gap: 2em;
    position: relative;
  }

  .pools {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 100%;
  }

  .dim-pool {
    border: 2px solid gray;
    min-height: 3em;
    display: flex;
    justify-content: center;
  }

  .dim-pool-col {
    flex-direction: column;
    width: 8em;
  }
  .dim-pool-row {
    flex-direction: row;
    width: 100%;
  }

  .dim-pool-metrics {
    border-color: #107AB0;
  }

  .dim-pool-big {
    margin-bottom: 1em;
    width: 90%;
  }

  .dim-elem {
    margin: 0.5em;
    border: 1px solid gray;
    border-radius: 2px;
    padding:  0.5em 1.5em;
    cursor: grab;
    word-wrap: break-word;
  }

  .dim-metric {
    border-color: #107AB0;
  }

  .colss {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }

  .metrics-button {
    cursor: pointer;
    border: 2px solid blue;
    width: 8em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metrics {
    border: 2px solid red;
    width: 10em;
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    position: absolute;
    top: 2em;
    left: 2em;
    min-height: 10em;
    background-color: #3e4148;
    z-index: 10;
    transition: opacity .1s linear;
    opacity: 0;
  }

  .metrics-opened {
    opacity: 1;
  }

  .metrics-add-button {
    cursor: pointer;
    color: black;
  }

  .metric {
    width: 8em !important;
    border: 2px solid blue;
  }
  
  .tdv {
    color: white;
  }
`;

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
  const [dims, setDims] = React.useState([[...dimensions], [...groupbyColumns], [...groupbyRows]])
  const [metrics, setMetrics] = React.useState([...props.metrics])
  const [isMetricsOpened, setIsMetricsOpened] = React.useState(false);
  const [isMetricsInCols, setIsMetricsInCols] = React.useState(false) // по умолчанию - влево (в строках)

  const handleMetricsOpen = () => {
    setIsMetricsOpened(!isMetricsOpened)
  }
  const handleMetricsSwitch = () => {
    setIsMetricsInCols(!isMetricsInCols)
  }

  const rootElem = createRef();

  async function clickHandler() {
    const newFormData = {
      ...props.formData,
      cols: ['genre']
    }
    const dataa = await ApiV1.getChartData(buildQuery(newFormData))

    setData(dataa.result[0].data)
    let sum = 0
    dataa.result[0].data.forEach((o) => {
      sum += o["SUM(global_sales)"]
    })
    setMetric(sum)
  }
  async function clickHandler1() {

    const newFormData = {
      ...props.formData,
      cols: ['platform']
    }
    const dataa = await ApiV1.getChartData(buildQuery(newFormData))

    setData(dataa.result[0].data)
    let sum = 0
    dataa.result[0].data.forEach((o) => {
      sum += o["SUM(global_sales)"]
    })
    setMetric(sum)
  }

  const colsAr = getUniqueValues(props.data, props.groupbyColumns, isMetricsInCols, props.metrics)
  console.log("🚀 ~ colsAr:", colsAr)
  const rowsAr = getUniqueValues(props.data, props.groupbyRows, !isMetricsInCols, props.metrics)
  // const rowsAr = getUniqueValues(props.data, dims[2])
  console.log("🚀 ~ rowsAr:", rowsAr)

  const metric = 'count'
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
      
      // width={width}
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
              <div style={{position: 'relative'}}>
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

              <table id='t' className='table'>
                <thead>
                  {getColumnHeaders(colsAr, rowsAr)}
                </thead>
                <tbody>

                  {getRows(rowsAr, colsAr, props.data, dims, isMetricsInCols)}
                  
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
