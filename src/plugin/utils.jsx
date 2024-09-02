/*
  Получение уникальных значений измерений
  из массива данных
*/
export const getUniqueValues = (data, dims, isMetricsInCols, metrics, metricsActive) => {
  let uniqueCols = []
  dims.forEach((dim, i) => {
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
    if (metricsActive) {
      uniqueCols.push(metrics)
    }
  }
  return uniqueCols
}

/*
  Проверка значения на null или undefined
*/
export const renderValue = (value) => {
  return value ? value : '\u00A0' // =nbsp
}

/*
  Получение размера span в зависимости от уровня вложенности
*/
export const getDimSpan = (arr, level) => {
  let remainder = arr.slice(level+1)
  if (!remainder) {
    return 1
  } else {
    return remainder.reduce((acc, el) => {return acc*el.length}, 1)
  }
}

/*
  Вспомогательная функция для алгоритмов построения колонок/столбцов
*/
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

/*
  Функция собирания метрик из formData
*/
export const collectMetrics = (formDataMetrics, type) => {
  if (type === 'def') {
    return formDataMetrics.map((metric) => {
      if (typeof metric === 'string') {
        return metric
      }
      return metric.label
    })
  }
  if (type === 'aggs') {
    return Array.from(new Set(formDataMetrics.map((metric) => {
      if (typeof metric === 'string') {
        return metric
      } 
      if (metric.expressionType === 'SIMPLE') {
        return metric.aggregate
      }
      if (metric.expressionType === 'SQL') {
        const field = metric.sqlExpression.match(/".*"/gi) ? metric.sqlExpression.match(/".*"/gi)[0] : '' 
        return metric.sqlExpression.replaceAll(field, '#')
        // return metric.sqlExpression
      }
    })))
  }
  if (type === 'fields') {
    return Array.from(new Set(formDataMetrics.map((metric) => {
      if (typeof metric === 'string') {
        return metric
      }
      if (metric.expressionType === 'SIMPLE') {
        return metric.column.column_name
      }
      if (metric.expressionType === 'SQL') {
        const matched = metric.sqlExpression.match(/".*"/gi)
        return matched ? matched[0].slice(1,-1) : 'fieldNotFound'
      }  
      
    })))
  }
}
