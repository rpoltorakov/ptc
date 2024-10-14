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
      return item[dim] === undefined ? 'subtotal' : item[dim]
    }).sort((a,b) => {
      if (typeof a === 'string') {
        return a.localeCompare(b)
      } else {
        return a-b
      }
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
  return value || value === 0 ? value : '\u00A0' // =nbsp
}

/*
  Получение размера span в зависимости от уровня вложенности
*/
export const getDimSpan = (arr, level, type, isSubtotalOn, value) => {
  
  // if (level === 0 && isSubtotalOn) {
  //   console.log("🚀 ~ level:", level)
  //   console.log("🚀 ~ arr:", arr)
  //   console.log("🚀 ~ remainder:", arr.map(el => el.filter(item => item !== 'subtotal')).slice(level+1))
  // }


  let remainder = arr.slice(level+1) // все что справа
  if (!remainder) {
    return 1
  } else {
    let result = 0

    // if (isSubtotalOn) {
    //   const remainderWithoutSubtotal = arr.map(el => el.filter(item => item !== 'subtotal')).slice(level+1)
    //   const resultWithoutSubtotal = remainderWithoutSubtotal.reduce((acc, el) => {return acc*el.length}, 1)
    //   result = 
    //   // строки как если бы сабтоталов не было + сабтотал на первое измерение справа
    //     resultWithoutSubtotal + 1 + 
    //   // если не последнее и не предпоследнее, то сабтотал на каждое значение первого измерения справа
    //     level < arr.length-2 ? 1 + 2

    // } else {
      result = remainder.reduce((acc, el) => {return acc*el.length}, 1)
  
      // если есть сабтоталы
      // if (arr.some(el => el.includes('subtotal')) && isSubtotalOn) {
      //   if (type === 'rows') {
      //     // нужно span уменьшить для всех уровней кроме последнего и предпоследнего
      //     result
      //   }
      // }
    // }

    return result
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
  Поиск подмассива в массиве
*/
export const findSubArray = (arr, subarr, fromIndex) => {
  var i = fromIndex >>> 0,
      subarrLength = subarr.length,
      l = arr.length + 1 - subarrLength;

  loop: for (; i<l; i++) {
    for (var j=0; j<subarrLength; j++)
      if (arr[i+j] !== subarr[j]) continue loop;
    return i;
  }
  return -1;
}

/*
  Функция собирания метрик из formData
*/
export const collectMetrics = (formDataMetrics, type) => {
  if (type === 'simple') {
    return formDataMetrics.map((metric) => {
      if (typeof metric === 'string') {
        return metric
      }
      if (metric.expressionType === 'SIMPLE') {
        if (metric.column) {
          return `${metric.aggregate}(${metric.column.column_name})`
        }
      }
      if (metric.expressionType === 'SQL') {
        return metric.label
      }
    })
  }
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
      if (metric.expressionType === 'SIMPLE') {
        return metric.aggregate
      }
    })))
  }
  if (type === 'fields') {
    return Array.from(new Set(formDataMetrics.map((metric) => {
      if (metric.expressionType === 'SIMPLE') {
        return metric.column.column_name
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
