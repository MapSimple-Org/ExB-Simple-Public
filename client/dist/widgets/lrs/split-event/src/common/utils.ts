import { Immutable, type ImmutableObject } from 'jimu-core'
import type { ImmutableArray } from 'seamless-immutable'
import {
  LrsLayerType,
  type LrsLayer,
  type ModeType,
  getDefaultEvent,
  isLineEvent
} from 'widgets/shared-code/lrs'
import type { IMConfig, SettingsPerView } from '../config'

export function constructSettingsPerView() {
  const settingsPerView: SettingsPerView = {
    networkLayers: [],
    eventLayers: [],
    defaultEvent: { index: -1, name: '' },
    hideEvent: false,
    hideNetwork: false,
    hideDate: false,
    useRouteStartDate: false,
  }
  return Immutable(settingsPerView)
}

export function setValuesForView(
  settingsPerView: ImmutableObject<SettingsPerView>,
  lrsLayers: ImmutableArray<LrsLayer>,
  getLayers: boolean) {
  if (getLayers) {
    const networkLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Network).map((layer) => layer.name)
    const eventLayers = lrsLayers.filter((layer) => isLineEvent(layer)).map((layer) => layer.name)

    settingsPerView = settingsPerView
      .set('networkLayers', networkLayers)
      .set('eventLayers', eventLayers)
  }

  const defaultEvent = getDefaultEvent(lrsLayers, settingsPerView.defaultEvent, false)

  return settingsPerView
    .set('defaultEvent', defaultEvent)
    .set('hideEvent', settingsPerView.hideEvent)
    .set('hideNetwork', settingsPerView.hideNetwork)
    .set('hideDate', settingsPerView.hideDate)
    .set('useRouteStartDate', settingsPerView.useRouteStartDate)

}

export function resetConfig(config: IMConfig, mode: ModeType): IMConfig {
  return config
    .set('mode', mode)
    .set('lrsLayers', [])
    .set('mapViewsConfig', {})
    .set('settingsPerView', {})
    .set('networkLayers', [])
    .set('eventLayers', [])
    .set('defaultEvent', { index: -1, name: '' })
    .set('hideEvent', false)
    .set('hideNetwork', false)
    .set('hideDate', false)
    .set('useRouteStartDate', false)
}
