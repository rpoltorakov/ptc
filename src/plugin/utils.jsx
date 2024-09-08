/*
  Получение уникальных значений измерений
  из массива данных
*/
export const getUniqueValues = (
  data, dims, isMetricsInCols, metrics, subtotalsOn, extra, forCols
) => {  
  let uniqueCols = []
  dims.forEach((dim, i) => {
    const newAr = data.map((item) => {
      if (item[dim] === undefined) {
        console.log('!!! found item[dim]:', item[dim])
      }
      return item[dim] === undefined ? 'subtotal' : item[dim]
    }).sort((a, b) => { // сортировка, чтоб subtotal всегда был последним
      if (b === 'subtotal') {return -1}
    })
    const unique = [...new Set(newAr)] // удаление дубликатов

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

export const getDimSpanSubtotalRow = (arr, level) => {
  return arr[arr.length-1].length
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


/*
  Функция создания массива для сабтоталов
*/
export const getSubtotalsDims = (dims) => {
  /*
    Если есть массив dims[i] (например, строки) - то для получения сабтоталов
    нужно сделать запросы на данные с 
      groupbyRows = dims[i][0]
      groupbyRows = [dims[i][0], dims[i][1]]
      groupbyRows = [dims[i][0], dims[i][1], dims[i][2]]
    и тд
    Пример: 
      Нужны сабтоталы по строкам dims[1] = ['first_time_dev', 'developer_type']
      Тогда, нужно сделать два запроса:
        1 - с groupbyRows = ['first_time_dev']
        2 - с groupbyRows = ['first_time_dev', 'developer_type']
    
    Данная функция раскладывает ['first_time_dev', 'developer_type'] на
    ['first_time_dev'] и ['first_time_dev', 'developer_type']
  */
  return dims.map((el, i) => {
    return dims.slice(0, i+1)
  })
}

/*
  Поиск подмассива в массиве
*/
export const findSubArray = (arr, subarr, from_index) => {
  from_index = from_index || 0;

  var i, found, j;
  var last_check_index = arr.length - subarr.length;
  var subarr_length = subarr.length;

  position_loop:
  for (i = from_index; i <= last_check_index; ++i) {
      for (j = 0; j < subarr_length; ++j) {
          if (arr[i + j] !== subarr[j]) {
              continue position_loop;
          }
      }
      return i;
  }
  return -1;
};
