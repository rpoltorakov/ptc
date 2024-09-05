import React from 'react'
import { getDimSpan, getMultiplicators, renderValue } from '../utils'

export const Rows = ({ rowsArr, colsArr, data, dims, isMetricsInCols, showTotal }) => {
  console.log("🚀🚀🚀🚀 ~ rowsArr:", colsArr)
  // декартово произведение массивов
  const cartesian = (...a) => {
    if (a.length === 1) {
      return a[0].map(e => [e])
    } else {
      return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
    }
  }

  // удаление дубликатов
  const dedupMatrix = (rowMatrix, multiplicators) => {
    let result = []
    const buildNewArray = (rowMatrix, multiplicators) => {
      let bufferArray = [];
      rowMatrix.forEach((e, i) => {
        e.forEach((j, g) => {
          if (i % multiplicators[g] === 0) {
            bufferArray.push(j)
          }
          else {
            bufferArray.push('') // '' - метка что ячейки нужно объединить (span=0)
          }
        })
        result.push(bufferArray)
        bufferArray = []
      });
      return result
    }

    return buildNewArray(rowMatrix, multiplicators)
  }

  // поиск метрик
  const findDataCell = (data, colDims, rowDims, isMetricsInCols, dims) => {
    const colsParsed = isMetricsInCols ? colDims.slice(0, -1) : colDims
    // console.log("🚀 ~ colsParsed:", colsParsed)
    const dimNames = [...dims[1], ...dims[2]]
    // console.log("🚀 ~ dimNames:", dimNames)
    const value = data.find((el, i) => {
      const dims = [...colsParsed, ...rowDims]
      let target = {}
      dimNames.forEach((key, i) => target[key] = dims[i])
      for (const key in target) {
        if (el[key] !== target[key]) {
          return false;
        }
      }
      return true
    })

    // поиск нужной метрики
    let metric = ''
    if (isMetricsInCols) {
      metric = colDims[colDims.length-1]
    } else {
      metric = rowDims[rowDims.length-1]
    }

    return value ? value[metric] : null
  }

  const getRowSubtotal = (dataRow, agg) => {
    if (agg = 'SUM') {
      return dataRow.reduce((acc, cur) => acc + cur, 0)
    }
  }

  const getColumnSubtotal = (colsMatrix, dataRow, agg) => {
    return colsMatrix.map((col, i) => {
      let result = 0
      dataRow.forEach((row, j) => {
        result += row[i]
      })
      return result
    })
  }

  const rowsMatrix = cartesian(...rowsArr)
  console.log("🚀 ~ rowsArr:", rowsArr)
  console.log("🚀 ~ rowsMatrix:", rowsMatrix)
  const colsMatrix = cartesian(...colsArr)
  console.log("🚀 ~ colsArr:", colsArr)
  console.log("🚀 ~ colsMatrix:", colsMatrix)
  // let subtotal = 0
  const result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr)) // матрица для строк
  const dataRow = result.map((row, i) => {
    return colsMatrix.map((col, k) => {
      const value = findDataCell(data, col, rowsMatrix[i], isMetricsInCols, dims)
      return value
    })
  })
  
  
  return (
    <>
      {result.map((row, i) => (
        <tr key={row.toString()+i.toString()+'rowHeader'}>
          { // заголовки в строках
            row.map((el, j) => (
              // если елемент существует - возвращаем ячейку
              el || el === null ? 
                <td
                  className='td header' 
                  key={el ? el.toString()+j.toString()+'header' : 'null'+j.toString()+'header'}
                  rowSpan={el === '' ? 0 : getDimSpan(rowsArr, j)} // '' - метка что ячейки нужно объединить (span=0)
                > 
                  {renderValue(el)} 
                </td> 
                : // если нет: '' - для объединения ячеек --> null что бы объединить, '\u00A0' (nbsp) как значение измерения
                (el === '') ? null : '\u00A0'
            ))
          }
          
          { // ячейки данных
            dataRow[i].map((el, k) => (
              <td
                key={'dataCell' + k.toString() + 'row' + i.toString()}
                className='tdv'
              >{el}</td>
            ))
          }
          

          { // подитоги в строках
            !isMetricsInCols && showTotal &&
            <td
              className=' tdv tdv-total'
            >{getRowSubtotal(dataRow[i], 'SUM')}</td>
          }

          
        </tr>
      ))}
      
      { // подитоги в колонках
        isMetricsInCols && showTotal &&
        <tr>
          <td 
            className='tdv tdv-total'
            colSpan={rowsMatrix[rowsMatrix.length-1].length}
          >Total</td>
          {getColumnSubtotal(colsMatrix, dataRow, 'SUM').map(el => (
            <td
              className='tdv tdv-total'
              // key={'totalCol' + i.toString()}
            >{el}</td>
          ))}
        </tr>
      }
    </>
  )
}
