import React from 'react'
import {
  getDimSpan,
  renderValue
} from '../utils'

export const ColumnHeaders = ({
  colsArr,
  rowsArr,
}) => {
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
            className='tdv'
            key={el.toString()+i.toString()+'nullCross'}
          />
        ))}

        {colsHier.filter(el => el.level === i).map((el, j) => {
          const span = getDimSpan(colsArr, el.level)
          return <td
            key={el+j}
            className={`td header ${el.value === 'subtotal' ? 'tdv-total' : ''}`}
            colSpan={span}
          >{renderValue(el.value)}</td>
        })}
      </tr>
    )
  })
}