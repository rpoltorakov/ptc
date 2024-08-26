import React from 'react'
import { getDimSpan, getMultiplicators, renderValue } from './utils'

// Получение заголовков в столбцах
export const getColumnHeaders = (colsArr, rowsArr) => {
  const getDimsHier = (colsArr) => {
    let indicators = colsArr
    let result = []
    let results = []
    function recur(level) {
      if (level === indicators.length) {
        return;
      }

      let length = indicators[level].length;
      for (let i = 0; i < length; i++) {
          result.push(indicators[level][i]);
          results.push({level: level, value: indicators[level][i]})
          recur(level + 1);
      }
    }
    recur(0)
    return results
  }
  const colsHier = getDimsHier(colsArr)

  return colsArr.map((el, i) => {
    return (
      <tr key={el.toString()+i}>
        {rowsArr.map((el, i) => (
          <th 
            className='td' 
            key={el.toString()+i.toString()+'nullCross'}
          />
        ))}

        {colsHier.filter(el => el.level === i).map((el, i) => {
          const span = getDimSpan(colsArr, el.level)
          return <td 
            key={el+i} 
            className='td header'
            colSpan={span}
          >{renderValue(el.value)}</td>
        })}
      </tr>
    )
  })
}

export const getRows = (rowsArr, colsArr, data, dims, isMetricsInCols) => {
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


  const findDataCell = (dataArr, colDims, rowDims, isMetricsInCols, dims) => {
    const dimNames = [...dims[1], ...dims[2]]
    return data.find((el, i) => {
      const dims = [...colDims, ...rowDims]
      let target = {}
      dimNames.forEach((key, i) => target[key] = dims[i])
      for (const key in target) {
        if (el[key] !== target[key]) {
          return false;
        }
      }
      return true
    })
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
                {value ? value.count : null}
              </td>
            )
        })}
        
      </tr>
    )
  })
}
