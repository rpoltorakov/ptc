import React from 'react'
import { getDimSpan, getMultiplicators, renderValue } from '../utils'

export const Rows = ({ rowsArr, colsArr, data, dims, isMetricsInCols }) => {
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

    // поиску нужной метрики
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

  let result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr))
  return result.map((row, i) => (
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
        colsMatrix.map((col, k) => {
          const value = findDataCell(data, col, rowsMatrix[i], isMetricsInCols, dims)
            return (
              <td
                key={col.toString()+'cell'}
                className='tdv'
              >
                {value}
              </td>
            )
        })
      }
    </tr>
  ))
}
