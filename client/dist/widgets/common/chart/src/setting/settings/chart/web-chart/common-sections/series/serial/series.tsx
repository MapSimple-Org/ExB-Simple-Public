import { React, type ImmutableArray, classNames, type ImmutableObject, Immutable, hooks, type IMFeatureLayerQueryParams, type UseDataSource } from 'jimu-core'
import { AnchoredSidePanel } from '../../../../../components'
import { getSeriesFillColor } from '../../../../../../../utils/default'
import type { WebChartSeries } from '../../../../../../../config'
import defaultMessages from '../../../../../../translations/default'
import { SeriesItem } from './series-item'
import SplitBySeries from './split-by-series'

interface SeriesSettingProps {
  className?: string
  markSizeVisible?: boolean
  headerVisibility?: boolean
  labelVisibility?: boolean
  labelLevel?: 1 | 2 | 3
  defaultFillColor?: string
  series: ImmutableArray<WebChartSeries>
  query?: IMFeatureLayerQueryParams
  useDataSources?: ImmutableArray<UseDataSource>
  onChange?: (series: ImmutableArray<WebChartSeries>) => void
}

const NormalSeries = (props: SeriesSettingProps): React.ReactElement => {
  const { className, headerVisibility = true, labelVisibility = true, labelLevel, markSizeVisible = true, series: propSeries, onChange } = props

  const [serieIndex, setSerieIndex] = React.useState<number>(headerVisibility ? -1 : 0)
  const handleClick = (index: number): void => {
    setSerieIndex(index)
  }

  const handleChange = (serie: ImmutableObject<WebChartSeries>): void => {
    const series = Immutable.set(propSeries, serieIndex, serie)
    onChange?.(series)
  }

  return (<div className={classNames('serial-series-setting-series', className)} style={{ maxHeight: 340, overflowY: 'auto' }}>
    {propSeries?.map((serie, index) => {
      const defaultFillColor = getSeriesFillColor(index)
      return (
        <SeriesItem
          key={index}
          className={classNames({ 'mt-2': index !== 0 }, 'pr-1')}
          markSizeVisible={markSizeVisible}
          headerVisibility={headerVisibility}
          labelVisibility={labelVisibility}
          labelLevel={labelLevel}
          isOpen={serieIndex === index}
          value={serie}
          onChange={handleChange}
          defaultColor={defaultFillColor}
          onRequestOpen={() => { handleClick(index) }}
          onRequestClose={() => { handleClick(-1) }}
        />
      )
    }
    )}
  </div>)
}

const SeriesSetting = (props: SeriesSettingProps): React.ReactElement => {
  const { className, headerVisibility = true, labelVisibility = true, markSizeVisible = true, labelLevel, defaultFillColor, useDataSources, query, series, onChange } = props

  const useSplitBy = !!series?.[0]?.query?.where
  const translate = hooks.useTranslation(defaultMessages)

  return (<div className={classNames('serial-series-setting', className)}>
    {
      !useSplitBy && <NormalSeries
        className={classNames({ 'mt-3': headerVisibility, 'mt-2': !headerVisibility })}
        markSizeVisible={markSizeVisible}
        headerVisibility={headerVisibility}
        labelVisibility={labelVisibility}
        labelLevel={labelLevel}
        series={series}
        defaultFillColor={defaultFillColor}
        onChange={onChange} />
    }
    {
      useSplitBy && <AnchoredSidePanel
        level={3}
        label={translate('seriesFormat')}
        title={translate('seriesFormat')}
      >
        <SplitBySeries useDataSources={useDataSources} query={query} series={series} onChange={onChange} />
      </AnchoredSidePanel>
    }
  </div>)
}

export default SeriesSetting
