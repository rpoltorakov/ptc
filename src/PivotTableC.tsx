import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { PivotTableCProps, PivotTableCStylesProps } from './types';
import { ApiV1 } from '@superset-ui/core';

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

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

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
    // setTimeout(() => {
    //   setData([])
    // }, 10000)
  },[])
  React.useEffect(() => {console.log('data is changed:', data)}, [data])

  const rootElem = createRef<HTMLDivElement>();
  const [metric, setMetric] = React.useState(0.0)

  async function clickHandler() {
    // console.log(getChartData(buildQuery(props.formData)))
    // console.log(ApiV1)
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


  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <button onClick={clickHandler}>button1</button>
      <button onClick={clickHandler1}>button2</button>
      <span>Custom metric:</span>
      <span>{metric}</span>
      <h3>{props.headerText}</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </Styles>
  );
}
