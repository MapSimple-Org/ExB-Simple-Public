import { Immutable, type ImmutableObject } from 'jimu-core'
import type { ImmutableArray } from 'seamless-immutable'
import {
  type LrsLayer,
  type ModeType,
  highlightColor,
  colorBlack,
  LrsLayerType,
  type ReferentProperties
} from 'widgets/shared-code/lrs'
import type { IMConfig, ResultConfig, SettingsPerView } from '../config'

export const getReferentProperties = (referentItem: ImmutableObject<LrsLayer>): ImmutableObject<ReferentProperties> => {

  if (!referentItem) {
    return Immutable({}) as ImmutableObject<ReferentProperties>
  }

  switch (referentItem.layerType) {
    case LrsLayerType.Event:
      return referentItem.eventInfo.referentProperties
    case LrsLayerType.Intersection:
      return referentItem.intersectionInfo.referentProperties
    case LrsLayerType.CalibrationPoint:
      return referentItem.calibrationPointInfo.referentProperties
    case LrsLayerType.Addressing:
      return referentItem.addressingInfo.referentProperties
    case LrsLayerType.NonLrs:
      return referentItem.nonLrsInfo.referentProperties
    default:
      return Immutable({}) as ImmutableObject<ReferentProperties>
  }
}

export const getDefaultReferent = (lrsLayers: ImmutableArray<LrsLayer>, resultConfig: ResultConfig): ResultConfig => {
  if (resultConfig?.defaultReferentLayer) {
    return resultConfig
  }

  const referent = lrsLayers.find(item => item.isReferent)
  if (referent) {
    const result = {...resultConfig }
    result.defaultOffsetUnit = 'esriInches'
    result.defaultReferentLayer = Immutable(referent)
    result.pageSize = 25
    return result
  }
    return resultConfig
}

export const getDefaultNetwork = (lrsLayers: ImmutableArray<LrsLayer>, defaultNetwork: string): string => {
  if (defaultNetwork) {
    return defaultNetwork
  }

  const network = lrsLayers.find(item => item.layerType === LrsLayerType.Network && !item.networkInfo.isDerived)
  if (network) {
    return network.name
  }
}

export function constructSettingsPerView() {
  const settingsPerView: SettingsPerView = {
    highlightStyle: { color: highlightColor, size: 2 },
    labelStyle: { color: colorBlack, size: 12 },
    resultConfig: { pageSize: 100, defaultReferentLayer: null, defaultOffsetUnit: '' },
    defaultNetwork: '',
    hideMethod: false,
    hideNetwork: false,
    hideRoute: false,
  }

  return Immutable(settingsPerView)
}

export function setValuesForView(settingsPerView: ImmutableObject<SettingsPerView>) {
  return settingsPerView
    .set('highlightStyle', settingsPerView.highlightStyle || { color: highlightColor, size: 2 })
    .set('labelStyle', settingsPerView.labelStyle || { color: colorBlack, size: 12 })
    .set('resultConfig', settingsPerView.resultConfig || { pageSize: 100, defaultReferentLayer: null, defaultOffsetUnit: '' })
    .set('defaultNetwork', settingsPerView.defaultNetwork || '')
    .set('hideMethod', settingsPerView.hideMethod || false)
    .set('hideNetwork', settingsPerView.hideNetwork || false)
    .set('hideRoute', settingsPerView.hideMethod || false)
}

export function resetConfig(config: IMConfig, mode: ModeType): IMConfig {
  return config
    .set('mode', mode)
    .set('lrsLayers', [])
    .set('mapViewsConfig', {})
    .set('settingsPerView', {})
    .set('highlightStyle', { color: highlightColor, size: 2 })
    .set('labelStyle', { color: colorBlack, size: 2 })
    .set('resultConfig', { pageSize: 100, defaultReferentLayer: null, defaultOffsetUnit: '' })
    .set('defaultNetwork', '')
    .set('hideMethod', false)
    .set('hideNetwork', false)
    .set('hideRoute', false)
}
