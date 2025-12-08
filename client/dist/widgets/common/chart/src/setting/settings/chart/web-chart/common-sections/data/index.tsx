import { React, type ImmutableArray, type UseDataSource, Immutable, type ImmutableObject, hooks } from 'jimu-core'
import { Select, defaultMessages as jimuUiDefaultMessage, NumericInput } from 'jimu-ui'
import { CategoryType, type WebChartOrderOptions, type ChartDataSource, type WebChartSeries } from '../../../../../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../translations/default'
import { getCategoryType, createDefaultQuery, createDefaultSerie } from '../../../../../../utils/common'
import type { CategoryFormatOptions, DateTimeFormatOptions, NumberFormatOptions, ChartTypes, WebChartLineChartSeries } from 'jimu-ui/advanced/chart'
import { useLatestDefaultValue, usePercentileStatisticsSupport } from '../../../../utils'
import type { SeriesRelatedProps } from './type'
import { ByGroupData } from './by-group'
import { ByFieldData } from './by-field'

export type * from './type'

export interface StatisticsDataSettingProps {
  type: ChartTypes
  orderOptions?: ImmutableObject<WebChartOrderOptions>
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  valueFormat?: CategoryFormatOptions | NumberFormatOptions | DateTimeFormatOptions
  onChange?: (series: ImmutableArray<WebChartSeries>, seriesRelatedProps: SeriesRelatedProps) => void
}

const CategoryTypes = {
  [CategoryType.ByGroup]: 'byGroup',
  [CategoryType.ByField]: 'byField'
}

const DefaultWebChartOrderOptions: WebChartOrderOptions = {
  data: {
    orderType: 'arcgis-charts-category',
    orderBy: 'ASC'
  }
}

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>
export const StatisticsDataSetting = (props: StatisticsDataSettingProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const {
    series,
    orderOptions,
    useDataSources,
    type = 'barSeries',
    onChange,
    valueFormat,
    chartDataSource: propChartDataSource = defaultChartDataSource,
    ...others
  } = props

  const supportPercentile = usePercentileStatisticsSupport(useDataSources?.[0]?.dataSourceId)
  const query = propChartDataSource.query
  const categoryType = getCategoryType(query) ?? CategoryType.ByGroup

  const propPageSize = query?.pageSize
  const [pageSize, setPageSize] = useLatestDefaultValue(propPageSize)

  const binTemporalData = (series?.[0] as unknown as WebChartLineChartSeries)?.binTemporalData ?? false
  const showMaxCategories = categoryType !== CategoryType.ByField && !binTemporalData

  const handleCategoryTypeChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const categoryType = evt?.currentTarget.value as CategoryType
    const serie = createDefaultSerie(series?.[0]?.asMutable({ deep: true }))
    if((serie as WebChartLineChartSeries).binTemporalData) {
      (serie as WebChartLineChartSeries).binTemporalData = false
    }
    const query = createDefaultQuery(categoryType)
    const chartDataSource = propChartDataSource.set('query', query)
    const orderOptions = categoryType === CategoryType.ByField ? DefaultWebChartOrderOptions : {}
    onChange?.(Immutable([serie]), { chartDataSource, orderOptions, query: chartDataSource.query })
  }

  const handleAcceptPageSize = (): void => {
    const chartDataSource = propChartDataSource.setIn(['query', 'pageSize'], pageSize)
    onChange?.(series, { chartDataSource })
  }

  const handlePageSizeChange = (value: number): void => {
    const pageSize = value ? Math.floor(+value) : undefined
    setPageSize(pageSize)
  }

  return (
    <div className='chart-data-setting w-100' {...others}>
      <SettingRow level={2} label={translate('categoryType')} flow='wrap' className='mt-2'>
        <Select
          size='sm'
          aria-label={translate('categoryType')}
          value={categoryType}
          onChange={handleCategoryTypeChange}
        >
          {Object.keys(CategoryType).map((categoryType, i) => (
            <option value={CategoryType[categoryType]} key={i} className='text-truncate'>
              {translate(CategoryTypes[CategoryType[categoryType]])}
            </option>
          ))}
        </Select>
      </SettingRow>
      <>
        {
          categoryType === CategoryType.ByGroup && <ByGroupData
            type={type}
            series={series}
            valueFormat={valueFormat}
            orderOptions={orderOptions}
            supportPercentile={supportPercentile}
            chartDataSource={propChartDataSource}
            useDataSources={useDataSources}
            onChange={onChange}
          ></ByGroupData>
        }
        {
          categoryType === CategoryType.ByField && <ByFieldData
            series={series}
            orderOptions={orderOptions}
            chartDataSource={propChartDataSource}
            supportPercentile={supportPercentile}
            useDataSources={useDataSources}
            onChange={onChange}
          ></ByFieldData>
        }
      </>

      {showMaxCategories && <SettingRow level={2} label={translate('maxCategories')} flow='no-wrap'>
        <NumericInput
          aria-label={translate('maxCategories')}
          style={{ width: '60px' }}
          value={pageSize}
          onChange={handlePageSizeChange}
          onAcceptValue={handleAcceptPageSize}
          min={1}
          step={1}
          size='sm'
          showHandlers={false}
        />
      </SettingRow>}
    </div>
  )
}
