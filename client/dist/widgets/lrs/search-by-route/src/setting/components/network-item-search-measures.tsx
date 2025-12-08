/** @jsx jsx */
import { React, jsx, type ImmutableObject, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Switch } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { lrsDefaultMessages, type LrsLayer, LrsLayerType } from 'widgets/shared-code/lrs'

interface Props {
  lrsLayer: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
}

export function NetworkItemSearchMeasures (props: Props) {
  const { lrsLayer, onPropertyChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  const handleSwitchChange = (e, name: string) => {
    if (!e.target) return
    onPropertyChanged(name, e.target.checked, true)
  }

  const GetActiveMethods = (): number => {
    // Returns how many methods are enabled.
    let count = 0
    if (networkInfo.searchSingle) { count++ }
    if (networkInfo.searchMultiple) { count++ }
    if (networkInfo.searchRange) { count++ }
    return count
  }

  return (
    <SettingSection
      role='group'
      aria-label={getI18nMessage('searchMeasures')}
      title={getI18nMessage('searchMeasures')}
    >
      <SettingRow tag='label' label={getI18nMessage('singleLabel')}>
        <Switch
          checked={networkInfo.searchSingle}
          disabled={GetActiveMethods() === 1 && networkInfo.searchSingle}
          onChange={(e) => { handleSwitchChange(e, 'searchSingle') }}
        />
      </SettingRow>
      <SettingRow tag='label' label={getI18nMessage('multipleLabel')}>
        <Switch
          checked={networkInfo.searchMultiple}
          disabled={GetActiveMethods() === 1 && networkInfo.searchMultiple}
          onChange={(e) => { handleSwitchChange(e, 'searchMultiple') }}
        />
      </SettingRow>
      <SettingRow tag='label' label={getI18nMessage('rangeLabel')}>
        <Switch
          checked={networkInfo.searchRange}
          disabled={GetActiveMethods() === 1 && networkInfo.searchRange}
          onChange={(e) => { handleSwitchChange(e, 'searchRange') }}
        />
      </SettingRow>
    </SettingSection>
  )
}
