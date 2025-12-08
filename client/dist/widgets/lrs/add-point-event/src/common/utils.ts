import { getAppStore, Immutable, type ImmutableObject } from 'jimu-core'
import type { ImmutableArray } from 'seamless-immutable'
import {
  LrsLayerType,
  type LrsLayer,
  type ModeType,
  SearchMethod,
  getDefaultNetwork,
  getDefaultAttributeSet,
  getDefaultEvent,
  isDefined,
  getAttributeSets,
  isPointEvent} from 'widgets/shared-code/lrs'
import { OperationType, type IMConfig, type SettingsPerView } from '../config'

export function constructSettingsPerView() {
  const settingsPerView: SettingsPerView = {
    networkLayers: [],
    eventLayers: [],
    intersectionLayers: [],
    attributeSets: { attributeSet: [] },
    defaultMethod: SearchMethod.Measure,
    defaultType: OperationType.single,
    defaultAttributeSet: '',
    defaultEvent: { index: -1, name: '' },
    defaultNetwork: { index: -1, name: '' },
    hideMethod: false,
    hideEvent: false,
    hideNetwork: false,
    hideType: false,
    hideAttributeSet: false,
    hideDates: false,
    useRouteStartEndDate: false,
    hideAddToDominantRouteOption: false,
    enableAddToDominantRouteOption: false,
    notAllowOverrideEventReplacement: false
  }

  return Immutable(settingsPerView)
}

export async function setValuesForView(
  settingsPerView: ImmutableObject<SettingsPerView>,
  lrsLayers: ImmutableArray<LrsLayer>,
  getLayers: boolean,
  useRuntimeLayers: boolean = false
) {
  if (getLayers) {
    const networkLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Network).map((layer) => layer.name)
    const eventLayers = lrsLayers.filter((layer) => isPointEvent(layer)).map((layer) => layer.name)
    const intersectionLayers = lrsLayers.filter((layer) => layer.layerType === LrsLayerType.Intersection).map((layer) => layer.name)

    settingsPerView = settingsPerView
      .set('networkLayers', networkLayers)
      .set('eventLayers', eventLayers)
      .set('intersectionLayers', intersectionLayers)
  }

  if (useRuntimeLayers) {
    const network = lrsLayers.find(layer => layer.layerType === LrsLayerType.Network)
    if (isDefined(network)) {
      const portalUrl = getAppStore().getState().portalUrl
      const pointAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl, true, true)
      settingsPerView = settingsPerView.setIn(['attributeSets'], pointAttributeSets)
    }
  }

  const defaultEvent = getDefaultEvent(lrsLayers, settingsPerView.defaultEvent, true)
  const defaultNetwork = getDefaultNetwork(lrsLayers, settingsPerView.defaultNetwork)
  const defaultAttributeSet = getDefaultAttributeSet(settingsPerView?.attributeSets, settingsPerView.defaultAttributeSet, true)

  return settingsPerView
    .set('defaultNetwork', defaultNetwork)
    .set('defaultEvent', defaultEvent)
    .set('defaultAttributeSet', defaultAttributeSet)
    .set('defaultMethod', settingsPerView.defaultMethod || SearchMethod.Measure)
    .set('defaultType', settingsPerView.defaultType || OperationType.single)
    .set('hideMethod', settingsPerView.hideMethod || false)
    .set('hideEvent', settingsPerView.hideEvent || false)
    .set('hideNetwork', settingsPerView.hideNetwork || false)
    .set('hideType', settingsPerView.hideType || false)
    .set('hideAttributeSet', settingsPerView.hideAttributeSet || false)
    .set('hideDates', settingsPerView.hideDates || false)
    .set('useRouteStartEndDate', settingsPerView.useRouteStartEndDate || false)
    .set('attributeSets', settingsPerView.attributeSets || Immutable({ attributeSet: [] }))
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
    .set('attributeSets', Immutable({ attributeSet: [] }))
    .set('defaultAttributeSet', '')
    .set('defaultEvent', Immutable({ index: -1, name: '' }))
    .set('defaultNetwork', Immutable({ index: -1, name: '' }))
    .set('defaultMethod', SearchMethod.Measure)
    .set('defaultType', OperationType.single)
    .set('hideMethod', false)
    .set('hideEvent', false)
    .set('hideNetwork', false)
    .set('hideType', false)
    .set('hideAttributeSet', false)
    .set('hideDates', false)
    .set('useRouteStartEndDate', false)
    .set('hideAddToDominantRouteOption', false)
    .set('enableAddToDominantRouteOption', false)
    .set('notAllowOverrideEventReplacement', false)
}
