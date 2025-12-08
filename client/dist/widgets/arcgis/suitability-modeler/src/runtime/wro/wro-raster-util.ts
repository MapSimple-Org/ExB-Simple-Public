/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { findColormapInfo, findColormapNameFromRasterColormap } from './wro-colormaps'
import { type ColormapInfo, ModelFactory, type ModelLayer, type RasterLayer, type RemapRange, type WroModel } from './wro-model'

function createColormapParams (options): any {
  if (!options) options = {}
  const args = {
    Raster: options.raster || '$$',
    Colormap: options.colormap || []
  }
  return {
    rasterFunction: 'Colormap',
    rasterFunctionArguments: args
  }
}

function createLocalParams (operation, options): any {
  if (!options) {
    options = {}
  }
  const args = {
    Operation: operation,
    ExtentType: 0,
    CellsizeType: 1,
    Rasters: options.rasters || []
  }
  const localFuncObject: any = {
    rasterFunction: 'Local',
    rasterFunctionArguments: args
  }
  if (options.outputPixelType) {
    localFuncObject.outputPixelType = options.outputPixelType
  }
  return localFuncObject
}

function createRemapParams (options: any): any {
  if (!options) options = {}
  const args = {
    Raster: options.Raster || '$$',
    UseTable: false,
    InputRanges: options.InputRanges || [],
    OutputValues: options.OutputValues || [],
    NoDataRanges: options.NoDataRanges || [],
    AllowUnmatched: true
  }
  return {
    rasterFunction: 'Remap',
    rasterFunctionArguments: args
  }
}

// combine arrays of remap range arguments
// into a single array of remap range objects for the local WroModel
export function createRemapRanges (inputRanges: number[], outputValues: number[],
  noDataRanges: number[], options: any): RemapRange[] {
  const remapRanges: RemapRange[] = []
  let hasValidLabels = false
  let labels: string[], noDataLabels: string[], sortBy: string
  if (options) {
    labels = options.labels
    noDataLabels = options.noDataLabels
    sortBy = options.sortBy
  }
  // check for and add input ranges and output values
  if (Array.isArray(inputRanges) && Array.isArray(outputValues) &&
      inputRanges.length === outputValues.length * 2) {
    hasValidLabels = (Array.isArray(labels) && labels.length === outputValues.length)
    outputValues.forEach((outputValue, index) => {
      const inputRangeMinIndex = index * 2
      const range = ModelFactory.newRemapRange()
      range.label = null
      range.inputMin = inputRanges[inputRangeMinIndex]
      range.inputMax = inputRanges[inputRangeMinIndex + 1]
      range.outputValue = outputValue
      range.originalOutputValue = outputValue
      if (hasValidLabels) {
        range.label = labels[index]
      } else {
        range.label = getRangeString(range.inputMin, range.inputMax)
      }
      remapRanges.push(range)
    })
  }
  // check for and add no data ranges
  if (Array.isArray(noDataRanges) && noDataRanges.length > 0) {
    hasValidLabels = (Array.isArray(noDataLabels) &&
      noDataLabels.length === noDataRanges.length / 2)
    noDataRanges.forEach((noDataRangeBound, index) => {
      // even numbered elements represent range min
      if (index % 2 === 0) {
        const range = ModelFactory.newRemapRange()
        range.label = null
        range.inputMin = noDataRangeBound
        range.inputMax = noDataRanges[index + 1]
        // NOTE: using 0 for no data range values
        range.outputValue = 0
        range.originalOutputValue = 0
        if (hasValidLabels) {
          range.label = noDataLabels[index]
        } else {
          range.label = getRangeString(range.inputMin, range.inputMax)
        }
        remapRanges.push(range)
      }
    })
  }
  if (remapRanges.length > 0) {
    if (sortBy) {
      // sort by property
      remapRanges.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
          return -1
        }
        if (a[sortBy] > b[sortBy]) {
          return 1
        }
        return 0
      })
    }
    return remapRanges
  } else {
    return undefined
  }
}

// loop through raster infos, and for each:
//   create a remap function object from input ranges / output values
//   wrap the remap function in a local multiply by weight
// and then create a sum function of the above
// wrap the sum in a round down with a converstion to U8
// finally return a colormap of the rounded down sum
function createWeightedSumParams (rasterInfos, colormap): any {
  const rasters = rasterInfos.map(rasterInfo => {
    const remapParams = createRemapParams(rasterInfo)
    return createLocalParams(3, {
      rasters: [
        remapParams,
        rasterInfo.weight
      ]
    })
  })

  // BUG-000167332 The suitability model widget isn't properly reclassifying the measurement scale based on
  // the assigned percentage influence. #19633
  // - there is no raster function to 'Round' values, just RoundUp and RoundDown,
  // - we use RoundUp (operation: 49), 9.00000000001 gets rounded up to 10,
  // - we'll subtract 0.5 prior to rounding up, this will more accurately simulate a 'Round'
  rasters.push(-0.5)

  const sumParams = createLocalParams(55, {
    rasters: rasters
  })
  const roundUpParams = createLocalParams(49, {
    rasters: [sumParams],
    outputPixelType: 'U8'
  })
  return createColormapParams({
    raster: roundUpParams,
    colormap: colormap
  })
}

// get a colormap (nested array), from a colormap definition object
function colormapInfoToColormap (colormapInfo: ColormapInfo): any {
  return colormapInfo.colors.map(colorInfo => {
    return [colorInfo.value].concat(colorInfo.rgb)
  })
};

// parse CSV-formatted range label string into distinct labels
// based on the RFC 4180 spec: <https://datatracker.ietf.org/doc/html/rfc4180>
function parseRangeLabels (csvString: string): string[] {
  csvString = csvString.trim()
  const labels: string[] = []
  let L: number = 0
  let withinQuotedValue: boolean = false

  for (let i = 0; i < csvString.length; i++) {
    const currChar = csvString[i]
    const nextChar = csvString[i + 1]
    labels[L] = labels[L] || ''

    if (currChar === '"' && nextChar === '"' && withinQuotedValue) {
      labels[L] += currChar
      ++i
      continue
    }
    if (currChar === '"') {
      withinQuotedValue = !withinQuotedValue
      continue
    }
    if (currChar === ',' && !withinQuotedValue) {
      ++L
      continue
    }
    labels[L] += currChar
  }

  return labels.map(label => label.trim())
}

export function featureToRasterLayer (feature: any): RasterLayer | null {
  // don't show forest fragmentation (Urban)
  try {
    if (feature.attributes &&
       (feature.attributes.Name === 'ForestFragmentation_US_USFS_2002') &&
       (feature.attributes.Title === 'Forest Fragmentation') &&
       (feature.attributes.OBJECTID === 49)) {
      // console.warn("******** Ignoring ForestFragmentation_US_USFS_2002");
      return null
    }
  } catch (ex0) {}

  const attr = feature.attributes
  let inputRanges: number[] = []
  let outputValues: number[] = []
  let noDataRanges: number[] = []
  let labels: string[] = []
  let noDataLabels: string[] = []
  let rasterLayer: RasterLayer | null = null
  if (attr) {
    rasterLayer = ModelFactory.newRasterLayer()
    rasterLayer.rasterLayerId = attr.OBJECTID
    rasterLayer.name = attr.Name
    rasterLayer.title = attr.Title
    rasterLayer.url = attr.Url
    rasterLayer.metadata = attr.Metadata
    if (attr.InputRanges && (typeof attr.InputRanges === 'string') &&
        attr.OutputValues && (typeof attr.OutputValues === 'string')) {
      // set remap ranges
      inputRanges = attr.InputRanges.split(',').map(val => parseFloat(val.trim()))
      outputValues = attr.OutputValues.split(',').map(val => parseInt(val.trim(), 10))
      if (attr.RangeLabels && (typeof attr.RangeLabels === 'string')) {
        labels = parseRangeLabels(attr.RangeLabels)
      }
    }
    if (attr.NoDataRanges && (typeof attr.NoDataRanges === 'string')) {
      noDataRanges = attr.NoDataRanges.split(',').map(val => parseFloat(val.trim()))
      if (attr.NoDataRangeLabels && (typeof attr.NoDataRangeLabels === 'string')) {
        noDataLabels = attr.NoDataRangeLabels.split(',').map(val => val.trim())
      }
    }
    rasterLayer.remapRanges = createRemapRanges(
      inputRanges, outputValues, noDataRanges, {
        labels: labels,
        noDataLabels: noDataLabels,
        sortBy: 'inputMin'
      }
    )
  }
  return rasterLayer
}

export function getRangeString (min: number, max: number): string {
  if (min === max) {
    return `${min}`
  } else {
    return `${min} - ${max}`
  }
}

export function modelToItemData (wroModel: WroModel): any {
  const rasterFunction = modelToRasterFunctionJson(wroModel)
  if (rasterFunction) {
    // let remapRangeLabels = {}, noDataRangeLabels = {};
    // for (let arg in rasterFunction["arguments"]) {
    //   if (arg.indexOf(this.argumentNamePrefixes.labels) === 0) {
    //     remapRangeLabels[arg] = rasterFunction["arguments"][arg];
    //     delete rasterFunction["arguments"][arg];
    //   } else if (arg.indexOf(this.argumentNamePrefixes.noDataLabels) === 0) {
    //     noDataRangeLabels[arg] = rasterFunction["arguments"][arg];
    //     delete rasterFunction["arguments"][arg];
    //   }
    // }
    // const itemData = {
    //   renderingRule: rasterFunction,
    //   remapRangeLabels: remapRangeLabels,
    //   noDataRangeLabels: noDataRangeLabels
    // }
    const itemData = {
      renderingRule: rasterFunction
    }
    return itemData
  }
}

export function modelToRasterFunctionJson (wroModel: WroModel): any {
  const layers = wroModel.modelLayers.filter(ml => {
    if (ml.selected && typeof ml.weight === 'number' && ml.weight > 0) {
      return true
    }
    return false
  })

  let cmap
  const rasterInfos = layers.map(ml => {
    const info = remapRangesToRasterFunctionArguments(ml.remapRanges)
    info.Raster = '$' + ml.rasterLayerId.toString()
    info.weight = ml.weight / 100
    return info
  })
  const cmapInfo: ColormapInfo = findColormapInfo(wroModel.colormapName)
  if (cmapInfo) {
    cmap = colormapInfoToColormap(cmapInfo)
  }
  const json = createWeightedSumParams(rasterInfos, cmap)
  // return new RasterFunction(json);
  return json
}

function rasterFunctionArgumentsToRemapRanges (rasterFunctionArguments): RemapRange[] {
  let remapRanges: RemapRange[]
  if (rasterFunctionArguments) {
    const opts = {
      inputRangesArgumentName: 'InputRanges',
      outputValuesArgumentName: 'OutputValues',
      noDataRangesArgumentName: 'NoDataRanges',
      labelsArgumentName: 'Labels',
      noDataLabelsArgumentName: 'NoDataLabels'
    }
    const inputRanges = rasterFunctionArguments[opts.inputRangesArgumentName]
    const outputValues = rasterFunctionArguments[opts.outputValuesArgumentName]
    const noDataRanges = rasterFunctionArguments[opts.noDataRangesArgumentName]
    const labels = rasterFunctionArguments[opts.labelsArgumentName]
    const noDataLabels = rasterFunctionArguments[opts.noDataLabelsArgumentName]

    remapRanges = createRemapRanges(inputRanges, outputValues, noDataRanges, {
      labels: labels,
      noDataLabels: noDataLabels,
      sortBy: 'inputMin'
    })
  }
  return remapRanges
}

function remapRangesToRasterFunctionArguments (remapRanges: RemapRange[]): any {
  if (!remapRanges) return
  const rasterFunctionArguments = {}
  const inputRanges: number[] = []
  const outputValues: number[] = []
  const noDataRanges: number[] = []
  const labels: string[] = []
  const noDataLabels: string[] = []
  const opts = {
    includeLabels: true,
    inputRangesArgumentName: 'InputRanges',
    outputValuesArgumentName: 'OutputValues',
    noDataRangesArgumentName: 'NoDataRanges',
    labelsArgumentName: 'Labels',
    noDataLabelsArgumentName: 'NoDataLabels'
  }
  remapRanges.forEach((remapRange) => {
    const label = remapRange.label || getRangeString(remapRange.inputMin, remapRange.inputMax)
    if (remapRange.outputValue) {
      // here outputValue === 0  will be treated as noDataRanges, thus listed at the bottom?
      inputRanges.push(remapRange.inputMin)
      inputRanges.push(remapRange.inputMax)
      outputValues.push(remapRange.outputValue)
      labels.push(label)
    } else {
      noDataRanges.push(remapRange.inputMin)
      noDataRanges.push(remapRange.inputMax)
      noDataLabels.push(label)
    }
  })
  if (outputValues.length > 0) {
    rasterFunctionArguments[opts.inputRangesArgumentName] = inputRanges
    rasterFunctionArguments[opts.outputValuesArgumentName] = outputValues
    if (opts.includeLabels) {
      rasterFunctionArguments[opts.labelsArgumentName] = labels
    }
  }
  if (noDataRanges.length > 0) {
    rasterFunctionArguments[opts.noDataRangesArgumentName] = noDataRanges
    if (opts.includeLabels) {
      rasterFunctionArguments[opts.noDataLabelsArgumentName] = noDataLabels
    }
  }
  return rasterFunctionArguments
}

export function renderingRuleToModel (wroModel: WroModel, renderingRule): void {
  let rasterFunctionArguments
  let colormapName

  // parse client-side functions
  // start w/ outtermost function (the rendering rule)
  let nextFunction = renderingRule
  rasterFunctionArguments = nextFunction.rasterFunctionArguments

  // check for colormap
  if (nextFunction.rasterFunction === 'Colormap') {
    // model.colormapDefinition = this.findColormapDefinition(rasterFunctionArguments.Colormap);
    const cm = rasterFunctionArguments.Colormap
    if (cm) {
      colormapName = findColormapNameFromRasterColormap(cm)
    }
    nextFunction = rasterFunctionArguments.Raster
    rasterFunctionArguments = nextFunction.rasterFunctionArguments
  }

  // check for round function
  if (nextFunction.rasterFunction === 'Local' &&
      rasterFunctionArguments.Operation === 49) {
    nextFunction = rasterFunctionArguments.Rasters[0]
    rasterFunctionArguments = nextFunction.rasterFunctionArguments
  } else if (nextFunction.rasterFunction === 'Local' &&
      rasterFunctionArguments.Operation === 48) {
    rasterFunctionArguments.Operation = 49
    nextFunction = rasterFunctionArguments.Rasters[0]
    rasterFunctionArguments = nextFunction.rasterFunctionArguments
  }

  // check for sum function
  if (nextFunction.rasterFunction === 'Local' &&
      rasterFunctionArguments.Operation === 55 &&
      rasterFunctionArguments.Rasters) {
    const olyrs = rasterFunctionArguments.Rasters.map(multiplyFunction => {
      if (multiplyFunction?.rasterFunctionArguments?.Rasters) {
        const olyr: any = {}
        multiplyFunction.rasterFunctionArguments.Rasters.forEach(raster => {
          if (isNaN(raster)) {
            // this is the remap function

            // get id
            olyr.id = parseInt(raster.rasterFunctionArguments.Raster.substr(1), 10)
            const rlyr = ModelFactory.findRasterLayer(wroModel, olyr.id)

            // get remap ranges
            olyr.remapRanges = rasterFunctionArgumentsToRemapRanges(
              raster.rasterFunctionArguments)
            if (rlyr?.remapRanges) {
              rlyr.remapRanges.forEach((rr: RemapRange, i: number) => {
                const rr2: RemapRange = olyr.remapRanges[i]
                if (rr2) rr2.label = rr.label
              })
            }
          } else {
            olyr.weight = raster * 100.00
          }
        })
        return olyr
      } else {
        return null
      }
    })
    olyrs.forEach(olyr => {
      if (olyr) {
        if (typeof olyr.id === 'number' && typeof olyr.weight === 'number' &&
            olyr.weight > 0 && olyr.weight <= 100) {
          const ml: ModelLayer = ModelFactory.findModelLayer(wroModel, olyr.id)
          if (ml) {
            ml.selected = true
            ml.weight = olyr.weight
            if (olyr.remapRanges) {
              ml.remapRanges = olyr.remapRanges
            }
          }
        }
      }
    })
    if (colormapName) {
      wroModel.colormapName = colormapName
    }
  }

  return null
}
