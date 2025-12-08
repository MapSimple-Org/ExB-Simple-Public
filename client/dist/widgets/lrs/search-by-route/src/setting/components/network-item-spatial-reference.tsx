/** @jsx jsx */
import { jsx, type ImmutableObject, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Select } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { lrsDefaultMessages, type LrsLayer, LrsLayerType, SpatialReferenceFrom } from 'widgets/shared-code/lrs'

interface Props {
  lrsLayer?: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
}

export function NetworkItemSpatialReference (props: Props) {
  const { lrsLayer, onPropertyChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  return (
    <SettingSection title={getI18nMessage('spatialReference')}>
      <SettingRow flow='wrap' label={getI18nMessage('default')}>
          <Select
            aria-label={getI18nMessage('default')}
            className='w-100'
            size='sm'
            value={networkInfo.defaultSpatialReferenceFrom}
            onChange={(e) => { onPropertyChanged('defaultSpatialReferenceFrom', e.target.value, true) }}
          >
            <option value={SpatialReferenceFrom.Map}>{getI18nMessage('map')}</option>
            <option value={SpatialReferenceFrom.Lrs}>{getI18nMessage('lrs')}</option>
          </Select>
      </SettingRow>
    </SettingSection>
  )
}
