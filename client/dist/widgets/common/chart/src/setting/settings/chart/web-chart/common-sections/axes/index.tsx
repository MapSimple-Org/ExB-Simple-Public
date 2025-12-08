import { React, type ImmutableArray, type ImmutableObject, Immutable, hooks } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import type { ChartTypes, WebChartAxis, WebChartLabelBehavior } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../../translations/default'
import { SettingCollapse } from '../../../../components'
import { CategoryAxis } from './category-axis'
import { DateAxis } from './date-axis'
import { NumericAxis } from './numeric-axis'
import { isSerialSeries } from '../../../../../../utils/default'

export interface AxesSettingProps {
  rotated: boolean
  chartType: ChartTypes
  showLogarithmicScale?: boolean
  axes: ImmutableArray<WebChartAxis>
  horizontalAxisLabelsBehavior?: WebChartLabelBehavior
  verticalAxisLabelsBehavior?: WebChartLabelBehavior
  onChange?: (axes: ImmutableArray<WebChartAxis>) => void
  onHorizontalAxisLabelsBehaviorChange?: (value: WebChartLabelBehavior) => void
  onVerticalAxisLabelsBehaviorChange?: (value: WebChartLabelBehavior) => void
}

export const AxesSetting = (props: AxesSettingProps): React.ReactElement => {
  const {
    chartType,
    showLogarithmicScale = false,
    axes: propAxes,
    rotated,
    horizontalAxisLabelsBehavior,
    verticalAxisLabelsBehavior,
    onChange,
    onHorizontalAxisLabelsBehaviorChange,
    onVerticalAxisLabelsBehaviorChange
  } = props
  const [axisIndex, setAxisIndex] = React.useState<number>(-1)
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleClick = (index: number): void => {
    setAxisIndex(index)
  }

  const handleChange = (axis: ImmutableObject<WebChartAxis>): void => {
    onChange?.(Immutable.set(propAxes, axisIndex, axis))
  }

  const handleLabelsBehaviorChange = (value: WebChartLabelBehavior, isHorizontal: boolean): void => {
    isHorizontal ? onHorizontalAxisLabelsBehaviorChange?.(value) : onVerticalAxisLabelsBehaviorChange?.(value)
  }

  return (
    <div className='auto-axes-setting w-100' role='group' aria-label={translate('axes')}>
      {propAxes?.map((axis, index) => {
        const type = axis.valueFormat.type
        const name = index === 0 ? 'xAxis' : 'yAxis'
        const isHorizontal = (name === 'xAxis' && !rotated) || (name === 'yAxis' && rotated)
        const showValueRange = index === 0 ? (chartType === 'scatterSeries') : true
        const showIntegerOnly = index === 0 ? (chartType === 'scatterSeries') : true
        const showTickSpacing = index === 1 ? isSerialSeries(chartType) : false
        const showGuide = index === 0 ? !isSerialSeries(chartType) : true
        const singleNumericFormatSetting = index === 0 ? isSerialSeries(chartType) : false
        const labelBehavior = isHorizontal ? horizontalAxisLabelsBehavior : verticalAxisLabelsBehavior
        return (
          <SettingCollapse
            level={1}
            className='mt-2'
            key={index}
            bottomLine={index === 0}
            label={translate(name)}
            aria-label={translate(name)}
            role='group'
            isOpen={axisIndex === index}
            onRequestOpen={() => { handleClick(index) }}
            onRequestClose={() => { handleClick(-1) }}
          >
            {
              type === 'category' && (
                <CategoryAxis
                  axis={axis}
                  className='mt-4'
                  onChange={handleChange}
                  isHorizontal={isHorizontal}
                  labelBehavior={labelBehavior}
                  onLabelBehaviorChange={handleLabelsBehaviorChange}
                />
              )
            }
            {
              type === 'number' && (
                <NumericAxis
                  axis={axis}
                  className='mt-4'
                  showGuide={showGuide}
                  isHorizontal={isHorizontal}
                  showTickSpacing={showTickSpacing}
                  showValueRange={showValueRange}
                  showIntegerOnly={showIntegerOnly}
                  showLogarithmicScale={showLogarithmicScale}
                  singleNumericFormatSetting={singleNumericFormatSetting}
                  labelBehavior={labelBehavior}
                  onChange={handleChange}
                  onLabelBehaviorChange={handleLabelsBehaviorChange} />
              )
            }
            {
              type === 'date' && (
                <DateAxis
                  className='mt-4'
                  axis={axis}
                  labelBehavior={labelBehavior}
                  onChange={handleChange}
                  onLabelBehaviorChange={handleLabelsBehaviorChange} />
              )
            }
          </SettingCollapse>
        )
      })}
    </div>
  )
}

export { default as Guides } from './guide'
