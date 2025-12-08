import type { DataRecordSet } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'

import type { IMConfig, QualifiedLayer } from '../config'
import type { ActionType } from './constants'

export type StatusType = 'idle' | 'pending' | 'resolved' | 'rejected'

export interface WidgetState {
  jimuMapView: JimuMapView
  layerList: QualifiedLayer[]
  layerId: string
  actionDataSets: DataRecordSet[]
  portal: __esri.Portal
  status: StatusType
  error?: string | null
}

export interface SetJimuMapViewAction {
  type: typeof ActionType.SET_JIMU_MAP_VIEW
  payload: { jimuMapView: JimuMapView, config: IMConfig }
}

export interface SetLayerListAction {
  type: typeof ActionType.SET_LAYER_LIST
  payload: { jimuMapView: JimuMapView, config: IMConfig }
}

export interface SetLayerIdAction {
  type: typeof ActionType.SET_LAYER_ID
  payload: { layerId: string }
}

export interface SetPortalAction {
  type: typeof ActionType.SET_PORTAL
  payload: { portalUrl: string, portalSelf: any }
}

export type WidgetAction = SetJimuMapViewAction | SetLayerListAction | SetLayerIdAction | SetPortalAction
