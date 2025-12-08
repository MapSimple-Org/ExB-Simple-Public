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

import { getDefaultColormapName } from './wro-colormaps'
import type { WroService } from './wro-service'

export interface ColorInfo {
  label: string
  value: number
  rgb: number[]
}

export interface ColormapInfo {
  label: string
  name: string
  colors: ColorInfo[]
}

export interface Issue {
  detail: string
  message: string
}

export interface ModelLayer {
  rasterLayerId: number
  remapOpen: boolean
  remapRanges: RemapRange[]
  selected: boolean
  title: string
  weight: number
}

export interface RasterLayer {
  metadata: any
  name: string
  rasterLayerId: number
  remapRanges: RemapRange[]
  title: string
  url: string
}

export interface RemapRange {
  inputMax: number
  inputMin: number
  label: string
  originalOutputValue: number
  outputValue: number
}

export interface WroModel {
  activePanel: string
  colormapName: string
  lastRun: string
  loadErrors: Issue[]
  mapLayerId: string
  modelLayers: ModelLayer[]
  rasterLayers: RasterLayer[]
  serviceUrl: string
}

export interface WroStatus {
  activePanel: string
  isModelLoading: boolean
  isModelRunning: boolean
  themeId: string
  viewId: string
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */

export class ModelController {
  // _subscribers = [];

  clear (wroModel: WroModel): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    wroModel.colormapName = getDefaultColormapName()
    if (wroModel.modelLayers) {
      wroModel.modelLayers.forEach((ml) => {
        ml.selected = false
        ml.remapOpen = false
        ml.weight = null
        const rasterLayer: RasterLayer = ModelFactory.findRasterLayer(wroModel, ml.rasterLayerId)
        if (rasterLayer?.remapRanges) {
          ml.remapRanges = ModelFactory.cloneRemapRanges(rasterLayer.remapRanges)
        }
      })
    }
    wroModel.activePanel = 'layers-panel'
    this.onModelChange(wroModel, true)
    return wroModel
  }

  isLayerSelected (wroModel: WroModel, rasterLayerId: number): boolean {
    const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
    return !!(modelLayer?.selected)
  }

  isValid (wroModel: WroModel): boolean {
    let total = 0
    if (wroModel?.modelLayers) {
      wroModel.modelLayers.forEach(ml => {
        if (ml.selected) {
          if (typeof ml.weight === 'number') {
            total += ml.weight
          }
        }
      })
    }
    return (total === 100)
  }

  // onModelChange(wroModel: WroModel) {
  //   this._subscribers.forEach(callback => {
  //     callback(wroModel);
  //   });
  // }

  // overriden by widget.tsx
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onModelChange (wroModel: WroModel, wasCleared?: boolean): any {}

  // overriden by widget.tsx
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStatusChange (wroStatus: WroStatus): any {}

  selectLayer (wroModel: WroModel, rasterLayerId: number, selected: boolean): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
    const considerReset = true
    const reset = considerReset && !selected
    if (modelLayer && reset) {
      const rasterLayer: RasterLayer = ModelFactory.findRasterLayer(wroModel, rasterLayerId)
      if (rasterLayer?.remapRanges) {
        modelLayer.remapRanges = ModelFactory.cloneRemapRanges(rasterLayer.remapRanges)
      }
      modelLayer.remapOpen = false
      modelLayer.weight = null
    }
    if (modelLayer) modelLayer.selected = !!selected
    this.onModelChange(wroModel)
    return wroModel
  }

  selectAllNoneLayer (wroModel: WroModel, rasterLayers: RasterLayer[], selected: boolean): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    rasterLayers.forEach((rl: RasterLayer) => {
      const rasterLayerId = rl.rasterLayerId
      const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
      const considerReset = true
      const reset = considerReset && !selected
      if (modelLayer && reset) {
        const rasterLayer: RasterLayer = ModelFactory.findRasterLayer(wroModel, rasterLayerId)
        if (rasterLayer?.remapRanges) {
          modelLayer.remapRanges = ModelFactory.cloneRemapRanges(rasterLayer.remapRanges)
        }
        modelLayer.remapOpen = false
        modelLayer.weight = null
      }
      if (modelLayer) modelLayer.selected = !!selected
    })
    this.onModelChange(wroModel)
    return wroModel
  }

  setActivePanel (wroModel: WroModel, activePanel: string): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    wroModel.activePanel = activePanel
    this.onModelChange(wroModel)
    return wroModel
  }

  setColormapName (wroModel: WroModel, colormapName: string): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    wroModel.colormapName = colormapName
    this.onModelChange(wroModel)
    return wroModel
  }

  setMapLayerId (wroModel: WroModel, mapLayerId: string): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    wroModel.mapLayerId = mapLayerId
    wroModel.lastRun = this.stringifyCriteria(wroModel)
    this.onModelChange(wroModel)
    return wroModel
  }

  setRemapOpen (wroModel: WroModel, rasterLayerId: number, remapOpen: boolean): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
    if (modelLayer) modelLayer.remapOpen = !!remapOpen
    this.onModelChange(wroModel)
    return wroModel
  }

  setRemapOutputValue (wroModel: WroModel, rasterLayerId: number, index: number, outputValue: number): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
    if (modelLayer) modelLayer.remapRanges[index].outputValue = outputValue
    this.onModelChange(wroModel)
    return wroModel
  }

  setWeight (wroModel: WroModel, rasterLayerId: number, weight: number): WroModel {
    wroModel = ModelFactory.cloneModel(wroModel)
    const modelLayer: ModelLayer = ModelFactory.findModelLayer(wroModel, rasterLayerId)
    if (modelLayer) modelLayer.weight = weight
    this.onModelChange(wroModel)
    return wroModel
  }

  stringifyCriteria (wroModel: WroModel): string {
    const mlyrs: any = []
    if (wroModel.modelLayers) {
      wroModel.modelLayers.forEach((ml) => {
        if (ml.selected && (typeof ml.weight === 'number') && (ml.weight > 0)) {
          mlyrs.push({
            remapRanges: ml.remapRanges,
            weight: ml.weight
          })
        }
      })
    }
    return JSON.stringify({
      colormapName: wroModel.colormapName,
      mapLayerId: wroModel.mapLayerId,
      modelLayers: mlyrs,
      serviceUrl: wroModel.serviceUrl
    })
  }

  // setViewId(wroStatus: WroStatus, viewId: string): WroStatus {
  //   wroStatus = ModelFactory.cloneStatus(wroStatus);
  //   wroStatus.viewId = viewId;
  //   this.onStatusChange(wroStatus);
  //   return wroStatus;
  // }

  // subscribe(callback: (wroModel: WroModel) => void) {
  //   const idx = this._subscribers.indexOf(callback);
  //   if (idx === -1) {
  //     this._subscribers.push(callback);
  //   }
  // }

  // unsubscribe(callback: (wroModel: WroModel) => void) {
  //   const idx = this._subscribers.indexOf(callback);
  //   if (idx !== -1) {
  //     this._subscribers.splice(idx, 1);
  //   }
  // }
}

export class ModelFactory {
  nonStaticProperty: string // ts-standard requires something non-static

  static cloneModel (wroModel: WroModel): WroModel {
    wroModel = JSON.parse(JSON.stringify(wroModel))
    return wroModel
  }

  static cloneRasterLayers (rasterLayers: RasterLayer[]): RasterLayer[] {
    rasterLayers = JSON.parse(JSON.stringify(rasterLayers))
    return rasterLayers
  }

  static cloneRemapRanges (remapRanges: RemapRange[]): RemapRange[] {
    remapRanges = JSON.parse(JSON.stringify(remapRanges))
    return remapRanges
  }

  static cloneStatus (wroStatus: WroStatus): WroStatus {
    wroStatus = JSON.parse(JSON.stringify(wroStatus))
    return wroStatus
  }

  static findModelLayer (wroModel: WroModel, rasterLayerId: number): ModelLayer {
    let modelLayer: ModelLayer
    if (wroModel.modelLayers) {
      wroModel.modelLayers.some((ml) => {
        if (ml.rasterLayerId === rasterLayerId) {
          modelLayer = ml
        }
        return !!modelLayer
      })
    }
    return modelLayer
  }

  static findRasterLayer (wroModel: WroModel, rasterLayerId: number): RasterLayer {
    let rasterLayer: RasterLayer
    if (wroModel.rasterLayers) {
      wroModel.rasterLayers.some((rl) => {
        if (rl.rasterLayerId === rasterLayerId) {
          rasterLayer = rl
        }
        return !!rasterLayer
      })
    }
    return rasterLayer
  }

  static initModel (wroService: WroService, loadErrors: Issue[]): WroModel {
    const wroModel: WroModel = this.newWroModel()
    wroModel.serviceUrl = wroService.serviceUrl
    if (loadErrors && loadErrors.length > 0) {
      wroModel.loadErrors = JSON.parse(JSON.stringify(loadErrors))
    }
    if (wroService?.rasterLayers) {
      wroModel.rasterLayers = this.cloneRasterLayers(wroService.rasterLayers)
      wroModel.rasterLayers.forEach(rl => {
        const ml = this.newModelLayer()
        ml.rasterLayerId = rl.rasterLayerId
        ml.title = rl.title
        if (rl.remapRanges) {
          ml.remapRanges = this.cloneRemapRanges(rl.remapRanges)
        }
        if (ml.remapRanges && ml.remapRanges.length > 0) {
          wroModel.modelLayers.push(ml)
        }
      })
    }
    return wroModel
  }

  static newIssue (): Issue {
    const issue: Issue = {
      detail: null,
      message: null
    }
    return issue
  }

  static newModelLayer (): ModelLayer {
    const modelLayer: ModelLayer = {
      rasterLayerId: null,
      remapOpen: false,
      remapRanges: [],
      selected: false,
      title: null,
      weight: null
    }
    return modelLayer
  }

  static newRasterLayer (): RasterLayer {
    const rasterLayer: RasterLayer = {
      metadata: null,
      name: null,
      rasterLayerId: null,
      remapRanges: [],
      title: null,
      url: null
    }
    return rasterLayer
  }

  static newRemapRange (): RemapRange {
    const remapRange: RemapRange = {
      inputMax: null,
      inputMin: null,
      label: null,
      originalOutputValue: null,
      outputValue: null
    }
    return remapRange
  }

  static newWroModel (): WroModel {
    const wroModel: WroModel = {
      activePanel: null,
      colormapName: getDefaultColormapName(),
      lastRun: null,
      loadErrors: [],
      mapLayerId: null,
      modelLayers: [],
      rasterLayers: [],
      serviceUrl: null
    }
    return wroModel
  }

  static newWroStatus (): WroStatus {
    const wroModel: WroStatus = {
      activePanel: null,
      isModelLoading: false,
      isModelRunning: false,
      themeId: null,
      viewId: null
    }
    return wroModel
  }
}
