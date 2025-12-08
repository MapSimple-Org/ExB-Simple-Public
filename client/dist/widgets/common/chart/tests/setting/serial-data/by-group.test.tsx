import type { WebChartOrderOptions, ChartDataSource, WebChartSeries } from '../../../src/config'
import { React, Immutable, StatisticType, type ImmutableObject, type ImmutableArray } from 'jimu-core'
import { withStoreThemeIntlRender, mockTheme, type WithRenderResult } from 'jimu-for-test'
import { ByGroupData, type ByGroupDataProps } from '../../../src/setting/settings/chart/web-chart/common-sections/data/by-group'
import { MockNumericInput } from '../mock-numeric-input'
import { NumericFields, StringFields } from '../mock-field-selector'
import { getOutStatisticName } from '../../../src/utils/common/series'
import { fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
const ColumnTemplate = require('../../../src/setting/template/column.json')

jest.mock('jimu-ui', () => {
  return {
    ...jest.requireActual<{ [key: string]: any }>('jimu-ui'),
    NumericInput: () => MockNumericInput
  }
})

jest.mock('../../../src/utils/common', () => {
  return {
    ...jest.requireActual<{ [key: string]: any }>('../../../src/utils/common'),
    getObjectIdField: () => 'FID'
  }
})

jest.mock('../../../src/setting/settings/chart/web-chart/components', () => {
  return {
    ...jest.requireActual<{ [key: string]: any }>('../../../src/setting/settings/chart/web-chart/components'),
    FieldSelector: require('../mock-field-selector').MockFieldSelector
  }
})

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())

const CategoryFieldSelector = '.category-field-selector .selected-field-item'
const NumericFieldSelector = '.numeric-fields-selector .selected-fields'
const NumericFieldSelectItem = '.numeric-fields-selector .field-selector-item'
const SortFieldSelector = '.sort-select .dropdown-button-content'
const SortFieldSelectorItem = '.dropdown-menu--inner .jimu-dropdown-item'

const Container = (props: ByGroupDataProps): React.ReactElement => {
  const {
    series: propSeries,
    chartDataSource: propDataSource,
    orderOptions: propOrderOptions,
    onChange,
    ...others
  } = props
  const [series, setSeries] = React.useState(propSeries)
  const [orderOptions, setOrderOptions] = React.useState(propOrderOptions)
  const [dataSource, setDataSource] = React.useState(propDataSource)

  const handleChange = (series, { chartDataSource, orderOptions }): void => {
    onChange?.(series, chartDataSource)
    setSeries(series)
    setOrderOptions(orderOptions)
    setDataSource(chartDataSource)
  }

  return (
    <ByGroupData
      {...others}
      orderOptions={orderOptions}
      chartDataSource={dataSource}
      series={series}
      onChange={handleChange}
    />
  )
}

const chartDataSource: ImmutableObject<ChartDataSource> = Immutable({
  query: {
    groupByFieldsForStatistics: [StringFields[0]],
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: NumericFields[0],
      outStatisticFieldName: getOutStatisticName(NumericFields[0], StatisticType.Sum)
    }]
  }
})

describe('<ByGroupData />', () => {
  let useDataSources = null
  let render: WithRenderResult = null
  beforeAll(() => {
    useDataSources = [
      {
        dataSourceId: 'ds1',
        mainDataSourceId: 'ds1'
      }
    ]
    render = withStoreThemeIntlRender(true, mockTheme as any)
  })

  describe('work well for empty series', () => {
    it('should render well', () => {
      const series = Immutable(ColumnTemplate.series) as ImmutableArray<WebChartSeries>
      const props = {
        chartDataSource: undefined,
        series,
        useDataSources
      }
      const { getByText, queryBySelector } = render(<ByGroupData type='barSeries' {...props} />)
      expect(getByText('Count')).toBeInTheDocument()
      expect(queryBySelector(NumericFieldSelector)).not.toBeInTheDocument()
    })
    it('category field change', () => {
      const onChange = jest.fn()
      const series = Immutable(ColumnTemplate.series) as ImmutableArray<WebChartSeries>

      const props = {
        chartDataSource: undefined,
        series,
        useDataSources,
        onChange
      }

      const { getByText, getBySelector } = render(<Container type='barSeries' {...props} />)
      fireEvent.click(getBySelector(CategoryFieldSelector))
      fireEvent.click(getByText(StringFields[1]))
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[1])
      expect(getByText('Count')).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      const serie = onChange.mock.calls[0][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.id).toBe('FID')
      expect(serie.x).toBe(StringFields[1])
      expect(serie.y).toBe('count_of_FID')
      const ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'count',
            onStatisticField: 'FID',
            outStatisticFieldName: 'count_of_FID'
          }],
          groupByFieldsForStatistics: [StringFields[1]]
        }
      })
    })
  })
  describe('work well for exist series', () => {
    it('category field change', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, getBySelector } = render(<Container type='barSeries' {...props} />)
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(
        getBySelector(CategoryFieldSelector)
      )
      fireEvent.click(getByText(StringFields[1]))
      expect(
        getBySelector(CategoryFieldSelector)
      ).toHaveTextContent(StringFields[1])
      expect(getByText('Sum')).toBeInTheDocument()
      const serie = onChange.mock.calls[0][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(StringFields[1])
      expect(serie.y).toBe(`sum_of_${NumericFields[0]}`)

      const ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: `sum_of_${NumericFields[0]}`
          }],
          groupByFieldsForStatistics: [StringFields[1]]
        }
      })
    })
    it('normal numeric fields change', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, queryByText, getBySelector, getAllBySelector } = render(<Container type='barSeries' {...props} />)
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])

      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      let serie = onChange.mock.calls[0][0][1]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(StringFields[0])
      expect(serie.y).toBe(`sum_of_${NumericFields[1]}`)

      let ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: `sum_of_${NumericFields[0]}`
          }, {
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: `sum_of_${NumericFields[1]}`
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[0])

      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      serie = onChange.mock.calls[1][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(StringFields[0])
      expect(serie.y).toBe(`sum_of_${NumericFields[1]}`)

      ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: `sum_of_${NumericFields[1]}`
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })
    })
    it('uncheck all numeric fields', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, queryByText, getBySelector, getAllBySelector } = render(<Container type='barSeries' {...props} />)
      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[0])

      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(queryByText(NumericFields[1])).not.toBeInTheDocument()

      let serie = onChange.mock.calls[0][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(StringFields[0])
      expect(serie.y).toBe('')

      let ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: '',
            outStatisticFieldName: ''
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])

      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      serie = onChange.mock.calls[1][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(StringFields[0])
      expect(serie.y).toBe(`sum_of_${NumericFields[1]}`)

      ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: `sum_of_${NumericFields[1]}`
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })
    })
    it('statisticType fields change', () => {
      const onChange = jest.fn()

      const propSeries = ColumnTemplate.series
      propSeries[0].x = StringFields[0]
      propSeries[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const props = {
        chartDataSource,
        series: Immutable(propSeries),
        useDataSources,
        orderOptions: Immutable({
          orderByFields: [`sum_of_${NumericFields[0]} ASC`],
          data: {
            orderType: 'arcgis-charts-y-value',
            preferLabel: false,
            orderBy: 'ASC'
          }
        }) as ImmutableObject<WebChartOrderOptions>,
        onChange
      }
      const { getByText, getAllByText, getBySelector, queryBySelector, getAllBySelector } = render(<Container type='barSeries' {...props} />)
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getAllByText('Value')[0]).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Value')

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])
      expect(getByText(NumericFields[1])).toBeInTheDocument()

      fireEvent.click(getByText('Sum'))
      fireEvent.click(getByText('Max'))

      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Max')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      let series = onChange.mock.calls[1][0]
      expect(series.length).toBe(2)
      expect(series[0].type).toBe('barSeries')
      expect(series[0].x).toBe(StringFields[0])
      expect(series[0].y).toBe(`max_of_${NumericFields[0]}`)

      let ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'max',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: `max_of_${NumericFields[0]}`
          }, {
            statisticType: 'max',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: `max_of_${NumericFields[1]}`
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })

      fireEvent.click(getByText('Max'))
      fireEvent.click(getByText('Count'))

      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Count')).toBeInTheDocument()
      expect(queryBySelector('.numeric-fields-selector')).not.toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      series = onChange.mock.calls[2][0]
      expect(series.length).toBe(1)
      expect(series[0].type).toBe('barSeries')
      expect(series[0].x).toBe(StringFields[0])
      expect(series[0].y).toBe('count_of_FID')

      ds = onChange.mock.calls[2][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'count',
            onStatisticField: 'FID',
            outStatisticFieldName: 'count_of_FID'
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })
    })
    it('order by fields change', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, getBySelector, getAllBySelector } = render(<Container type='barSeries' {...props} />)
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getBySelector(SortFieldSelector))
      fireEvent.click(getAllBySelector(SortFieldSelectorItem)[1])

      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Value')

      const ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: `sum_of_${NumericFields[0]}`
          }],
          groupByFieldsForStatistics: [StringFields[0]]
        }
      })
    })
  })
})
