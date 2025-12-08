/** @jsx jsx */
import { jsx, type ImmutableObject, hooks, type IntlShape, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { NumericInput } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { GetUnits, lrsDefaultMessages, type LrsLayer, LrsLayerType } from 'widgets/shared-code/lrs'
interface Props {
  intl: IntlShape
  lrsLayer?: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
}

export function NetworkItemSearchRadius (props: Props) {
  const { lrsLayer, intl, onPropertyChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  const handleRadiusAccept = (value: number) => {
    // Updates the page size for search results.
    onPropertyChanged('searchRadius', value, true)
  }
  return (
    <SettingSection title={getI18nMessage('search')}>
      <SettingRow flow='wrap' label={getI18nMessage('radiusWithUnits', { units: GetUnits(networkInfo.unitsOfMeasure, intl) })}>
        <NumericInput
          size="sm"
          value={networkInfo.searchRadius}
          precision={3}
          onAcceptValue={handleRadiusAccept}
          aria-label={getI18nMessage('radiusWithUnits', { units: GetUnits(networkInfo.unitsOfMeasure, intl) })}
          className="w-100"
        />
      </SettingRow>
    </SettingSection>
  )
}
