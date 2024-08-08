import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { PivotTableCProps, PivotTableCStylesProps } from './types';
import { ApiV1 } from '@superset-ui/core';
import buildQuery from './plugin/buildQuery';
import {
  getColumnHeaders,
  getRows
} from './plugin/pvc';
import {
  getUniqueValues,
  getDimSpan,
  getMultiplicators
} from './plugin/utils'

const Styles = styled.div<PivotTableCStylesProps>`
  
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

// background-color: ${({ theme }) => theme.colors.secondary.light2};


export default function PivotTableC(props) {
  console.log('props in root', props)

  const { 
    height, 
    width, 
    setDataMask,
  } = props;



  const [cols, setCols] = React.useState([])
  const [rows, setRows] = React.useState([])

  const rootElem = createRef();

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
  const colsAr = getUniqueValues(props.data, props.groupbyColumns)
  const rowsAr = getUniqueValues(props.data, props.groupbyRows)
  // utils
  // const getUniqueValues = (data, dims) => {
  //   let uniqueCols = []
  //   console.log('-----uniq------')
  //   dims.map((dim) => {
  //     console.log('dim')
  //     const unique = [...new Set(data.map((item) => item[dim]))]
  //     if (unique.length === 1 && unique[0] === undefined) return
  //     if (unique.length === 1 && unique[0] !== undefined) {
  //       uniqueCols.push([unique])
  //       return
  //     }
  //     uniqueCols.push(unique)
  //   })
  //   console.log('uniqueCols', uniqueCols)
  //   return uniqueCols
  // }
  // console.log("🚀 ~ rowsAr:", rowsAr)

  // utils
  // const getDimSpan = (arr, level) => {
  //   let remainder = arr.slice(level+1)
  //   if (!remainder) {
  //     return 1
  //   } else {
  //     return remainder.reduce((acc, el) => {return acc*el.length}, 1)
  //   }
  // }

  // pvc
  // const getColumnHeaders = (colsArr) => {
  //   const getDimsHier = (colsArr) => {
  //     let indicators = colsArr
  //     let result = []
  //     let results = []
  //     function recur(level) {
  //       if (level === indicators.length) {
  //         return;
  //       }
  
  //       let length = indicators[level].length;
  //       for (let i = 0; i < length; i++) {
  //           result.push(indicators[level][i]);
  //           results.push({level: level, value: indicators[level][i]})
  //           recur(level + 1);
  //       }
  //     }
  //     recur(0)
  //     return results
  //   }
  //   const colsHier = getDimsHier(colsAr)

  //   return colsArr.map((el, i) => {
  //     return (
  //       <tr key={el.toString()+i}>
  //         {rowsAr.map((el, i) => (
  //           <th 
  //             className='td' 
  //             key={el.toString()+i.toString()+'nullCross'}
  //           />
  //         ))}

  //         {colsHier.filter(el => el.level === i).map((el, i) => {
  //           const span = getDimSpan(colsArr, el.level)
  //           return <td 
  //             key={el+i} 
  //             className='td header'
  //             colSpan={span}
  //           >{el.value}</td>
  //         })}
  //       </tr>
  //     )
  //   })
  // }

  // utils
  // const getMultiplicators = (ar) => {
  //   const lenArr = ar.map(el => el.length)
  //   console.log("🚀 ~ lenArr:", lenArr)
  //   const result = []

  //   for (let i = 0; i < lenArr.length; i++) {
  //     if (i === lenArr.length-1) {
  //       result.push(1)
  //     } else {
  //       let tempval = 1
  //       for (let j = i+1; j < lenArr.length; j++) {
  //         tempval *= lenArr[j] // 1*2*2
  //       }
  //       result.push(tempval)
  //     }
  //   }

  //   return result
  // }

  // pvc
  // const getRows = (rowsArr, colsArr, data) => {
  //   const cartesian = (...a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  //   const rowsMatrix = cartesian(...rowsAr)
  //   const colsMatrix = cartesian(...colsArr)

  //   console.log('matrixes', rowsMatrix, colsMatrix)
  //   console.log('rowsArr', rowsArr)
  //   console.log('colsArr', colsArr)

  //   // let result = JSON.parse(JSON.stringify(rowsMatrix))
  //   // console.log('resArr', result)
  //   // for (let i = 0; i < rowsArr.length; i++) {
  //   //   let tempval = ''
  //   //   for (let j = 0; j < result.length; j++) {
  //   //     if (j === 0) {
  //   //       tempval = result[j][i]
  //   //       continue
  //   //     }
  //   //     if (result[j][i] === tempval) {
  //   //       console.log('result', result[j], result[j][i])
  //   //       result[j][i] = ''
  //   //       continue
  //   //     }
  //   //     if (result[j][i] !== tempval) {
  //   //       tempval = result[j][i]
  //   //       continue
  //   //     }
  //   //   }
  //   // }

  //   const dedupMatrix = (rowMatrix, multiplicators) => {
  //     let result = []
  //     const buildNewArray = (rowMatrix, multiplicators) => {
  //       let bufferArray = [];
  //       rowMatrix.forEach((e, i) => {
  //         e.forEach((j, g) => {
  //           if(i % multiplicators[g] === 0){
  //             bufferArray.push(j)
  //           }
  //           else {
  //             bufferArray.push('')    
  //           }
  //         })
  //         result.push(bufferArray)
  //         bufferArray = []
  //       });
  //       return result
  //     }

  //     return buildNewArray(rowMatrix, multiplicators)
  //   }



  //   let result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr))
  //   console.log('result after', result)
  //   const findDataCell = (dataArr, dimsArr) => {
  //     return dataArr.filter((el, i) => {
  //       return dimsArr.every((dim) => Object.values(el).includes(dim))
  //     })
  //   }

  //   return result.map((row, i) => {
  //     return (
  //       <tr key={row.toString()+i.toString()+'rowHeader'}>

  //         {row.map((el, j) => (
  //           el ? <td 
  //             className='td header' 
  //             key={el.toString()+j.toString()+'header'}
  //             rowSpan={el ? getDimSpan(rowsArr, j) : 0}
  //           >
  //             {el}
  //           </td> : null
  //         ))}

  //         {colsMatrix.map((el, k) => {
  //           const value = findDataCell(data, [el, ...rowsMatrix[i]])[0]
  //             return (
  //               <td
  //                 key={el.toString()+'cell'}
  //                 className='tdv'
  //               >
  //                 {value ? value.count : null}
  //               </td>
  //             )
  //         })}
          
  //       </tr>
  //     )
  //   })
  // }

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      {/* <div>Dimensions: <span style={{color: 'blue', fontSize: '20px'}}>{props.formData.dimensions.toString()}</span></div> */}
      {/* <button onClick={clickHandler}>button1</button>
      <button onClick={clickHandler1}>button2</button> */}
      {/* <span>Custom metric:</span>
      <span>{metric}</span> */}
      {/* <h3>{props.headerText}</h3> */}
      
      
      <div className='tableWrapper' style={{maxWidth: '100%'}}>
        <table id='t' className='table'>
          <thead>
            {getColumnHeaders(colsAr, rowsAr)}
          </thead>
          <tbody>

            {getRows(rowsAr, colsAr, props.data)}
            
          </tbody>
        </table>
      </div>

    </Styles>

    
  );
}
