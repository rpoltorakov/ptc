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
}) => {
  // const maxLevel = isMetricsInCols ? colsArr.length-2 : colsArr.length-1
  // const getDimsHier = (colsArr) => {
  //   let indicators = colsArr
  //   // let result = []
  //   let results = []
  //   function recur(level) {
  //     if (level === indicators.length) {
  //       return
  //     }
  //     let length = indicators[level].length;
  //     for (let i = 0; i < length; i++) {
  //       // result.push(indicators[level][i]);
  //       results.push({level: level, value: indicators[level][i], toBeDeleted: false})
  //       recur(level + 1)
  //     }
  //   }
  //   recur(0)
  //   // console.log('1', JSON.parse(JSON.stringify(results)))
  //   function metricAllowedForDeletion(i) {
  //     if (isMetricsInCols && results[i].level === colsArr.length-1) {
  //       if (results[i-1].toBeDeleted === true) {
  //         return true
  //       }
  //     }
  //   }
  //   function markChildrenForDeletion(i) {
  //     let tmp = i
  //     let currentLevel = results[i].level
      
  //     while (results[tmp+1] && results[tmp+1].level > currentLevel) {
  //       const currentElement = results[tmp]
  //       const nextElement = results[tmp+1]
        
  //       if (nextElement.value !== 'subtotal' && metricAllowedForDeletion(tmp+1)) {
  //         nextElement.toBeDeleted = true
  //       }
  //       tmp++
  //     }
  //   }
    
  //   for (let i = 0; i < results.length-1; i++) {
  //     if (results[i].value === 'subtotal' && results[i+1].level >= results[i].level) {
  //       markChildrenForDeletion(i)
  //     }
  //   }
  //   // console.log('2', JSON.parse(JSON.stringify(results)))
  //   results = results.filter(el => !el.toBeDeleted)
    
  //   for (let i = 0; i < results.length-1; i++) {
  //     const currentElement = results[i]
  //     const nextElement = results[i+1]
  //     if (currentElement.value === 'subtotal' && nextElement.value === 'subtotal') {
  //       // если разница положительная и больше одного - нужно удалить элемент
  //       if ((nextElement.level - currentElement.level) > 1 || (nextElement.level - currentElement.level) === 0) {
  //         nextElement.toBeDeleted = true
  //       }
  //     }
  //   }
  //   // console.log('3', JSON.parse(JSON.stringify(results)))
  //   results = results.filter(el => !el.toBeDeleted)
    
  //   return results
  // }
  // const colsHier = getDimsHier(colsArr)
  // function getColsDim(el, k) {
  //   if (el.value === 'subtotal') {
  //     return 1
  //   } 
  //   if (el.level === maxLevel) {
  //     return 1
  //   }
  //   const j = colsHier.indexOf(el)
  //   const end = colsHier.slice(j+1).find(item => item.level <= el.level)
  //   let slicedColsHier = colsHier.slice(j, colsHier.indexOf(end)).filter(item => item.level === maxLevel)
  //   return slicedColsHier.length
  // }

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

  const getSubtotalRowSpan = (row) => {
    return row.filter(el => el === 'subtotal').length
  }


  const colsMatrix = cartesian(...colsArr)
  const dedupedColsMatrix = dedupMatrix(colsMatrix, getMultiplicators(colsArr))
  const colSpanMap = createRowSpanMap(dedupedColsMatrix)
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
              (i !== 0 && i < colsArr.length-(isMetricsInCols ? 1 : 0) ? dedupedColsMatrix[j][i-1] : true) !== 'subtotal'  ? (<td
                key={element+j}
                className={`td header ${colsMatrixClean[j].includes('subtotal') ? 'tdv-total' : ''}`}
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
