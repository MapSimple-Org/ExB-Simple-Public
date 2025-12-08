import { React, type ImmutableObject, hooks } from 'jimu-core'
import { SimpleNumericFormatSetting } from '../../../components'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'
import { type LinearUnit, defaultMessages as jimUiDefaultMessage, DistanceUnits } from 'jimu-ui'
import type { NumberFormatOptions } from 'jimu-ui/advanced/chart'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'

const ShowPositionOffset = false

interface ValueFormatSettingProps {
  valueFormat: ImmutableObject<NumberFormatOptions>
  onValueFormatChange: (value: ImmutableObject<NumberFormatOptions>) => void
  verticalAlignment?: 'baseline' | 'top' | 'middle' | 'bottom'
  handleLabelVerticalAlignChange?: (verticalAlignment?: 'baseline' | 'top' | 'middle' | 'bottom') => void
  yoffset?: string
  onYOffsetAlignChange?: (yoffset?: string) => void
}

const DefaultUnits: DistanceUnits[] = [DistanceUnits.PERCENTAGE]

export const ValueFormatSetting = (props: ValueFormatSettingProps) => {
  const { valueFormat, onValueFormatChange, yoffset, onYOffsetAlignChange } = props

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const handleYOffsetAlignChange = (value: LinearUnit) => {
    const offset = `${value.distance}${value.unit}`
    onYOffsetAlignChange?.(offset)
  }

  return (<>
    <SettingRow label={translate('decimal')} className="mt-2" flow='wrap' level={3}>
      <SimpleNumericFormatSetting
        className='w-100'
        value={valueFormat}
        showNotation={true}
        isUnifiedFractionDigits={false}
        onChange={onValueFormatChange}
      />
    </SettingRow>
    {ShowPositionOffset && <SettingRow label={translate('positionOffset')} className="mt-2" flow='no-wrap' level={3}>
      <InputUnit min={0} max={100} className='w-input-sm' units={DefaultUnits} value={yoffset} onChange={handleYOffsetAlignChange} />
    </SettingRow>}
  </>)
}
