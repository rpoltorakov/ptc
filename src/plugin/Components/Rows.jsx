import React from 'react'
import { findSubArray, getDimSpan, getMultiplicators, renderValue } from '../utils'

export const Rows = ({
    rowsArr,
    colsArr,
    data,
    dims,
    isMetricsInCols,
    showTotal,
    subtotalsColsOn,
    subtotalsRowsOn,
    subtotalsData
  }) => {
  const cartesian = (...a) => {
    if (a.length === 1) {
      return a[0].map(e => [e])
    } else {
      return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
    }
  }
  // декартово произведение массивов
  const createMatrix = (a, subtotalsRowsOn) => {
    const cartesian = (...a) => {
      if (a.length === 1) {
        return a[0].map(e => [e])
      } else {
        return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
      }
    }

    let result = cartesian(...a)
    
    // if (subtotalsRowsOn) {
    //   result = result.map((el, i) => {
    //     const ind = findSubArray(el, ['total', 'total'])
    //     if (ind === -1) {
    //       return el
    //     } else {
    //       let i = ind
    //       let elem = el
    //       // console.log('gouing down', el, el[i])
    //       while (i < elem.length) {
    //         elem[i] = null
    //         i++
    //       }
    //       return elem
    //     }
    //   })
    // }
    
    return result
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
    // if (rowDims.includes('total') || colDims.includes('total')) {
    //   console.groupCollapsed('findDataCell')
    //   console.log("🚀 ~ rowDims:", rowDims)
    //   console.log("🚀 ~ colDims:", colDims)
    // }
    const colsParsed = isMetricsInCols ? colDims.slice(0, -1) : colDims
    // console.log("🚀 ~ colsParsed:", colsParsed)
    const dimNames = [...dims[1], ...dims[2]]
    // console.log("🚀 ~ dimNames:", dimNames)
    const value = data.find((el, i) => {
      const dims = [...colsParsed, ...rowDims]
      let target = {}
      dimNames.forEach((key, i) => target[key] = dims[i])
      if (i === 0) {
        // if (rowDims.includes('total') || colDims.includes('total')) {
        //   console.log("🚀 ~ target:", target)
        // }
      }
      for (const key in target) {
        if (el[key] !== target[key]) {
          return false;
        }
      }
      return true
    })
    // if (rowDims.includes('total') || colDims.includes('total')) {
    //   console.log("🚀 ~ value:", value)
    // }

    // поиск нужной метрики
    let metric = ''
    if (isMetricsInCols) {
      metric = colDims[colDims.length-1]
    } else {
      metric = rowDims[rowDims.length-1]
    }
    // if (rowDims.includes('total') || colDims.includes('total')) {
    //   console.groupEnd()
    // }
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
  console.groupCollapsed('Rows.jsx')
  // const rowsMatrix = cartesian(...rowsArr)
  const rowsMatrix = createMatrix(rowsArr, subtotalsRowsOn)
  console.log("🚀 ~ rowsArr:", rowsArr)
  console.log("🚀 ~ rowsMatrix:", rowsMatrix)
  const colsMatrix = cartesian(...colsArr)
  console.log("🚀 ~ colsArr:", colsArr)
  console.log("🚀 ~ colsMatrix:", colsMatrix)
  console.groupCollapsed('rowsMatrix')
  console.table(rowsMatrix)
  console.groupEnd()
  // let subtotal = 0
  const result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr)) // матрица для строк
  const dataRow = result.map((row, i) => {
    return colsMatrix.map((col, k) => {
      const value = findDataCell(data, col, rowsMatrix[i], isMetricsInCols, dims)
      return value
    })
  })
  console.log("🚀 ~ dataRow:", dataRow)

  console.groupEnd()
  return (
    <>
      {result.map((row, i) => (
        <tr key={row.toString()+i.toString()+'rowHeader'}>
          { // заголовки в строках
            row.map((el, j) => (
              // если елемент существует - возвращаем ячейку
              // el || el === null || el === undefined ?
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


        </tr>
      ))}
    </>
  )
}
