import React from 'react'
import { getDimSpan, getMultiplicators } from './utils'

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
          >{el.value}</td>
        })}
      </tr>
    )
  })
}

export const getRows = (rowsArr, colsArr, data) => {
  const cartesian = (...a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  const rowsMatrix = cartesian(...rowsArr)
  const colsMatrix = cartesian(...colsArr)

  const dedupMatrix = (rowMatrix, multiplicators) => {
    let result = []
    const buildNewArray = (rowMatrix, multiplicators) => {
      let bufferArray = [];
      rowMatrix.forEach((e, i) => {
        e.forEach((j, g) => {
          if(i % multiplicators[g] === 0){
            bufferArray.push(j)
          }
          else {
            bufferArray.push('')    
          }
        })
        result.push(bufferArray)
        bufferArray = []
      });
      return result
    }

    return buildNewArray(rowMatrix, multiplicators)
  }



  let result = dedupMatrix(rowsMatrix, getMultiplicators(rowsArr))
  const findDataCell = (dataArr, dimsArr) => {
    return dataArr.filter((el, i) => {
      return dimsArr.every((dim) => Object.values(el).includes(dim))
    })
  }

  return result.map((row, i) => {
    return (
      <tr key={row.toString()+i.toString()+'rowHeader'}>

        {row.map((el, j) => (
          el ? <td 
            className='td header' 
            key={el.toString()+j.toString()+'header'}
            rowSpan={el ? getDimSpan(rowsArr, j) : 0}
          >
            {el}
          </td> : null
        ))}

        {colsMatrix.map((el, k) => {
          const value = findDataCell(data, [el, ...rowsMatrix[i]])[0]
            return (
              <td
                key={el.toString()+'cell'}
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
