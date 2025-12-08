import { React, type ImmutableObject, hooks } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'
import { Checkbox, Label, Switch, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import type { WebChartGaugeAxis } from 'jimu-ui/advanced/chart'
import { SizeEditor } from '../../../components'

interface GaugeAxisSettingProps {
  axis?: ImmutableObject<WebChartGaugeAxis>
  onAxisChange?: (value: ImmutableObject<WebChartGaugeAxis>) => void
}

export const GaugeAxisSetting = (props: GaugeAxisSettingProps) => {
  const { axis: propAxis, onAxisChange } = props

  const labelVisible = propAxis?.labels.visible
  const ticksVisible = propAxis?.ticks.visible
  const onlyShowFirstAndLastLabels = propAxis?.onlyShowFirstAndLastLabels ?? false

  const labelsIncrement = propAxis?.labelsIncrement ?? 0
  const [labelsIncrementMode, setLabelsIncrementMode] = React.useState<'auto' | 'custom'>(labelsIncrement ? 'custom' : 'auto')

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const handleLabelVisibleChange = () => {
    const axis = propAxis.setIn(['labels', 'visible'], !labelVisible)
    onAxisChange(axis)
  }

  const handleOnlyShowFirstAndLastLabelsChange = () => {
    const axis = propAxis.set('onlyShowFirstAndLastLabels', !onlyShowFirstAndLastLabels)
    onAxisChange(axis)
  }

  const handleTicksVisibleChange = () => {
    const axis = propAxis.setIn(['ticks', 'visible'], !ticksVisible)
    onAxisChange(axis)
  }

  const handleLabelLabelIncrementChange = (value) => {
    if (value === labelsIncrement) return
    const axis = propAxis.set('labelsIncrement', value)
    onAxisChange(axis)
  }

  const handleLabelLabelIncrementModeChange = (mode) => {
    if (mode === 'auto') {
      const axis = propAxis.set('labelsIncrement', 0)
      onAxisChange(axis)
    }
    setLabelsIncrementMode(mode)
  }

  return (<>
    <SettingRow className='mt-2' tag='label' label={translate('showAxisLabel')} level={3}>
      <Switch checked={labelVisible} onChange={handleLabelVisibleChange} />
    </SettingRow>
    <SettingRow label={translate('labelIncrement')} level={3}>
      <SizeEditor
        className='w-input-md'
        mode={labelsIncrementMode}
        value={labelsIncrement}
        onModeChange={handleLabelLabelIncrementModeChange}
        onChange={(value) => { handleLabelLabelIncrementChange(value) }}
      />
    </SettingRow>
    <Label check centric className='justify-content-start align-items-start mt-3 title3 hint-default'>
      <Checkbox
        aria-label={translate('onlyShowStartEndLabel')}
        checked={onlyShowFirstAndLastLabels}
        onChange={handleOnlyShowFirstAndLastLabelsChange}
      />
      <span className='ml-2'>{translate('onlyShowStartEndLabel')}</span>
    </Label>
    <Label check centric className='justify-content-start align-items-start mt-3 title3 hint-default'>
      <Checkbox
        aria-label={translate('hideTicks')}
        checked={!ticksVisible}
        onChange={handleTicksVisibleChange}
      />
      <span className='ml-2'>{translate('hideTicks')}</span>
    </Label>
  </>)
}
