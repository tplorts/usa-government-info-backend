'use strict'

const { toNumber } = require('lodash')
const moment = require('moment')
const { log } = console



module.exports = function (DataState) {
  // In: transform values when inserting into database
  const ValueTransformsIn = {
    date: x => moment(x).utc().format(),
  }
  // Out: transform values when extracting from database
  const ValueTransformsOut = {
    date: str => moment(str),
    number: toNumber,
  }


  DataState.get = async function (key) {
    return DataState.findOne({ where: {key} })
  }

  DataState.getValue = async function (key) {
    const ds = await DataState.get(key)
    return ds ? ds.value : null
  }

  DataState.set = async function (key, value) {
    const ds = await DataState.get(key)
    if (ds) {
      ds.value = value
      ds.save()
    }
    return ds
  }


  DataState.initiate = async function (key, valueFn, dataType) {
    let state = await DataState.get(key)
    if (!state) {
      const value = valueFn()
      log(`initiating ${key} => ${value}`)
      state = await DataState.create({ key, value, dataType })
    }
    return state
  }



  DataState.observe('before save', (ctx, next) => {
    const instanceData = ctx.instance || ctx.data
    instanceData.lastUpdated = new Date()
    const { dataType, value } = instanceData
    if (dataType) {
      if (dataType in ValueTransformsIn) {
        const transform = ValueTransformsIn[dataType]
        instanceData.value = transform(value)
      }
    }
    next()
  })



  DataState.observe('loaded', (ctx, next) => {
    const d = ctx.data
    const { dataType, key, value } = d
    if (dataType) {
      if (dataType in ValueTransformsOut) {
        const transform = ValueTransformsOut[dataType]
        const newValue = transform(value)
        // log(`transformed ${key}: ${value} -> ${newValue} [${typeof newValue}]`)
        d.value = newValue
      } else {
        // log(`[DataState] unknown data type '${dataType}' for {${key}: ${value}}`)
      }
    }
    next()
  })
}
