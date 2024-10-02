import React from 'react'
import { findSubArray, getDimSpan, getDimSpanSubtotalRow, getMultiplicators, renderValue } from '../utils'

export const Rows = ({
    rowsArr,
    colsArr,
    data,
    dims,
    isMetricsInCols
  }) => {
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
      rowMatrix.forEach((row, i) => {
        row.forEach((cell, k) => {
          if (i % multiplicators[k] === 0) {
            bufferArray.push(cell)
          } else {
            bufferArray.push('rplc') // '' - метка что ячейки нужно объединить (span=0)
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
    const dimNames = [...dims[1], ...dims[2]]
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

  const rowsMatrix = cartesian(...rowsArr)
  const colsMatrix = cartesian(...colsArr)

  const result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr)) // матрица для строк

  const dataRows = result.map((row, i) => {
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
              (el || el === null || el === '') && el !== 'rplc'  ?
                <td
                  className={`td header ${rowsMatrix[i].includes('subtotal') ? 'tdv-total' : ''}`}
                  key={el ? el.toString()+j.toString()+'header' : 'null'+j.toString()+'header'}
                  rowSpan={el === 'rplc' ? 0 : getDimSpan(rowsArr, j)} // '' - метка что ячейки нужно объединить (span=0)
                >
                  {renderValue(el)}
                </td> 
                : // если нет: 'rplc' - для объединения ячеек --> что бы объединить ставим null, 
                  // '\u00A0' (non-breaking space) как значение измерения (не должны до сюда доходить)
                (el === 'rplc') ? null : '\u00A0'
            ))
          }

          { // ячейки данных
            dataRows[i].map((el, j) => (
              <td
                key={'dataCell' + j.toString() + 'row' + i.toString()}
                className={`tdv ${rowsMatrix[i].includes('subtotal') || colsMatrix[j].includes('subtotal') ? 'tdv-total' : ''}`}
              >{el}</td>
            ))
          }
        </tr>
      ))}
    </>
  )
}
