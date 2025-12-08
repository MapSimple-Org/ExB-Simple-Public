import { React, type ImmutableArray, type ImmutableObject, Immutable, type UseDataSource, hooks, DataSourceManager, type QueriableDataSource } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage, type LinearUnit, DistanceUnits, CollapsableToggle, Switch } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { CategoryType, type ChartDataSource, type WebChartSeries } from '../../../../../../../config'
import defaultMessages from '../../../../../../translations/default'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { DefaultColorBySlicesOtherColor, getDefaultSeriesOutlineColor, getFillSymbol, getSeriesFillColor } from '../../../../../../../utils/default'
import { getCategoryType } from '../../../../../../../utils/common'
import { ColorModeSelector, LabelDisplaySetting, LineSymbolSetting, SimpleNumericFormatSetting } from '../../../components'
import { ColorType } from './color-type'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import type { NumberFormatOptions, WebChartPieChartSeries, ISimpleLineSymbol } from 'jimu-ui/advanced/chart'
import { getTheme2 } from 'jimu-theme'
import { MaxColorCount, PieSliceGroupingSliceId } from '../../../../../../../constants'
import { SettingCollapse } from '../../../../../components'
import { COLORS_SET } from '../components'
import { applyPieSlicesOutline, getByFieldPieSlices, useLoadingPieSlices } from './utils'

interface PieSeriesSettingProps {
  colorMatch?: boolean
  orderByFields?: ImmutableArray<string>
  colorMatchingApplied?: boolean
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  series: ImmutableArray<WebChartSeries>
  onChange?: (series: ImmutableArray<WebChartSeries>, props: { colorMatch: boolean }) => void
}

const units = [DistanceUnits.PERCENTAGE]
const defaultSeries = Immutable([])
const sliceGroupingLabel = 'Other'
const sliceGroupingColor = '#D6D6D6'
const defaultFillColor = getSeriesFillColor(0)
const defaultFillSymbol = Immutable(
  getFillSymbol(defaultFillColor, 1, 'var(--ref-palette-neutral-200)')
)

const totalNumberLimit = 50

const defaultSliceGrouping = Immutable({
  sliceId: PieSliceGroupingSliceId,
  percentageThreshold: 0,
  label: sliceGroupingLabel,
  fillSymbol: getFillSymbol(sliceGroupingColor, 1, 'var(--ref-palette-neutral-200)')
}) as any

const defaultOutlineColor = getDefaultSeriesOutlineColor('pieSeries')

export const PieSeriesSetting = (props: PieSeriesSettingProps): React.ReactElement => {
  const { series: propSeries = defaultSeries, useDataSources, chartDataSource, onChange, orderByFields, colorMatch = false, colorMatchingApplied } = props

  const theme2 = getTheme2()
  const propSerie: ImmutableObject<WebChartPieChartSeries> = propSeries[0]
  const dataLabelVisible = propSerie?.dataLabels.visible ?? false
  const dataTooltipVisible = propSerie?.dataTooltipVisible ?? true
  const alignDataLabels = propSerie.alignDataLabels ?? false
  const optimizeDataLabelsOverlapping = propSerie.optimizeDataLabelsOverlapping ?? false

  const numericValueFormat = propSerie.numericValueFormat
  const percentValueFormat = propSerie.percentValueFormat

  const displayCategoryOnDataLabel = propSerie?.displayCategoryOnDataLabel ?? true
  const displayNumericValueOnDataLabel = propSerie?.displayNumericValueOnDataLabel ?? true
  const displayPercentageOnDataLabel = propSerie?.displayPercentageOnDataLabel ?? false

  const displayCategoryOnTooltip = propSerie?.displayCategoryOnTooltip ?? true
  const displayPercentageOnTooltip = propSerie?.displayPercentageOnTooltip ?? true
  const displayNumericValueOnTooltip = propSerie?.displayNumericValueOnTooltip ?? true

  const dataLabelsOffset = propSerie?.dataLabelsOffset ?? 0
  const dataLabelsOffsetUnit: LinearUnit = { distance: dataLabelsOffset, unit: DistanceUnits.PIXEL }

  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const dataSource = React.useMemo(() => DataSourceManager.getInstance().getDataSource(dataSourceId) as QueriableDataSource, [dataSourceId])
  const query = chartDataSource?.query
  const categoryType = getCategoryType(query)
  const propSlices = propSerie?.slices
  const fillSymbol = propSerie?.fillSymbol
  const numericFields = query?.outStatistics?.map((outStatistic) => outStatistic.onStatisticField).filter((field) => !!field)

  const unmountRef = React.useRef<boolean>(false)
  hooks.useUnmount(() => { unmountRef.current = true })
  const [colors, setColors] = React.useState(COLORS_SET[0])
  const [loadSlices, loading] = useLoadingPieSlices(dataSource, query, orderByFields, propSlices, colors, totalNumberLimit)

  const propSliceGrouping = React.useMemo(() => {
    let grouping = propSerie?.sliceGrouping ?? defaultSliceGrouping
    if (!grouping.fillSymbol) {
      grouping = grouping.set('fillSymbol', defaultSliceGrouping.fillSymbol)
    }
    return grouping
  }, [propSerie?.sliceGrouping])

  const sliceGroupingFill = propSliceGrouping.fillSymbol
  const percentageThreshold = propSliceGrouping.percentageThreshold
  const percentageThresholdUnit: LinearUnit = {
    distance: percentageThreshold,
    unit: DistanceUnits.PERCENTAGE
  }

  const outline = propSerie?.fillSymbol?.outline

  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleDataLabelsVisibleChange = (visible: boolean): void => {
    let series = Immutable.setIn(propSeries, ['0', 'dataLabels', 'visible'], visible)
    if (visible) {
      series = Immutable.setIn(series, ['0', 'displayCategoryOnDataLabel'], true)
      series = Immutable.setIn(series, ['0', 'displayNumericValueOnDataLabel'], true)
    }
    onChange?.(series, { colorMatch })
  }

  const handleDataTooltipVisibleChange = (visible: boolean): void => {
    let series = Immutable.setIn(propSeries, ['0', 'dataTooltipVisible'], visible)
    if (visible) {
      series = Immutable.setIn(series, ['0', 'displayCategoryOnTooltip'], true)
      series = Immutable.setIn(series, ['0', 'displayPercentageOnTooltip'], true)
      series = Immutable.setIn(series, ['0', 'displayNumericValueOnTooltip'], true)
    }
    onChange?.(series, { colorMatch })
  }

  const handleNumericValueFormatChange = (value: ImmutableObject<NumberFormatOptions>): void => {
    const series = Immutable.setIn(propSeries, ['0', 'numericValueFormat'], value)
    onChange?.(series, { colorMatch })
  }

  const handlePercentValueFormatChange = (value: ImmutableObject<NumberFormatOptions>): void => {
    const series = Immutable.setIn(propSeries, ['0', 'percentValueFormat'], value)
    onChange?.(series, { colorMatch })
  }

  const handleDataLabelDisplayChange = (name: string, value: any): void => {
    let series = Immutable.setIn(propSeries, ['0', name], value)
    if (series[0].displayCategoryOnDataLabel === false && series[0].displayNumericValueOnDataLabel === false && !series[0].displayPercentageOnDataLabel) {
      series = Immutable.setIn(series, ['0', 'dataLabels', 'visible'], false)
    }
    onChange?.(series, { colorMatch })
  }

    const handleHoverLabelDisplayChange = (name: string, value: any): void => {
    let series = Immutable.setIn(propSeries, ['0', name], value)
    if (series[0].displayCategoryOnTooltip === false && series[0].displayPercentageOnTooltip === false && series[0].displayNumericValueOnTooltip === false) {
      series = Immutable.setIn(series, ['0', 'dataTooltipVisible'], false)
    }
    onChange?.(series, { colorMatch })
  }

  const handleLabelOffsetChange = (value: LinearUnit) => {
    const number = value.distance ?? 0
    const dataLabelsOffset = Math.floor(+number)
    const series = Immutable.setIn(propSeries, ['0', 'dataLabelsOffset'], dataLabelsOffset)
    onChange?.(series, { colorMatch })
  }

  const handleAlignDataLabels = (evt): void => {
    const checked = evt.target.checked
    const series = Immutable.setIn(propSeries, ['0', 'alignDataLabels'], checked)
    onChange?.(series, { colorMatch })
  }

  const handleOptimizeDataLabelsOverlapping = (evt): void => {
    const checked = evt.target.checked
    const series = Immutable.setIn(propSeries, ['0', 'optimizeDataLabelsOverlapping'], checked)
    onChange?.(series, { colorMatch })
  }

  const handlePercentageThreshold = (value: LinearUnit) => {
    const number = value.distance ?? 0
    const percentageThreshold = Math.floor(+number)
    const sliceGrouping = propSliceGrouping.set('percentageThreshold', percentageThreshold)
    const series = Immutable.setIn(propSeries, ['0', 'sliceGrouping'], sliceGrouping)
    onChange?.(series, { colorMatch })
  }

  const handleSliceGroupingColorChange = (value: string) => {
    const color = value || DefaultColorBySlicesOtherColor
    const sliceGrouping = propSliceGrouping.setIn(['fillSymbol', 'color'], color)
    const series = Immutable.setIn(propSeries, ['0', 'sliceGrouping'], sliceGrouping)
    onChange?.(series, { colorMatch })
  }

  const handleOutlineChange = (value: ImmutableObject<ISimpleLineSymbol>) => {
    let series = Immutable.setIn(propSeries, ['0', 'fillSymbol', 'outline'], value)
    const sliceGrouping = propSliceGrouping.setIn(['fillSymbol', 'outline'], value)
    series = Immutable.setIn(series, ['0', 'sliceGrouping'], sliceGrouping)
    const propSlices = series?.[0]?.slices
    if (propSlices) {
      const slices = applyPieSlicesOutline(propSlices, value)
      series = Immutable.setIn(series, ['0', 'slices'], slices)
    }
    onChange?.(series, { colorMatch })
  }

  const handleColorMatchChange = (colorMatch) => {
    if (colorMatch) {
      onChange?.(propSeries, { colorMatch })
    } else {
      let series = propSeries
      if (categoryType === CategoryType.ByGroup) {
        series = Immutable.setIn(
          series,
          ['0', 'fillSymbol'],
          fillSymbol.set('color', DefaultColorBySlicesOtherColor)
        )
        loadSlices(MaxColorCount, outline).then(({ value: slices }) => {
          if (unmountRef.current) return
          series = Immutable.setIn(series, ['0', 'slices'], slices)
          onChange?.(series, { colorMatch })
        })
      } else if (categoryType === CategoryType.ByField) {
        const slices = getByFieldPieSlices(numericFields, COLORS_SET[0], outline)
        series = Immutable.setIn(
          series,
          ['0', 'fillSymbol'],
          defaultFillSymbol.set('color', DefaultColorBySlicesOtherColor)
        )
        series = Immutable.setIn(series, ['0', 'slices'], slices)
        onChange?.(series, { colorMatch })
      }
    }
  }

  const handleColorChange = (series: ImmutableArray<WebChartSeries>) => {
    onChange?.(series, { colorMatch })
  }

  return (
    <div className='pie-series-setting w-100' role='group' aria-label={translate('slices')}>
      <SettingCollapse
        role='group'
        className='mt-2'
        level={2}
        bottomLine={true}
        label={translate('displayFormat')}
        aria-label={translate('displayFormat')}
        defaultIsOpen={false}
      >
        <SettingRow label={translate('valueDecimal')} className="mt-2" flow='wrap' level={3}>
          <SimpleNumericFormatSetting
            isUnifiedFractionDigits={false}
            value={numericValueFormat}
            onChange={handleNumericValueFormatChange}
          />
        </SettingRow>
        <SettingRow label={translate('percentageDecimal')} className="mt-2" flow='wrap' level={3}>
          <SimpleNumericFormatSetting
            isUnifiedFractionDigits={false}
            value={percentValueFormat}
            onChange={handlePercentValueFormatChange}
          />
        </SettingRow>
      </SettingCollapse>
      <CollapsableToggle
        role='group'
        className='mt-2'
        level={2}
        label={translate('dataLabel')}
        aria-label={translate('dataLabel')}
        isOpen={dataLabelVisible}
        bottomLine={true}
        onRequestOpen={() => { handleDataLabelsVisibleChange(true) }}
        onRequestClose={() => { handleDataLabelsVisibleChange(false) }}
      >
        <LabelDisplaySetting
          className='mt-2'
          displayCategory={displayCategoryOnDataLabel}
          displayNumericValue={displayNumericValueOnDataLabel}
          displayPercentage={displayPercentageOnDataLabel}
          onDisplayCategoryChange={(checked: boolean) => { handleDataLabelDisplayChange('displayCategoryOnDataLabel', checked) }}
          onDisplayNumericValueChange={(checked: boolean) => { handleDataLabelDisplayChange('displayNumericValueOnDataLabel', checked) }}
          onDisplayPercentageChange={(checked: boolean) => { handleDataLabelDisplayChange('displayPercentageOnDataLabel', checked) }}
        />
        <SettingRow tag='label' label={translate('alignDataLabel')} level={3} className='mt-2 pl-1'>
          <Switch
            size='sm'
            checked={alignDataLabels}
            onChange={handleAlignDataLabels}
          />
        </SettingRow>
        <SettingRow tag='label' label={translate('optimizeDataLabelOverlaps')} level={3} className='mt-2 pl-1'>
          <Switch
            size='sm'
            checked={optimizeDataLabelsOverlapping}
            onChange={handleOptimizeDataLabelsOverlapping}
          />
        </SettingRow>
        <SettingRow label={translate('labelOffset')} level={3} className='mt-2'>
          <InputUnit
            style={{ width: 77 }}
            aria-label={translate('labelOffset')}
            min={-100}
            step={1}
            max={100}
            units={units}
            value={dataLabelsOffsetUnit}
            onChange={handleLabelOffsetChange}
          />
        </SettingRow>
      </CollapsableToggle>
      <CollapsableToggle
        role='group'
        className='mt-2'
        level={2}
        label={translate('hoverLabel')}
        aria-label={translate('hoverLabel')}
        isOpen={dataTooltipVisible}
        onRequestOpen={() => { handleDataTooltipVisibleChange(true) }}
        onRequestClose={() => { handleDataTooltipVisibleChange(false) }}
      >
        <LabelDisplaySetting
          className='mt-2'
          displayCategory={displayCategoryOnTooltip}
          displayNumericValue={displayNumericValueOnTooltip}
          displayPercentage={displayPercentageOnTooltip}
          onDisplayCategoryChange={(checked: boolean) => { handleHoverLabelDisplayChange('displayCategoryOnTooltip', checked) }}
          onDisplayNumericValueChange={(checked: boolean) => { handleHoverLabelDisplayChange('displayNumericValueOnTooltip', checked) }}
          onDisplayPercentageChange={(checked: boolean) => { handleHoverLabelDisplayChange('displayPercentageOnTooltip', checked) }}
        />
      </CollapsableToggle>
      <SettingRow label={translate('grouping')} className='mt-4' level={2}>
        <div className='slice-grouping w-50 d-flex justify-content-between' role='group' aria-label={translate('grouping')}>
          <InputUnit
            className='flex-grow-1 mr-1'
            aria-label={translate('grouping')}
            min={0}
            step={1}
            max={100}
            units={units}
            value={percentageThresholdUnit}
            onChange={handlePercentageThreshold}
          />
          <ThemeColorPicker specificTheme={theme2} title={translate('groupedColor')} aria-label={translate('groupedColor')} className='flex-shrink-0 mr-1' value={sliceGroupingFill.color} onChange={handleSliceGroupingColorChange} />
        </div>
      </SettingRow>
      <SettingRow label={translate('columnOutline')} flow='wrap' level={2}>
        <LineSymbolSetting aria-label={translate('columnOutline')} type='outline' defaultColor={defaultOutlineColor} value={outline} onChange={handleOutlineChange} />
      </SettingRow>
      <SettingRow label={translate('color')} className="mt-2" level={2} flow='wrap' >
        <ColorModeSelector className='w-100' allowed={colorMatchingApplied} value={colorMatch} onChange={handleColorMatchChange} />
      </SettingRow>
      {!colorMatch && <ColorType
        className='mt-2'
        colors={colors}
        loading={loading}
        loadSlices={loadSlices}
        series={propSeries}
        defaultFillSymbol={defaultFillSymbol}
        onColorsChange={setColors}
        chartDataSource={chartDataSource}
        onChange={handleColorChange} />}
    </div>
  )
}
