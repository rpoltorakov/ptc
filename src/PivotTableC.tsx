import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { PivotTableCProps, PivotTableCStylesProps } from './types';
import { ApiV1 } from '@superset-ui/core';
import buildQuery from './plugin/buildQuery';
// import PivotTableUI from './plugin/pivotTable/PivotTableUI'
// import from './plugin/pivotTable/PivotTableUI'

const Styles = styled.div<PivotTableCStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) => theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) => theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) => (
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]
    )}px;
  }
`;


export default function PivotTableC(props: PivotTableCProps) {
  console.log('props in root', props)

  const { 
    height, 
    width, 
    setDataMask,
  } = props;

  const [data, setData] = React.useState([])
  React.useEffect(() => {
    setData(props.data)
  },[props])

  const rootElem = createRef<HTMLDivElement>();
  const [metric, setMetric] = React.useState(0.0)

  async function clickHandler() {

    const newFormData = {
      ...props.formData,
      cols: ['genre']
    }
    const dataa = await ApiV1.getChartData(buildQuery(newFormData))
    console.log('----- click handler -----')
    console.log('dataa', dataa)
    setData(dataa.result[0].data)
    let sum = 0
    dataa.result[0].data.forEach((o) => {
      sum += o["SUM(global_sales)"]
    })
    setMetric(sum)
  }

  async function clickHandler1() {
    // console.log(getChartData(buildQuery(props.formData)))
    // console.log(ApiV1)
    const newFormData = {
      ...props.formData,
      cols: ['platform']
    }
    const dataa = await ApiV1.getChartData(buildQuery(newFormData))
    console.log('----- click handler 1 -----')
    console.log('dataa', dataa)
    setData(dataa.result[0].data)
    let sum = 0
    dataa.result[0].data.forEach((o) => {
      sum += o["SUM(global_sales)"]
      console.log('+sum:', sum)
    })
    setMetric(sum)
  }

  console.log(data)
  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div>Dimensions: <span style={{color: 'blue', fontSize: '20px'}}>{props.formData.dimensions.toString()}</span></div>
      <button onClick={clickHandler}>button1</button>
      <button onClick={clickHandler1}>button2</button>
      <span>Custom metric:</span>
      <span>{metric}</span>
      <h3>{props.headerText}</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>


    {/*}  <PivotTableUI
        data={data}
        // onChange={s => console.log(s)}
      /> */}


    </Styles>

    
  );
}
