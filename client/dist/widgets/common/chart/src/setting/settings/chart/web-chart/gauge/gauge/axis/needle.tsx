import { React, type ImmutableObject, hooks } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'
import { NumericInput, Switch, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import type { WebChartGaugeAxis } from 'jimu-ui/advanced/chart'
import { FillSymbolSetting } from '../../../components'
import { DefaultGaugeNeedleColor, DefaultGaugeNeedleOutlineColor } from '../../../../../../../utils/default'

interface NeedleSettingProps {
  axis?: ImmutableObject<WebChartGaugeAxis>
  onAxisChange?: (value: ImmutableObject<WebChartGaugeAxis>) => void
}

const ShowMoreOptions = false

export const NeedleSetting = (props: NeedleSettingProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const { axis: propAxis, onAxisChange } = props

  const displayPin = propAxis?.needle.displayPin
  const symbol = propAxis?.needle.symbol
  const startWidth = propAxis?.needle.startWidth
  const endWidth = propAxis?.needle.endWidth
  const innerRadius = propAxis?.needle.innerRadius

  const handleNeedlePinVisibleChange = () => {
    const axis = propAxis.setIn(['needle', 'displayPin'], !displayPin)
    onAxisChange(axis)
  }

  const handleSymbolChange = (symbol) => {
    const axis = propAxis.setIn(['needle', 'symbol'], symbol)
    onAxisChange(axis)
  }

  const handlePropertyChange = (key: 'startWidth' | 'endWidth' | 'innerRadius', value: number | string) => {
    const val = Math.floor(+value)
    const axis = propAxis.setIn(['needle', key], val)
    onAxisChange(axis)
  }

  return (<>
    {ShowMoreOptions && <SettingRow className='mt-2' tag='label' label={translate('showNeedlePin')} level={3}>
      <Switch checked={displayPin} onChange={handleNeedlePinVisibleChange} />
    </SettingRow>}
    <FillSymbolSetting
      className='mt-2'
      defaultFillColor={DefaultGaugeNeedleColor}
      defaultLineColor={DefaultGaugeNeedleOutlineColor}
      value={symbol}
      onChange={handleSymbolChange}
    />
    {ShowMoreOptions && <>
      <SettingRow label={translate('startWidth')} className="mt-2" flow='no-wrap' level={3}>
        <NumericInput
          className='w-input-sm'
          aria-label={translate('startWidth')}
          size='sm'
          min={1}
          step={1}
          max={100}
          showHandlers={false}
          defaultValue={startWidth}
          onAcceptValue={(value) => { handlePropertyChange('startWidth', value) }}
        />
      </SettingRow>
      <SettingRow label={translate('endWidth')} className="mt-2" flow='no-wrap' level={3}>
        <NumericInput
          className='w-input-sm'
          aria-label={translate('endWidth')}
          size='sm'
          min={1}
          step={1}
          max={100}
          showHandlers={false}
          defaultValue={endWidth}
          onAcceptValue={(value) => { handlePropertyChange('endWidth', value) }}
        />
      </SettingRow>
      <SettingRow label={translate('needleRadius')} className="mt-2" flow='no-wrap' level={3}>
        <NumericInput
          className='w-input-sm'
          aria-label={translate('needleRadius')}
          size='sm'
          min={0}
          step={1}
          max={999}
          showHandlers={false}
          defaultValue={innerRadius}
          onAcceptValue={(value) => { handlePropertyChange('innerRadius', value) }}
        />
      </SettingRow>
    </>}
  </>)
}
