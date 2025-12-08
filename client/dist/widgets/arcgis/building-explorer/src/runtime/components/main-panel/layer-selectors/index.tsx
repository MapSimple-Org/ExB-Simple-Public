/** @jsx jsx */
import { React, jsx, type ImmutableObject } from 'jimu-core'
import { type JimuMapView, zoomToUtils, type JimuLayerView } from 'jimu-arcgis'
import { isEqual } from 'lodash-es'
import { SingleModeSelector } from './single-mode-selector'
import { getBuildingLayerViews, isLayerConfigNone, getBuildingSceneLayersByLayerViewIds } from '../../../../common/utils'
import { type MapSetting, type GeneralConfig, LayerMode } from '../../../../config'

export interface Props {
  generalConfig: GeneralConfig
  mapConfig: ImmutableObject<MapSetting>
  jimuMapView: JimuMapView
  // layers
  selectedLayerViewIdsState: string[]
  onLayerSelectChanged: (layers: string[]) => void
}

export const LayerSelectors = React.memo((props: Props) => {
  // selected layers
  const [_selectedLayerViewsStates, setSelectedLayerViewsStates] = React.useState<string[]>(props.selectedLayerViewIdsState ?? [])
  const _selectedLayerViewsRef = React.useRef<string[]>([])
  _selectedLayerViewsRef.current = _selectedLayerViewsStates

  // layers
  const [allVisibleBuildingLayerViewsStates, setAllVisibleBuildingLayersStates] = React.useState<JimuLayerView[]>([])
  // for add-data/remove-data ,#19024
  React.useEffect(() => {
    //1. init
    setAllVisibleBuildingLayersStates(getBuildingLayerViews(props.jimuMapView))

    //2. handlers
    //2.1 add
    const jimuLayerViewCreatedListener = (newJimuLayerView: JimuLayerView) => {
      setAllVisibleBuildingLayersStates(getBuildingLayerViews(props.jimuMapView))
    }
    props.jimuMapView?.addJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
    //2.2 remove
    const jimuLayerViewRemovedListener = (removedJimuLayerView: JimuLayerView) => {
      setAllVisibleBuildingLayersStates(getBuildingLayerViews(props.jimuMapView))
      if (removedJimuLayerView.id === _selectedLayerViewsRef.current[0]) {
        setSelectedLayerViewsStates(['']) // if the layer is being operated, select None
      }
    }
    props.jimuMapView?.addJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)

    return () => {
      props.jimuMapView?.removeJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
      props.jimuMapView?.removeJimuLayerViewRemovedListener(jimuLayerViewCreatedListener)
    }
  }, [props.jimuMapView])

  // cache
  const _layersCacheByDsIDRef = React.useRef<Map<string, string[]>>(null)
  const _cacheLayers = React.useCallback((selectedLayerViews: string[]): boolean => {
    let skipZoomToFlag = false
    if (_layersCacheByDsIDRef.current === null) {
      skipZoomToFlag = true // skip the first time
      _layersCacheByDsIDRef.current = new Map()
    }
    _layersCacheByDsIDRef.current.set(_jimuMapViewRef?.current?.dataSourceId, selectedLayerViews) // record

    return skipZoomToFlag
  }, [])

  // zoom
  const _jimuMapViewRef = React.useRef<JimuMapView>(null)
  _jimuMapViewRef.current = props.jimuMapView
  const _zoomToLayers = React.useCallback((selectedLayerViews: string[]) => {
    const skipZoomToFlag = _cacheLayers(selectedLayerViews)

    if (props.generalConfig.zoomToLayer && !skipZoomToFlag) {
      const layers = getBuildingSceneLayersByLayerViewIds(selectedLayerViews, _jimuMapViewRef?.current)
      const zoomTargets = layers?.toArray()
      if (zoomTargets && zoomTargets.length > 0) { // skip [] targets
        zoomToUtils.zoomTo(_jimuMapViewRef?.current?.view, zoomTargets, {})
      }
    }
  }, [props.generalConfig.zoomToLayer,
    _cacheLayers
  ])

  //const layersOnLoad = props.mapConfig?.layersOnLoad?.asMutable()
  // onchange
  // React.useEffect(() => {
  //   console.log('LS-111 _selectedLayerViewsStates changed:==> ' + _selectedLayerViewsStates)
  // }, [_selectedLayerViewsStates])
  // React.useEffect(() => {
  //   console.log('LS-222 props.mapConfig?.layerMode changed:==> ' + props.mapConfig?.layerMode)
  // }, [props.mapConfig?.layerMode])
  // React.useEffect(() => {
  //   console.log('LS-333 props.mapConfig?.layersOnLoad changed:==> ' + props.mapConfig?.layersOnLoad)
  // }, [props.mapConfig?.layersOnLoad])

  // layers selectors change
  const { onLayerSelectChanged } = props
  React.useEffect(() => {
    _zoomToLayers(_selectedLayerViewsStates)
    onLayerSelectChanged(_selectedLayerViewsStates)
  }, [_selectedLayerViewsStates, //changes
    _zoomToLayers, onLayerSelectChanged])

  // config change
  React.useEffect(() => {
    // 1. re init: use setting's layersOnLoad
    const layersOnLoad = props.mapConfig?.layersOnLoad
    const isEmptyConfigFlag = isLayerConfigNone(layersOnLoad)
    let layers = []
    if (isEmptyConfigFlag) {
      layers = []
    } else {
      layers = layersOnLoad.asMutable()
    }

    setSelectedLayerViewsStates(layers)
  }, [
    // setting changed list start
    props.mapConfig?.layerMode,
    props.mapConfig?.layersOnLoad,
    // setting changed list end
    props.jimuMapView?.dataSourceId])

  // map change
  React.useEffect(() => {
    const cachedSelectedLayersForThisDsID = _layersCacheByDsIDRef.current?.get(props.jimuMapView?.dataSourceId)
    if (!cachedSelectedLayersForThisDsID) {
      // 1. init (no cache)
    } else if (cachedSelectedLayersForThisDsID) {
      // 2. update
      setSelectedLayerViewsStates(cachedSelectedLayersForThisDsID)
    }
  }, [props.jimuMapView?.dataSourceId])// changed

  // LayerSelectors
  // 1. Single layer mode
  const getSingleModeDefaultValue = () => {
    const layersOnLoad = (props.mapConfig?.layersOnLoad && props.mapConfig?.layersOnLoad[0]) || ''

    const value = (props.selectedLayerViewIdsState && props.selectedLayerViewIdsState[0]) ?? // runtime
      layersOnLoad// configs

    return value
  }
  const onSingleModeLayerChanged = (layerId: string) => {
    if (isEqual([layerId], _selectedLayerViewsStates)) {
      _zoomToLayers(_selectedLayerViewsStates) // when the option remains unchanged, trigger zoom
    }

    setSelectedLayerViewsStates([layerId])
  }

  // 2. Multi layer mode
  // const getMultiLayersItems = () => {
  //   const items = allVisibleBuildingLayers && allVisibleBuildingLayers.map((buildingLayer, index) => {
  //     return {
  //       label: buildingLayer.title,
  //       value: buildingLayer.id
  //     }
  //   })
  //   return items.toArray()
  // }
  // const onMultiLayerChanged = (evt, layerId, values: string[]) => {
  //   setSelectedLayerViewsStates(values)
  // }
  // const displaySelectedFields = (layerIds: string[]) => {
  //   const selectedLayersNum = (layerIds && layerIds.length)

  //   let selectedLabel = ''
  //   if (selectedLayersNum <= 0) {
  //     selectedLabel = translate('selectLayerToExplore')
  //   } else if (selectedLayersNum === 1) {
  //     const layer = allVisibleBuildingLayers.find((buildingLayer) => {
  //       return buildingLayer.id === layerIds[0]
  //     })
  //     // show layer name
  //     selectedLabel = layer?.title
  //   } else {
  //     selectedLabel = translate('layersSelected', { number: selectedLayersNum })
  //   }
  //   return selectedLabel
  // }

  const layerMode = props.mapConfig?.layerMode ?? LayerMode.Single
  return (
    <div className='layer-selector w-100 pt-2 px-2'>
      {/* 1. Single mode */}
      {(layerMode === LayerMode.Single) &&
        <SingleModeSelector
          defaultValue={getSingleModeDefaultValue()}
          allVisibleBuildingLayerViews={allVisibleBuildingLayerViewsStates}
          onOptionClick={onSingleModeLayerChanged}
        ></SingleModeSelector>
      }

      {/* 2. Multiple mode
      {(layerMode === LayerMode.Multiple) &&
        <MultiSelect
            items={Immutable(getMultiLayersItems())}
            values={Immutable(_selectedLayerViewsStates)}
            className='custom-multiselect'
            size={'sm'}
            fluid={true}
            onClickItem={onMultiLayerChanged}
            displayByValues={displaySelectedFields}
        ></MultiSelect>
      }*/}
    </div>
  )
})
