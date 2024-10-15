import React from 'react'
import { findSubArray, getDimSpan, getMultiplicators, renderValue } from '../utils'

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
    if (rowsArr.some(el => el.includes('subtotal'))) {
      result.forEach((row, i) => {
        if (row.includes('subtotal')) {
          let toBeDeleted = false

          for (let j = 0; j < row.length-2; j++) {
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

  // поиск метрик
  const findDataCell = (data, colDims, rowDims, isMetricsInCols, dims) => {
    const colsParsed = isMetricsInCols ? colDims.slice(0, -1) : colDims
    const dimNames = [...dims[1], ...dims[2]] // колонки, строки
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

  // создание матрицы span'ов
  const createRowSpanMap = (dedupedMatrix) => {
    let result = []
    // сверху вниз
    for (let i = 0; i < dedupedMatrix.length; i++) {
      let buff = []
        // слева направо
      for (let j = 0; j < dedupedMatrix[i].length; j++) {
        if (dedupedMatrix[i][j] === 'rplc') {
          buff.push(0)
        } else {
          buff.push(dedupedMatrix.slice(i+1).findIndex((el, k) => el[j] !== 'rplc') + 1) // +1 т.к. слайсили
        }
      }
      result.push(buff)
    }
    return result
  }

  const createCleanDimsMatrix = (dedupedMatrix) => {
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
  }

  const rowsMatrix = cartesian(...rowsArr)
  const colsMatrix = cartesian(...colsArr)
  
  const dedupedRowsMatrix = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr)) // матрица для строк

  const rowSpanMap = createRowSpanMap(dedupedRowsMatrix)
  const rowsMatrixClean = createCleanDimsMatrix(dedupedRowsMatrix)

  const dataRows = dedupedRowsMatrix.map((row, i) => {
    return colsMatrix.map((col, k) => {
      const value = findDataCell(data, col, rowsMatrixClean[i], isMetricsInCols, dims)
      return value
    })
  })

  console.log("🚀 ~ dataRows:", dataRows)

  return (
    <>
      {dedupedRowsMatrix.map((row, i) => (
        <tr key={row.toString()+i.toString()+'rowHeader'}>
          { // заголовки в строках
            row.map((el, j) => (
              // если елемент существует - возвращаем ячейку
               el !== 'rplc'  ?
                <td
                  className={`td header ${row.includes('subtotal') ? 'tdv-total' : ''}`}
                  key={el ? el.toString()+j.toString()+'header' : 'null'+j.toString()+'header'}
                  rowSpan={rowSpanMap[i][j]}
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
                className={`tdv ${rowsMatrixClean[i].includes('subtotal') || colsMatrix[j].includes('subtotal') ? 'tdv-total' : ''}`}
              >{el}</td>
            ))
          }
        </tr>
      ))}
    </>
  )
}
