import { React, classNames, type ImmutableObject, hooks, type ImmutableArray, Immutable } from 'jimu-core'
import { CollapsableToggle, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import type { WebChartGaugeAxis, NumberFormatOptions } from 'jimu-ui/advanced/chart'
import { GaugeShapesSetting } from './shape'
import { SettingCollapse } from '../../../../components'
import defaultMessages from '../../../../../translations/default'
import { ValueFormatSetting } from './axis/value-format'
import { GaugeAxisSetting } from './axis'
import { NeedleSetting } from './axis/needle'
import { Guides } from '../../common-sections/axes'

interface GaugeFormatSettingProps {
  className?: string
  startAngle?: number
  endAngle?: number
  innerRadius?: number
  onShapeChange?: (value: any) => void
  axes?: ImmutableArray<WebChartGaugeAxis>
  onAxesChange?: (value: ImmutableArray<WebChartGaugeAxis>) => void
}

export const GaugeFormatSetting = (props: GaugeFormatSettingProps) => {
  const {
    className,
    axes: propAxes,
    startAngle,
    endAngle,
    onAxesChange,
    onShapeChange
  } = props

  const [section, setSection] = React.useState<'none' | 'shape' | 'value-format' | 'axis' | 'guides' | 'needle'>('none')
  const shapeValue = React.useMemo(() => ({ startAngle, endAngle }), [startAngle, endAngle])
  const valueFormat = propAxes?.[0].valueFormat as ImmutableObject<NumberFormatOptions>
  const yoffset = propAxes?.[0]?.innerLabel.content.yoffset
  const needleVisible = propAxes?.[0]?.needle.visible ?? true
  const guides = propAxes?.[0]?.guides

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const handleValueFormatChange = (value) => {
    const axes = Immutable.setIn(propAxes, ['0', 'valueFormat'], value)
    onAxesChange(axes)
  }

  const handleAxisChange = (axis) => {
    const axes = Immutable([axis])
    onAxesChange(axes)
  }

  const handleYOffsetAlignChange = (value: string) => {
    const axes = Immutable.setIn(propAxes, ['0', 'innerLabel', 'content', 'yoffset'], value)
    onAxesChange(axes)
  }

  const handleNeedleVisibleChange = (visible: boolean) => {
    const axes = Immutable.setIn(propAxes, ['0', 'needle', 'visible'], visible)
    onAxesChange(axes)
  }

  const handleGuidesChange = (value) => {
    const axes = Immutable.setIn(propAxes, ['0', 'guides'], value)
    onAxesChange(axes)
  }

  return (<div className={classNames('gauge-series-setting', className)}>
    <SettingCollapse
      role='group'
      className='mt-2'
      level={2}
      bottomLine={true}
      label={translate('shape')}
      aria-label={translate('shape')}
      isOpen={section === 'shape'}
      onRequestOpen={() => { setSection('shape') }}
      onRequestClose={() => { setSection('none') }}
    >
      <GaugeShapesSetting value={shapeValue} onChange={onShapeChange} />
    </SettingCollapse>
    <SettingCollapse
      role='group'
      className='mt-2'
      level={2}
      bottomLine={true}
      label={translate('valueFormat')}
      aria-label={translate('valueFormat')}
      isOpen={section === 'value-format'}
      onRequestOpen={() => { setSection('value-format') }}
      onRequestClose={() => { setSection('none') }}
    >
      <ValueFormatSetting
        valueFormat={valueFormat}
        yoffset={yoffset as string}
        onValueFormatChange={handleValueFormatChange}
        onYOffsetAlignChange={handleYOffsetAlignChange}
      />
    </SettingCollapse>
    <SettingCollapse
      role='group'
      className='mt-2'
      level={2}
      bottomLine={true}
      label={translate('axis')}
      aria-label={translate('axis')}
      isOpen={section === 'axis'}
      onRequestOpen={() => { setSection('axis') }}
      onRequestClose={() => { setSection('none') }}
    >
      <GaugeAxisSetting
        axis={propAxes?.[0]}
        onAxisChange={handleAxisChange}
      />
    </SettingCollapse>
    <CollapsableToggle
      role='group'
      className='mt-2'
      level={2}
      bottomLine={true}
      label={translate('needle')}
      aria-label={translate('needle')}
      isOpen={needleVisible}
      onRequestOpen={() => { handleNeedleVisibleChange(true) }}
      onRequestClose={() => { handleNeedleVisibleChange(false) }}
    >
      <NeedleSetting
        axis={propAxes?.[0]}
        onAxisChange={handleAxisChange}
      />
    </CollapsableToggle>
    <Guides
      label={translate('guide')}
      value={guides}
      isHorizontal={true}
      renderVisible={false}
      labelVisible={false}
      labelAlignmentVisible={false}
      onChange={handleGuidesChange}
    />
  </div>)
}
