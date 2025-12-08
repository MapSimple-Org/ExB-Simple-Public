import { getAppStore, Immutable, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import { getAttributeSets, getDefaultAttributeSet, isDefined, LrsLayerType, type LrsLayer, type ModeType } from 'widgets/shared-code/lrs'
import { AttributeInputType, DisplayType, type IMConfig, type SettingsPerView } from '../config'

export function constructSettingsPerView() {
  const settingsPerView: SettingsPerView = {
    defaultDisplayType: DisplayType.Table,
    attributeInputType: AttributeInputType.LineOnly,
    defaultPointAttributeSet: '',
    defaultLineAttributeSet: '',
    attributeSets: { attributeSet: [] },
    mapHighlightColor: '#65adff',
    tableHighlightColor: '#65adff',
    defaultDiagramScale: 3,
    showEventStatistics: false,
    allowMerge: false,
    allowEditing: true,
    defaultNetwork: ''
  }

  return Immutable(settingsPerView)
}

export async function setValuesForView(settingsPerView: ImmutableObject<SettingsPerView>,
  lrsLayers: ImmutableArray<LrsLayer>,
  useRuntimeLayers: boolean = false) {

  const network = lrsLayers.find(layer => layer.layerType === LrsLayerType.Network)
  if (isDefined(network)) {
    if (useRuntimeLayers) {
      const portalUrl = getAppStore().getState().portalUrl
      const allAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl)
      const defaultLineAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), settingsPerView.defaultLineAttributeSet, false)
      const defaultPointAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), settingsPerView.defaultPointAttributeSet, true)
      const defaultScale = getNetworkDefaultScale(network.networkInfo?.unitsOfMeasure)

      settingsPerView = settingsPerView.setIn(['attributeSets'], allAttributeSets)
        .setIn(['defaultLineAttributeSet'], defaultLineAttributeSet)
        .setIn(['defaultPointAttributeSet'], defaultPointAttributeSet)
        .setIn(['defaultDiagramScale'], defaultScale)
    }
  }

  return settingsPerView
    .set('defaultDisplayType', settingsPerView.defaultDisplayType || DisplayType.Table)
    .set('attributeInputType', settingsPerView.attributeInputType || AttributeInputType.LineOnly)
    .set('defaultPointAttributeSet', settingsPerView.defaultPointAttributeSet || '')
    .set('defaultLineAttributeSet', settingsPerView.defaultLineAttributeSet || '')
    .set('attributeSets', settingsPerView.attributeSets || Immutable({ attributeSet: [] }))
    .set('mapHighlightColor', settingsPerView.mapHighlightColor || '#65adff')
    .set('tableHighlightColor', settingsPerView.tableHighlightColor || '#65adff')
    .set('allowMerge', settingsPerView.allowMerge)
    .set('allowEditing', settingsPerView.allowEditing)
    .set('defaultDiagramScale', settingsPerView.defaultDiagramScale || 3)
    .set('showEventStatistics', settingsPerView.showEventStatistics)
    .set('defaultNetwork', settingsPerView.defaultNetwork || network.name)
}

export function resetConfig(config: IMConfig, mode: ModeType): IMConfig {
  return config
    .set('mode', mode)
    .set('lrsLayers', [])
    .set('mapViewsConfig', {})
    .set('settingsPerView', {})
    .set('defaultDisplayType', DisplayType.Table)
    .set('attributeInputType', AttributeInputType.LineOnly)
    .set('attributeSets', Immutable({ attributeSet: [] }))
    .set('defaultPointAttributeSet', '')
    .set('defaultLineAttributeSet', '')
    .set('mapHighlightColor', '#65adff')
    .set('tableHighlightColor', '#65adff')
    .set('allowMerge', false)
    .set('allowEditing', true)
    .set('defaultDiagramScale', 3)
    .set('showEventStatistics', false)
    .set('defaultNetwork', '')
}

export function getNetworkDefaultScale (defaultUnit: string): number {
  switch (defaultUnit) {
    case 'esriInches': { return 190080 }
    case 'esriFeet': { return 15840 }
    case 'esriYards': { return 5280 }
    case 'esriMiles': { return 3 }
    case 'esriNauticalMiles': { return 2.60 }
    case 'esriMillimeters': { return 4828000 }
    case 'esriCentimeters': { return 482800 }
    case 'esriDecimeters': { return 48280 }
    case 'esriMeters': { return 4828 }
    case 'esriKilometers': { return 4.828 }
    case 'esriDecimalDegrees': { return 3 }
    case 'esriIntFeet': { return 15840 }
    default: { return 3 }
  }
}

