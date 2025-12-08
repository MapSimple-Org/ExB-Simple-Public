/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core'
import { isEqual } from 'lodash-es'
import type { JimuMapView } from 'jimu-arcgis'
import BuildingExplorer from 'esri/widgets/BuildingExplorer'
import BuildingExplorerViewModel from 'esri/widgets/BuildingExplorer/BuildingExplorerViewModel'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { getBuildingSceneLayersByLayerViewIds } from '../../../common/utils'
import { applyFilterOnDs } from './ds-helpers/ds-utils'
import { /*hasCacheInfo,*/ saveWidgetStates, clearToInit, /*restoreWidgetStates,*/ type WidgetStatesCache } from './ds-helpers/cache-utils'
import { setLayersMode } from './ds-helpers/layers-utils'
import { type MapSetting, type IMConfig, LayerMode } from '../../../config'

export enum UpdateReason {
  // map
  Init = 'init',
  SwitchMap = 'switchMap',
  SettingChange = 'settingChange',
  // layers
  LayersChange = 'layersChange',
  // level/phase
  LevelChange = 'levelChange',
  LevelEnabledOn = 'levelEnabledOn',
  LevelEnabledOff = 'levelEnabledOff',
  PhaseChange = 'phaseChange'
}

export interface BuildingExplorerProps {
  jimuMapView: JimuMapView
  settingConfig: IMConfig
  mapConfig: ImmutableObject<MapSetting>
  selectedLayerViewIds: string[]
  widgetId: string
  onUpdated?: () => void
}

export const useBuildingExplorer = (props: BuildingExplorerProps) => {
  const { onUpdated } = props
  const widgetRef = React.useRef<__esri.BuildingExplorer>(null)

  // Ref for the params update in API call back fun
  const propsRef = React.useRef<BuildingExplorerProps>(null)
  propsRef.current = props

  const _widgetStatesRef = React.useRef<WidgetStatesCache>(null)

  const _clearToInit = () => {
    widgetRef.current?.when(() => { // after widget init
      clearToInit({ widgetStatesRef: _widgetStatesRef, dsID: propsRef.current.jimuMapView?.dataSourceId })
    })
  }

  const _recordInit = React.useCallback(() => {
    const isInitFlag = true
    // 1. clear to init
    _clearToInit()
    // 2. record init cache
    widgetRef.current?.when(() => {
      saveWidgetStates(propsRef.current.selectedLayerViewIds, (propsRef.current.mapConfig?.layerMode || LayerMode.Single), isInitFlag,
        { widgetStatesRef: _widgetStatesRef, dsID: propsRef.current.jimuMapView?.dataSourceId, vm: widgetRef.current.viewModel }
      )
    })
  }, [])

  // 2 cache for current
  const _saveWidgetStates = (reason: string) => {
    //console.log('111 record reason==>' + reason)
    const isInitFlag = false
    saveWidgetStates(propsRef.current.selectedLayerViewIds, (propsRef.current.mapConfig?.layerMode || LayerMode.Single), isInitFlag,
      { widgetStatesRef: _widgetStatesRef, dsID: propsRef.current.jimuMapView?.dataSourceId, vm: widgetRef.current.viewModel }
    )
  }

  // const _restoreWidgetStates = (initFlag: boolean) => {
  //   restoreWidgetStates(propsRef.current.selectedLayerViewIds, (propsRef.current.mapConfig?.layerMode || LayerMode.Single), initFlag,
  //     { widgetStatesRef: _widgetStatesRef, dsID: propsRef.current.jimuMapView?.dataSourceId, vm: widgetRef.current.viewModel }
  //   )
  // }

  // update filters
  const applyFilter = React.useCallback(() => {
    const vm = widgetRef.current.viewModel
    applyFilterOnDs(vm, propsRef.current.settingConfig.general.applyFilterOnDs,
      {
        selectedLayerViewIds: propsRef.current.selectedLayerViewIds,
        jimuMapView: propsRef.current.jimuMapView,
        widgetId: propsRef.current.widgetId
      })
  }, [])

  // BE widget
  // visibleElements
  const _getVisibleElementsConfig = (mapConfig: ImmutableObject<MapSetting>) => {
    const visibleElementsObj = {
      visibleElements: {
        levels: (mapConfig?.enableLevel ?? true),
        phases: (mapConfig?.enablePhase ?? true),
        disciplines: mapConfig?.enableCtegories ?? true
      }
    }

    return visibleElementsObj
  }

  // update VM
  const _updateVMParams = React.useCallback((vm: BuildingExplorerViewModel, reason: UpdateReason) => {
    // 1.layers
    const targetLayers = getBuildingSceneLayersByLayerViewIds(propsRef.current.selectedLayerViewIds, propsRef.current.jimuMapView)
    // restore other layers to 'overview' mode
    if (!isEqual(widgetRef.current.layers, targetLayers)) {
      setLayersMode(widgetRef.current.layers, 'overview', propsRef.current.jimuMapView)
    }
    // set widget layers
    widgetRef.current.layers = targetLayers
    // set target layers to 'fullModel' mode
    setLayersMode(targetLayers, 'fullModel', propsRef.current.jimuMapView)

    // 2.send filters immediately, when setting change
    if ([UpdateReason.SettingChange].includes(reason) && propsRef.current.settingConfig.general.applyFilterOnDs) {
      applyFilter()
    }

    //2. SwitchMap
    // const hasCache = hasCacheInfo({ widgetStatesRef: _widgetStatesRef, dsID: propsRef.current.jimuMapView?.dataSourceId, vm: widgetRef.current.viewModel })
    // if ([UpdateReason.SwitchMap].includes(reason)) {
    //   if (hasCache) {
    //     reactiveUtils.whenOnce(() => ((((vm.level as any).state) === 'ready') || ((vm.phase as any).state === 'ready')))
    //       .then(() => {
    //         setTimeout(() => {
    //           _restoreWidgetStates(false)
    //         }, 100)
    //       })// widget set level/phase first, then restore by EXB
    //   } else {
    //     _saveWidgetStates(reason) // default map
    //   }
    // }

    // in Multiple mode, change layers, use last cache
    // if (hasCache && ([UpdateReason.LayersChange].includes(reason))) {
    //   //_restoreWidgetStates(false)
    //   if (hasCache) {
    //     reactiveUtils.whenOnce(() => ((((vm.level as any).state) === 'ready') || ((vm.phase as any).state === 'ready')))
    //       .then(() => {
    //         setTimeout(() => {
    //           _restoreWidgetStates(false)
    //         }, 100)
    //       })// widget set level/phase first, then restore by EXB
    //   }
    // }

    //5. SettingChange: level/phase (order at the end)
    // if ([UpdateReason.Init, UpdateReason.SettingChange].includes(reason)) {
    //   const layerMode = propsRef.current.mapConfig?.layerMode ?? LayerMode.Single
    //   if (layerMode === LayerMode.Single) {
    //     // 5.1. single mode

    //     // use initLevel/initPhase
    //     _restoreWidgetStates(true)
    //     //
    //   } else if (layerMode === LayerMode.Multiple) {
    //     // 5.2. multi mode
    //     // 5.2.1 level
    //     if (propsRef.current.mapConfig?.level?.allowedValues) {
    //       widgetRef.current.viewModel.level.set('allowedValues', propsRef.current.mapConfig.level?.allowedValues.asMutable())
    //     }
    //     // 5.2.2 phase
    //     if (propsRef.current.mapConfig?.phase?.allowedValues) {
    //       widgetRef.current.viewModel.phase.set('allowedValues', propsRef.current.mapConfig.phase?.allowedValues.asMutable())
    //     }
    //     // Set level/phase from setting
    //     const level = propsRef.current.mapConfig?.level
    //     reactiveUtils.whenOnce(() => (vm.state === 'ready')).then(() => {
    //       setTimeout(() => {
    //         const noLevelValue = (level?.defaultValue === '' || (typeof level?.defaultValue === 'undefined'))
    //         if (noLevelValue) {
    //           vm.level.clear()
    //         } else {
    //           vm.level.select(level.defaultValue)
    //         }
    //       }, 200)
    //       // const label00 = vm.level.getValueLabel(0)
    //       // const label01 = vm.level.getValueLabel(1)
    //       // console.log('label00=>' + label00)
    //       // console.log('label01=>' + label01)
    //     })

    //     const phase = propsRef.current.mapConfig?.phase
    //     reactiveUtils.whenOnce(() => (vm.state === 'ready')).then(() => {
    //       setTimeout(() => {
    //         const noPhaseValue = (phase?.defaultValue === '' || (typeof phase?.defaultValue === 'undefined'))
    //         if (noPhaseValue) {
    //           vm.phase.clear()
    //         } else {
    //           vm.phase.select(phase.defaultValue)
    //         }
    //       }, 200)
    //       // const label10 = vm.phase.getValueLabel(0)
    //       // const label11 = vm.phase.getValueLabel(1)
    //       // console.log('label10=>' + label10)
    //       // console.log('label11=>' + label11)
    //     })
    //     //}
    //   }
    // }
  }, [applyFilter])

  // listeners for VM
  const _registerListeners = React.useCallback((vm: BuildingExplorerViewModel, reason: UpdateReason) => {
    // 1. listening layers change immediately (for the first layer change)
    // in layerMode.Multiple: should keep level/phase, when layers change
    // if (propsRef.current.mapConfig?.layerMode === LayerMode.Multiple) { // switchMap
    //   reactiveUtils.whenOnce(() => ((vm.layers as any).updating === false)).then(() => {
    //     //console.log('==>layers.layersUpdated: ' + layersUpdating)
    //     reactiveUtils.whenOnce(() => (vm.state === 'ready')).then(() => {
    //       console.log('==> !!!!!!!!! _restoreWidgetState ')
    //       _restoreWidgetStates(false) // keep the same filter, in Multiple mode
    //     })
    //   })
    // }

    // 2. add others listeners, after vm is ready
    reactiveUtils.whenOnce(() => (vm.state === 'ready')).then(() => {
      // when change setting's layer config, need to clear VM
      if (reason === UpdateReason.Init || (_widgetStatesRef.current === null)) {
        // Record the initial status of BuildingExplorer corresponding to all layers
        _recordInit()
        //_saveWidgetStates(UpdateReason.Init)
        applyFilter()
      }

      // update filters cache, for every steps
      // 2.1 level
      reactiveUtils.watch(() => ([(vm.level as any).state, vm.level.value, vm.level.enabled, vm.level.allowedValues]), ([state, levelValue, enabled, allowedValues]) => {
        if (state === 'ready') {
          // console.log('==>level.value: ' + levelValue)
          // console.log('==>level.enabled:' + enabled)
          // console.log('==>level.allowedValues: ' + allowedValues)

          if (enabled) {
            _saveWidgetStates(UpdateReason.LevelEnabledOn)
          } else {
            _saveWidgetStates(UpdateReason.LevelEnabledOff)
          }
          applyFilter()
        }
      })
      // 2.2 phase
      reactiveUtils.watch(() => ([(vm.phase as any).state, vm.phase.value, vm.phase.allowedValues]), ([state, phaseValue, allowedValues]) => {
        if (state === 'ready') {
          // console.log('==>phase.value: ' + phaseValue)
          // console.log('==>phase.allowedValues: ' + allowedValues)
          _saveWidgetStates(UpdateReason.PhaseChange)
          applyFilter()
        }
      })
    })
  }, [applyFilter, _recordInit])

  // params:
  // 1. domRef: dynamic dom position
  // 2. isNeedToReInit: when change setting's layer config, need to clear VM
  const _updateWidget = React.useCallback((domRef: HTMLDivElement, reason: UpdateReason) => {
    if (!propsRef.current.jimuMapView) {
      return
    }

    // options
    let options = {
      container: domRef,
      view: propsRef.current.jimuMapView.view as __esri.SceneView,
      viewModel: null,
      layers: []
    }
    const viewModelOptions: __esri.BuildingExplorerViewModelProperties = {
      view: propsRef.current.jimuMapView.view as __esri.SceneView
    }
    const mapConfig = propsRef.current.mapConfig
    if (propsRef.current.mapConfig) {
      options = Object.assign(options, _getVisibleElementsConfig(mapConfig)) // visibleElements
    }
    options.viewModel = new BuildingExplorerViewModel(viewModelOptions)
    widgetRef.current = new BuildingExplorer(options)

    const vm = widgetRef.current.viewModel
    // listeners for hacks
    _registerListeners(vm, reason)

    // do options update
    _updateVMParams(vm, reason)

    // callbacks
    widgetRef.current.when(() => {
      if (onUpdated) {
        onUpdated()
      }
      _updateVMParams(widgetRef.current.viewModel, UpdateReason.Init)
    })

    return widgetRef.current
  }, [onUpdated, _registerListeners,
    _updateVMParams])

  // update
  React.useEffect(() => {
    widgetRef.current?.when(() => { // after widget init
      _updateVMParams(widgetRef.current.viewModel, UpdateReason.LayersChange)
    })
  }, [props.selectedLayerViewIds, // runtime selected layers changed
    _updateVMParams
  ])
  React.useEffect(() => {
    widgetRef.current?.when(() => { // after widget init
      //_clearToInit()
      // visibleElements
      widgetRef.current.visibleElements = (_getVisibleElementsConfig(propsRef.current.mapConfig)).visibleElements
      // layers. level, phase
      _updateVMParams(widgetRef.current.viewModel, UpdateReason.SettingChange)
    })
  }, [props.settingConfig, // setting config changed
    _updateVMParams
  ])

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const _destroyWidget = React.useCallback(() => {
  }, [])

  // export interfaces
  return {
    // ref
    buildingExplorerRef: widgetRef.current,
    // update
    updateBuildingExplorerWidget: _updateWidget,
    // remove
    destroyBuildingExplorerWidget: _destroyWidget,
    // clear
    clearToInit: _clearToInit
  }
}
