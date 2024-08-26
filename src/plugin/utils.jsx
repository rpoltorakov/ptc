/*
  Получение уникальных значений измерений
  из массива данных
*/
export const getUniqueValues = (data, dims, isMetricsInCols, metrics) => {
  let uniqueCols = []
  dims.forEach((dim) => {
    const unique = [...new Set(data.map((item) => {
      return item[dim]
    }))]
  
    if (unique.length === 1 && unique[0] === undefined) return // не должны до сюда доходить
    if (unique.length === 1 && unique[0] !== undefined) {
      uniqueCols.push(unique ? [unique] : ['null']) // если столбец один - нужно положить его как unique=[[values]], иначе будет unique=[values]
      return 
    }
    uniqueCols.push(unique ? unique : 'null')
  })

  // Обработка выбора расположения метрик
  // Функция getUniqueValues должна вызываться для строк и столбцов с разным isMetricsInCols
  if (isMetricsInCols) {
    uniqueCols.push(metrics)
  }
  return uniqueCols
}

export const renderValue = (value) => {
  return value ? value : '\u00A0'
}

export const getDimSpan = (arr, level) => {
  let remainder = arr.slice(level+1)
  if (!remainder) {
    return 1
  } else {
    return remainder.reduce((acc, el) => {return acc*el.length}, 1)
  }
}

export const getMultiplicators = (ar) => {
  const lenArr = ar.map(el => el.length)
  const result = []

  for (let i = 0; i < lenArr.length; i++) {
    if (i === lenArr.length-1) {
      result.push(1)
    } else {
      let tempval = 1
      for (let j = i+1; j < lenArr.length; j++) {
        tempval *= lenArr[j] // 1*2*2
      }
      result.push(tempval)
    }
  }

  return result
}

