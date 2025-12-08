import { React, type ImmutableArray, Immutable, hooks, getAppStore, type IMFeatureLayerQueryParams, type UseDataSource, type ImmutableObject } from 'jimu-core'
import { Select, defaultMessages as jimuUiDefaultMessage, Switch, CollapsableToggle, Slider } from 'jimu-ui'
import { getSeriesType, type WebChartLineChartSeries, type WebChartStackedKinds } from 'jimu-ui/advanced/chart'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { CategoryType, type ChartComponentOptions, type WebChartSeries } from '../../../../../../../config'
import defaultMessages from '../../../../../../translations/default'
import { ColorModeSelector, TextAlignment, TextAlignments } from '../../../components'
import { getCategoryType } from '../../../../../../../utils/common'
import SeriesSetting from './series'
interface SerialSeriesSettingProps {
  rotated?: boolean
  colorMatch?: boolean
  colorMatchingApplied?: boolean
  stackedType?: WebChartStackedKinds
  series: ImmutableArray<WebChartSeries>
  query?: IMFeatureLayerQueryParams
  useDataSources?: ImmutableArray<UseDataSource>
  options: ImmutableObject<ChartComponentOptions>
  onOptionsChange: (options: ImmutableObject<ChartComponentOptions>) => void
  onChange?: (series: ImmutableArray<WebChartSeries>, props: { colorMatch: boolean }) => void
  onStackedTypeChange?: (stackedType: WebChartStackedKinds) => void
}

const DefaultSeries: any = Immutable([])
export const SerialSeriesSetting = (props: SerialSeriesSettingProps): React.ReactElement => {
  const { useDataSources, query, series: propSeries = DefaultSeries, stackedType, rotated = false, colorMatch = false, options, colorMatchingApplied, onChange, onOptionsChange, onStackedTypeChange } = props
  const valueLabelVisible = propSeries[0]?.dataLabels.visible ?? false
  const dataTooltipVisible = propSeries[0]?.dataTooltipVisible ?? true
  const hideOversizedStackedLabels = propSeries[0]?.hideOversizedStackedLabels ?? false
  const { current: isRTL } = React.useRef(getAppStore().getState().appContext.isRTL)

  const seriesType = getSeriesType(propSeries)
  const categoryType = getCategoryType(query)
  const useSplitBy = !!propSeries?.[0]?.query?.where
  const multiSeries = propSeries?.length > 1
  const colorModeVisibility = categoryType !== CategoryType.ByField && (!multiSeries || useSplitBy)
  const valuePointerVisibility = seriesType === 'lineSeries' && colorModeVisibility
  const seriesSettingVisibility = !colorMatch || (colorMatch && ((multiSeries && !useSplitBy) || categoryType === CategoryType.ByField))
  const colorMatchAllowed = !(propSeries?.[0]?.x && propSeries?.[0]?.y) ? undefined : colorMatchingApplied
  const alignmentName = rotated ? 'horizontalAlignment' : 'verticalAlignment'
  const alignments = TextAlignments[alignmentName]
  const alignment = propSeries?.[0]?.dataLabels.content[alignmentName] ?? alignments[2]
  const markerVisible = (propSeries?.[0] as ImmutableObject<WebChartLineChartSeries>)?.markerVisible ?? false
  const markerSize = (propSeries?.[0] as ImmutableObject<WebChartLineChartSeries>)?.markerSymbol?.size

  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleStackedTypeChange = (
    evt: React.MouseEvent<HTMLSelectElement>
  ): void => {
    const stackedType = evt.currentTarget.value as WebChartStackedKinds
    onStackedTypeChange?.(stackedType)
  }

  const handleDataLabelsVisibleChange = (visible: boolean): void => {
    const series = propSeries?.map(propSerie => {
      return propSerie.setIn(['dataLabels', 'visible'], visible)
    })
    onChange?.(series, { colorMatch })
  }

  const handleDataTooltipVisibleChange = (evt): void => {
    const visible = evt.target.checked
    const series = propSeries?.map(propSerie => {
      return propSerie.set('dataTooltipVisible', visible)
    })
    onChange?.(series, { colorMatch })
  }

  const handleColorMatchChange = (colorMatch) => {
    onChange?.(propSeries, { colorMatch })
  }

  const handleAlignmentChange = (alignment): void => {
    const series = propSeries?.map(propSerie => {
      return propSerie.setIn(['dataLabels', 'content', alignmentName], alignment)
    })
    onChange?.(series, { colorMatch })
  }

  const handleHideOversizedStackedLabelsChange = (evt): void => {
    const hideOversizedStackedLabels = evt.target.checked
    const series = propSeries?.map(propSerie => {
      return propSerie.set('hideOversizedStackedLabels', hideOversizedStackedLabels)
    })
    onChange?.(series, { colorMatch })
  }

  const handleSeriesColorChange = (series) => {
    onChange?.(series, { colorMatch })
  }

  const handleMarkerVisibleChange = (evt): void => {
    const visible = evt.target.checked
    const series = propSeries?.map(propSerie => {
      return propSerie.set('markerVisible', visible)
    })
    onChange?.(series, { colorMatch })
  }

  const handleMarkerSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value) || 0
    const series = propSeries?.map(propSerie => {
      return propSerie.setIn(['markerSymbol', 'size'], value)
    })
    onChange?.(series, { colorMatch })
  }

  const handleHideEmptySeriesChange = (hideEmptySeries) => {
    onOptionsChange?.(options.set('hideEmptySeries', hideEmptySeries))
  }

  return (
    <div className='serial-series-setting w-100' role='group' aria-label={translate('series')}>
      <SettingRow label={translate('stacking')} className='mt-3' level={2}>
        <Select
          size='sm'
          aria-label={translate('stacking')}
          className='w-50'
          value={stackedType}
          onChange={handleStackedTypeChange}
        >
          <option value={'sideBySide'}>
            {translate('sideBySide')}
          </option>
          <option value={'stacked'}>
            {translate('stacked')}
          </option>
          <option value={'stacked100'}>
            {`${translate('stacked')} ${isRTL ? '100%' : '%100'}`}
          </option>
        </Select>
      </SettingRow>
      <CollapsableToggle
        role='group'
        className='mt-3'
        level={2}
        label={translate('dataLabel')}
        aria-label={translate('dataLabel')}
        isOpen={valueLabelVisible}
        onRequestOpen={() => { handleDataLabelsVisibleChange(true) }}
        onRequestClose={() => { handleDataLabelsVisibleChange(false) }}
      >
        <SettingRow
          level={3}
          truncateLabel={true}
          className='label-alignment w-100 mt-3'
          label={translate('alignment')}
          flow='no-wrap'
        >
          <TextAlignment
            aria-label={translate('alignment')}
            vertical={!rotated}
            className='w-50'
            value={alignment}
            onChange={handleAlignmentChange}
          />
        </SettingRow>
        {stackedType !== 'sideBySide' && <SettingRow
          level={3}
          truncateLabel={true}
          className='label-optimization w-100 mt-3'
          tag='label'
          label={translate('optimizeLabelDisplay')}
          flow='no-wrap'
        >
          <Switch
            checked={hideOversizedStackedLabels}
            onChange={handleHideOversizedStackedLabelsChange}
          />
        </SettingRow>}
      </CollapsableToggle>
      <SettingRow tag='label' label={translate('hoverLabel')} className='mt-3' level={2}>
        <Switch
          checked={dataTooltipVisible}
          onChange={handleDataTooltipVisibleChange}
        />
      </SettingRow>
      {valuePointerVisibility && <>
        <SettingRow tag='label' label={translate('valuePoint')} className='mt-3' level={2} >
          <Switch
            checked={markerVisible}
            onChange={handleMarkerVisibleChange}
          />
        </SettingRow>
        {
          markerVisible && <SettingRow label={translate('size')} className='mt-3' level={3} >
            <Slider
              aria-label={translate('size')}
              min={0}
              step={1}
              max={25}
              style={{ width: '60%' }}
              value={markerSize}
              onChange={handleMarkerSizeChange}
            />
          </SettingRow>
        }
      </>}
      {colorModeVisibility && <SettingRow label={translate('color')} className='mt-3' level={2} flow='wrap' >
        <ColorModeSelector className='w-100' allowed={colorMatchAllowed} value={colorMatch} onChange={handleColorMatchChange} />
      </SettingRow>}
      {seriesSettingVisibility && <SeriesSetting
        query={query}
        series={propSeries}
        labelLevel={(!colorModeVisibility && !multiSeries) ? 2 : 3}
        markSizeVisible={multiSeries}
        headerVisibility={multiSeries}
        labelVisibility={multiSeries}
        useDataSources={useDataSources}
        onChange={handleSeriesColorChange} />}
      <SettingRow className='mt-3' level={2} tag='label' label={translate('hideEmptySeries')}>
        <Switch
          checked={options.hideEmptySeries}
          onChange={(_, checked) => { handleHideEmptySeriesChange(checked) }}
        />
      </SettingRow>
    </div>
  )
}
