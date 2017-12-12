'use strict'

const { toNumber } = require('lodash')
const moment = require('moment')
const { log } = console



module.exports = function (DataState) {
  DataState.initiate = async function (key, valueFn, dataType) {
    let state = await DataState.findOne({ where: {key} })
    if (!state) {
      const value = valueFn()
      log(`initiating ${key} => ${value}`)
      state = await DataState.create({ key, value, type: dataType })
    }
    return state
  }


  const ValueTransformsIn = {
    date: x => moment(x).utc().format(),
  }

  DataState.observe('before save', (ctx, next) => {
    const instanceData = ctx.instance || ctx.data
    instanceData.lastUpdated = new Date()
    const { type: dataType, value } = instanceData
    if (dataType) {
      if (dataType in ValueTransformsIn) {
        const transform = ValueTransformsIn[dataType]
        instanceData.value = transform(value)
      }
    }
    next()
  })


  const ValueTransformsOut = {
    date: str => new Date(str),
    number: toNumber,
  }

  DataState.observe('loaded', (ctx, next) => {
    const d = ctx.data
    const { type: dataType, key, value } = d
    if (dataType) {
      if (dataType in ValueTransformsOut) {
        const transform = ValueTransformsOut[dataType]
        d.value = transform(value)
      } else {
        log(`[DataState] unknown data type '${dataType}' for {${key}: ${value}}`)
      }
    }
    next()
  })
}
