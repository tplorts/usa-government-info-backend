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


  function applyTransform (instanceData, transformsMap) {
    const { dataType, value } = instanceData
    if (dataType && dataType in transformsMap) {
      const transform = transformsMap[dataType]
      instanceData.value = transform(value)
    }
  }


  DataState.observe('before save', (ctx, next) => {
    const instanceData = ctx.instance || ctx.data
    instanceData.lastUpdated = new Date()
    applyTransform(instanceData, ValueTransformsIn)
    next()
  })


  DataState.observe('loaded', (ctx, next) => {
    applyTransform(ctx.data, ValueTransformsOut)
    next()
  })
}
