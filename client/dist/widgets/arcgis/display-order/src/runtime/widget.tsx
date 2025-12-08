import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Loading, LoadingType, Paper } from 'jimu-ui'

import type { IMConfig } from '../config'
import { getInCustomizedLayerViewIds } from '../utils'

import Placeholder from './components/placeholder'
import Tips from './components/tips'
import Header from './components/header'
import ImageryDisplayOrder from './components/imagery-display-order'

import { ActionType } from './constants'
import { useWidgetState } from './hooks/use-widget-state'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const {
    id: widgetId,
    useMapWidgetIds,
    config,
    enableDataAction
  } = props

  const {
    state: {
      jimuMapView,
      layerList,
      layerId,
      actionDataSets,
      status
    },
    onAction
  } = useWidgetState({})

  const customizedLayerViewIds =
    getInCustomizedLayerViewIds(jimuMapView?.id, config.customizeLayersOptions)
  React.useEffect(() => {
    if (customizedLayerViewIds) {
      handleLayerListChange()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customizedLayerViewIds])

  React.useEffect(() => {
    if (jimuMapView) {
        jimuMapView.addJimuLayerViewCreatedListener(handleLayerListChange)
        jimuMapView.addJimuLayerViewRemovedListener(handleLayerListChange)
    }
    return () => {
      jimuMapView?.removeJimuLayerViewCreatedListener(handleLayerListChange)
      jimuMapView?.removeJimuLayerViewRemovedListener(handleLayerListChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView, customizedLayerViewIds])

  const onActiveViewChange = (updatedJimuMapView: JimuMapView) => {
    if (updatedJimuMapView) {
      onAction({
        type: ActionType.SET_JIMU_MAP_VIEW,
        payload: { jimuMapView: updatedJimuMapView, config }
      })
    }
  }

  const handleLayerListChange = () => {
    onAction({
      type: ActionType.SET_LAYER_LIST,
      payload: { jimuMapView, config }
    })
  }

  const handleLayerChange = (event) => {
    const updatedLayerId = event.target.value
    onAction({
      type: ActionType.SET_LAYER_ID,
      payload: { layerId: updatedLayerId }
    })
  }

  const hasMapWidgetSelected = useMapWidgetIds?.length > 0
  const hasLoaded = status !== 'pending'
  const hasLayers = layerList?.length > 0

  return (
    <Paper variant="flat" shape="none" className='jimu-widget'>
      <JimuMapViewComponent
        useMapWidgetId={useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />
      {!hasMapWidgetSelected
        ? (
            <Placeholder widgetId={widgetId} show={true} />
          )
        : !hasLoaded
            ? (
                <Loading type={LoadingType.Secondary} />
              )
            : !hasLayers
                ? (
                    <Tips show={true} />
                  )
                : (
                    <div className='py-3 mx-2 d-flex flex-column h-100 p-relative'>
                      <Header
                        widgetId={widgetId}
                        layerId={layerId}
                        layerList={layerList}
                        enableDataAction={enableDataAction}
                        actionDataSets={actionDataSets}
                        handleLayerChange={handleLayerChange}
                      />
                      <ImageryDisplayOrder layerId={layerId} layerList={layerList} {...props} />
                    </div>
                  )}
    </Paper>
  )
}

export default Widget
