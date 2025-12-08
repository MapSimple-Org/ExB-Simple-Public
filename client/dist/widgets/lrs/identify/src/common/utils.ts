import { Immutable, type ImmutableObject } from 'jimu-core'
import type { ImmutableArray } from 'seamless-immutable'
import {
  LrsLayerType,
  type LrsLayer,
  type ModeType,
  getDefaultEvent,
  getDefaultNetwork,
  getDefaultAttributeSet,
  highlightColor
} from 'widgets/shared-code/lrs'
import type { IMConfig, SettingsPerView } from '../config'

export function constructSettingsPerView() {
  const settingsPerView: SettingsPerView = {
    networkLayers: [],
    eventLayers: [],
    intersectionLayers: [],
    defaultEvent: { index: -1, name: '' },
    highlightStyle: { routeColor: highlightColor, width: 3 },
    defaultPointAttributeSet: '',
    defaultLineAttributeSet: '',
    attributeSets: { attributeSet: [] },
    lineEventToggle: false,
    pointEventToggle: false,
    defaultNetwork: { index: -1, name: '' }
  }

  return Immutable(settingsPerView)
}

export function setValuesForView(settingsPerView: ImmutableObject<SettingsPerView>, lrsLayers: ImmutableArray<LrsLayer>, getLayers: boolean) {

  if (getLayers) {
    const networkLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Network).map((layer) => layer.name)
    const eventLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Event).map((layer) => layer.name)
    const intersectionLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Intersection).map((layer) => layer.name)

    settingsPerView = settingsPerView
      .set('networkLayers', networkLayers)
      .set('eventLayers', eventLayers)
      .set('intersectionLayers', intersectionLayers)
  }

  const defaultEvent = getDefaultEvent(lrsLayers, settingsPerView.defaultEvent, false)
  const defaultNetwork = getDefaultNetwork(lrsLayers, settingsPerView.defaultNetwork)
  const defaultPointAttributeSet = getDefaultAttributeSet(settingsPerView?.attributeSets, settingsPerView.defaultPointAttributeSet, true)
  const defaultLineAttributeSet = getDefaultAttributeSet(settingsPerView?.attributeSets, settingsPerView.defaultLineAttributeSet, false)

  return settingsPerView
    .set('defaultEvent', defaultEvent || settingsPerView.defaultEvent)
    .set('highlightStyle', settingsPerView.highlightStyle || { routeColor: highlightColor, width: 3 })
    .set('defaultPointAttributeSet', defaultPointAttributeSet || settingsPerView.defaultPointAttributeSet )
    .set('defaultLineAttributeSet', defaultLineAttributeSet || settingsPerView.defaultLineAttributeSet )
    .set('attributeSets', settingsPerView.attributeSets || false)
    .set('lineEventToggle', settingsPerView.lineEventToggle || false)
    .set('pointEventToggle', settingsPerView.pointEventToggle || false)
    .set('defaultNetwork', defaultNetwork|| settingsPerView.defaultNetwork)
}

export function resetConfig(config: IMConfig, mode: ModeType): IMConfig {
  return config
    .set('mode', mode)
    .set('lrsLayers', [])
    .set('mapViewsConfig', {})
    .set('settingsPerView', {})
    .set('networkLayers', [])
    .set('eventLayers', [])
    .set('intersectionLayers', [])
    .set('defaultEvent', Immutable({ index: -1, name: '' }))
    .set('highlightStyle', { routeColor: highlightColor, width: 3 })
    .set('defaultPointAttributeSet', '')
    .set('defaultLineAttributeSet', '')
    .set('attributeSets', { attributeSet: [] })
    .set('lineEventToggle', false)
    .set('pointEventToggle', false)
    .set('defaultNetwork', -1)
}
