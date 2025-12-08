import { React, hooks } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

import { getActionDataSets, getLayerList } from '../../utils'

import { ActionType } from '../constants'
import type { StatusType, WidgetAction, WidgetState } from '../types'
import defaultMessages from '../translations/default'

export const defaultState = {
  jimuMapView: null,
  layerList: [],
  layerId: '',
  actionDataSets: [],
  portal: null,
  status: 'pending' as StatusType,
  error: null
}

export const useWidgetState = (initialState: Partial<WidgetState>) => {
  const [state, setState] = React.useState<WidgetState>({
    ...defaultState,
    ...initialState
  })

  const translate = hooks.useTranslation(defaultMessages)

  const onAction = async (action: WidgetAction) => {
    switch (action.type) {
      case ActionType.SET_JIMU_MAP_VIEW: {
        const {
          jimuMapView: updatedJimuMapView,
          config: { customizeLayersOptions }
        } = action.payload

        setState((currentState) => ({
          ...currentState,
          status: 'pending',
          error: null
        }))

        try {
          const updatedLayerList = await getLayerList(updatedJimuMapView?.id, customizeLayersOptions)
          const updatedLayerId = updatedLayerList?.[0]?.id ?? ''
          const layer = updatedLayerList.find(({ id }) => id === updatedLayerId)
          const updatedActionDataSets = await getActionDataSets(layer, updatedJimuMapView)

          setState((currentState) => ({
            ...currentState,
            jimuMapView: updatedJimuMapView,
            layerList: updatedLayerList,
            layerId: updatedLayerId,
            actionDataSets: updatedActionDataSets,
            status: 'resolved',
            error: null
          }))
        } catch (err) {
          setState((currentState) => ({
            ...currentState,
            status: 'rejected',
            error: err instanceof Error ? err.message : translate('unableToGetLayers')
          }))
        }
        break
      }
      case ActionType.SET_LAYER_LIST: {
        const {
          jimuMapView,
          config: { customizeLayersOptions }
        } = action.payload

        const {
          layerId,
          actionDataSets
        } = state

        setState((currentState) => ({
          ...currentState,
          status: 'pending',
          error: null
        }))

        try {
          const updatedLayerList = await getLayerList(jimuMapView?.id, customizeLayersOptions)
          const updatedLayerId = updatedLayerList?.[0]?.id ?? ''
          const layer = updatedLayerList.find(({ id }) => id === updatedLayerId)
          const updatedActionDataSets = layerId === updatedLayerId ? actionDataSets : await getActionDataSets(layer, jimuMapView)

          setState((currentState) => ({
            ...currentState,
            layerList: updatedLayerList,
            layerId: updatedLayerId,
            actionDataSets: updatedActionDataSets,
            status: 'resolved',
            error: null
          }))
        } catch (err) {
          setState((currentState) => ({
            ...currentState,
            status: 'rejected',
            error: err instanceof Error ? err.message : translate('unableToGetLayers')
          }))
        }
        break
      }
      case ActionType.SET_LAYER_ID: {
        const { layerId: updatedLayerId } = action.payload

        const { jimuMapView, layerList } = state

        const layer = layerList.find(({ id }) => id === updatedLayerId)
        const updatedActionDataSets = await getActionDataSets(layer, jimuMapView)
        setState((currentState) => ({
          ...currentState,
          layerId: updatedLayerId,
          actionDataSets: updatedActionDataSets
        }))
        break
      }
      case ActionType.SET_PORTAL: {
        const { portalUrl, portalSelf } = action.payload

        const modules = await loadArcGISJSAPIModules(['esri/portal/Portal'])
        const [Portal] = modules as [typeof __esri.Portal]

        const portal = new Portal({
          url: portalUrl,
          sourceJSON: portalSelf
        })

        await portal.load()
        setState((currentState) => ({
          ...currentState,
          portal
        }))
        break
      }
    }
  }

  return {
    state,
    onAction
  }
}
