import React from 'react'
import {
  getDimSpan,
  getMultiplicators,
  renderValue
} from '../utils'

export const ColumnHeaders = ({
  colsArr,
  rowsArr,
  isMetricsInCols,
  dims
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
    let bufferArray = [];
    rowMatrix.forEach((row, i) => {
      row.forEach((cell, k) => {
        if (i % multiplicators[k] === 0) {
          bufferArray.push(cell)
        } else {
          bufferArray.push(cell === 'subtotal' ? 'subtotal':'rplc') // 'rplc' - метка что ячейки нужно объединить (span=0)
        }
      })
      
      result.push(bufferArray)
      bufferArray = []
    });

    // если есть сабтоталы - нужно удалить ячейки, детализирующие сабтотал 
    // (пример: есть subtotal-moscow, subtotal-stP, subtotal-subtotal, 
    // нужно оставить только subtotal-subtotal)
    if (colsArr.some(el => el.includes('subtotal'))) {
      result.forEach((row, i) => {
        if (row.includes('subtotal')) {
          let toBeDeleted = false

          for (let j = 0; j < row.length- (isMetricsInCols ? 2 : 1); j++) {
            if (row[j] === 'subtotal' && row[j+1] !== 'subtotal') {
              toBeDeleted = true
            }
          }
          if (toBeDeleted) {
            result[i] = 'deleteMe'
          }
        }
      })
      result = result.filter(el => el !== 'deleteMe')
    }
    return result
  }

  // создание матрицы span'ов
  const createColSpanMap = (dedupedMatrix) => {
    let result = []
    // сверху вниз
    for (let i = 0; i < dedupedMatrix.length; i++) {
      let buff = []
        // слева направо
      for (let j = 0; j < dedupedMatrix[i].length; j++) {
        if (dedupedMatrix[i][j] === 'rplc') {
          buff.push(0)
        } else {
          const foundIndex = dedupedMatrix.slice(i+1).findIndex((el, k) => {
            // if (k === dedupedMatrix.slice(i+1).length-1) {
            //   return true
            // }
            return el[j] !== 'rplc'
          })
          // Записываем расстояние до следующего не-'rplc' элемента, если такого нет - значит конец матрицы 
          // => объединять нужно до конца 
          buff.push( foundIndex === -1 ? dedupedMatrix.slice(i+1).length+1 : foundIndex+1 ) // +1 т.к. слайсили
        }
      }
      result.push(buff)
    }
    return result
  }

  const createCleanDimsMatrix = (dedupedMatrix) => {
    try {
      let result = []
      
      // рекурсивная функция поиск ближайшего сверху
      function getFirstNonRplc(arr, i, j) {
        
        if (arr[i][j] !== 'rplc') {
          return arr[i][j]
        } else {
          return getFirstNonRplc(arr, i-1, j)
        }
      }
      
      // замена 'rplc' на ближайшее сверху, операция обратная функции dedupMatrix
      dedupedMatrix.forEach((row, i) => {
        let rowClone = []
        if (row.includes('rplc')) {
          rowClone = row.map((el, j) => {
            if (el === 'rplc') {
              return getFirstNonRplc(dedupedMatrix, i, j)
            } else {
              return el
            }
          })
        } else {
          rowClone = row
        }
        result.push(rowClone)
      })
  
      return result

    } catch (e) {
      console.error(e)
    }
    
  }

  const getSubtotalRowSpan = (row) => {
    return row.filter(el => el === 'subtotal').length
  }

  const colsMatrix = cartesian(...colsArr)
  console.log("🚀 ~ colsMatrix:", colsMatrix)
  console.log("🚀 ~ colsMatrix dims:", dims)
  console.log("🚀 ~ getMultiplicators(colsArr):", getMultiplicators(colsArr))
  const dedupedColsMatrix = dedupMatrix(colsMatrix, getMultiplicators(colsArr))
  console.log("🚀 ~ dedupedColsMatrix:", dedupedColsMatrix)
  const colSpanMap = createColSpanMap(dedupedColsMatrix)
  const colsMatrixClean = createCleanDimsMatrix(dedupedColsMatrix)
  console.log("🚀 ~ colsMatrixClean:", colsMatrixClean)
  
  return colsArr.map((colsRow, i) => {
    return (
      <tr key={colsRow.toString()+i}>
        { // пересечений "шапок" - большая пустая ячейка
          rowsArr.map((rows, i) => (
            <th
              className='tdv'
              key={rows.toString()+i.toString()+'nullCross'}
            />
          ))
        }

        {
          dedupedColsMatrix.map((el, j) => {
            const element = el[i]
            const span = colSpanMap[j][i]

            return (
              element !== 'rplc' && 
              (i !== 0 && i < colsArr.length-(isMetricsInCols ? 1 : 0) ? 
              dedupedColsMatrix[j][i-1] : true) !== 'subtotal'  ? 
              (<td
                key={element+j}
                className={`td header ${colsMatrixClean && colsMatrixClean[j]?.includes('subtotal') ? 'tdv-total' : ''}`}
                colSpan={span}
                rowSpan={el[i] === 'subtotal' ? getSubtotalRowSpan(el) : 1}
              >
                {renderValue(element)}
              </td>)
              :
              (element === 'rplc') ? null :
              (element === 'subtotal') ? null : 
              '\u00A0'
            )
          })
        }
      </tr>
    )
  })
}
