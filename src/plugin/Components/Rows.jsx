import React from 'react'
import { getDimSpan, getMultiplicators, renderValue } from '../utils'

export const Rows = ({ rowsArr, colsArr, data, dims, isMetricsInCols }) => {
  // console.log('data length:', data.length)
  const cartesian = (...a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  const cartesianRows = (...a) => {
    if (a.length === 1) {
      return a[0].map(e => [e])
    } else {
      return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
    }
  }

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


  const findDataCell = (data, colDims, rowDims, isMetricsInCols, dims) => {
    const dimNames = [...dims[1], ...dims[2]]
    const value = data.find((el, i) => {
      const dims = [...colDims, ...rowDims]
      // console.log("🚀 ~ dims:", dims)
      let target = {}
      dimNames.forEach((key, i) => target[key] = dims[i])
      // console.log("🚀 ~ target:", target)
      for (const key in target) {
        if (el[key] !== target[key]) {
          return false;
        }
      }
      return true
    })

    let metric = ''
    if (isMetricsInCols) {
      metric = colDims[colDims.length-1]
    } else {
      metric = rowDims[rowDims.length-1]
    }

    return value ? value[metric] : null
  }

  const rowsMatrix = cartesianRows(...rowsArr)
  const colsMatrix = cartesianRows(...colsArr)

  let result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr))
  return result.map((row, i) => {
    return (
      <tr key={row.toString()+i.toString()+'rowHeader'}>

        {/* заголовки в строках */}
        {row.map((el, j) => (
          // если елемент существует - возвращаем ячейку
          el||el===null ? 
            <td
              className='td header' 
              key={el ? el.toString()+j.toString()+'header' : 'null'+j.toString()+'header'}
              rowSpan={el === '' ? 0 : getDimSpan(rowsArr, j)} // '' - метка что ячейки нужно объединить (span=0)
            > 
              {renderValue(el)} 
            </td> 
            : // если нет: '' - для объединения ячеек --> null что бы объединить, '\u00A0' (nbsp) как значение измерения
            (el === '') ? null : '\u00A0'
        ))}

        {/* ячейки данных */}
        {colsMatrix.map((col, k) => {
          console.log("🚀 ~ col:", col)
          console.log("🚀 ~ row:", rowsMatrix[i])
          // col - массив значений измерений колонок
          // rowsMatrix[i] - массив значений измерений строк
          // могу получить:
          // - где лежать метрики (строки/столбцы)
          //
          const value = findDataCell(data, col, rowsMatrix[i], isMetricsInCols, dims)
            return (
              <td
                key={col.toString()+'cell'}
                className='tdv'
              >
                {value}
              </td>
            )
        })}
        
      </tr>
    )
  })
}
