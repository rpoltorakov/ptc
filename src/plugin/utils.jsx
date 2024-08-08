export const getUniqueValues = (data, dims) => {
  let uniqueCols = []
  dims.map((dim) => {
    const unique = [...new Set(data.map((item) => item[dim]))]
    if (unique.length === 1 && unique[0] === undefined) return
    if (unique.length === 1 && unique[0] !== undefined) {
      uniqueCols.push([unique])
      return
    }
    uniqueCols.push(unique)
  })
  return uniqueCols
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

