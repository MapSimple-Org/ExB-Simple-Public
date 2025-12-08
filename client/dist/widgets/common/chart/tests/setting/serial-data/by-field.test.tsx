import { fireEvent, waitFor } from '@testing-library/react'
import type { ChartDataSource, WebChartSeries } from '../../../src/config'
import { React, Immutable, type ImmutableObject, type ImmutableArray } from 'jimu-core'
import { withStoreThemeIntlRender, mockTheme, type WithRenderResult } from 'jimu-for-test'
import { ByFieldData, type ByFieldDataProps } from '../../../src/setting/settings/chart/web-chart/common-sections/data/by-field'
import { MockNumericInput } from '../mock-numeric-input'
import { NumericFields } from '../mock-field-selector'
import { ByFieldSeriesX, ByFieldSeriesY } from '../../../src/constants'
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

const Container = (props: ByFieldDataProps): React.ReactElement => {
  const {
    series: propSeries,
    chartDataSource: propDataSource,
    onChange,
    ...others
  } = props
  const [series, setSeries] = React.useState(propSeries)
  const [dataSource, setDataSource] = React.useState(propDataSource)

  const handleChange = (series, { chartDataSource }): void => {
    onChange?.(series, chartDataSource)
    setSeries(series)
    setDataSource(chartDataSource)
  }

  return (
    <ByFieldData
      {...others}
      chartDataSource={dataSource}
      series={series}
      onChange={handleChange}
    />
  )
}

const chartDataSource: ImmutableObject<ChartDataSource> = Immutable({
  query: {
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: NumericFields[0],
      outStatisticFieldName: NumericFields[0]
    }]
  }
})

describe('<ByFieldData />', () => {
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
      const { getByText, queryBySelector } = render(<ByFieldData {...props} />)
      expect(getByText('Sum')).toBeInTheDocument()
      expect(queryBySelector(CategoryFieldSelector)).not.toBeInTheDocument()
    })
  })
  describe('work well for exist series', () => {
    it('normal numeric fields change', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = ByFieldSeriesY
      series[0].x = ByFieldSeriesX
      series[0].y = ByFieldSeriesY

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, queryByText, getBySelector, getAllBySelector } = render(<Container {...props} />)
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])

      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      let serie = onChange.mock.calls[0][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(ByFieldSeriesX)
      expect(serie.y).toBe(ByFieldSeriesY)

      let ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: NumericFields[0]
          }, {
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: NumericFields[1]
          }]
        }
      })

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[0])

      expect(getByText('Sum')).toBeInTheDocument()
      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      serie = onChange.mock.calls[1][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(ByFieldSeriesX)
      expect(serie.y).toBe(ByFieldSeriesY)

      ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: NumericFields[1]
          }]
        }
      })
    })
    it('uncheck all numeric fields', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = ByFieldSeriesY
      series[0].x = ByFieldSeriesX
      series[0].y = ByFieldSeriesY

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, queryByText, getBySelector, getAllBySelector } = render(<Container {...props} />)
      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[0])

      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(queryByText(NumericFields[1])).not.toBeInTheDocument()

      let serie = onChange.mock.calls[0][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(ByFieldSeriesX)
      expect(serie.y).toBe(ByFieldSeriesY)

      let ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: []
        }
      })

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])

      expect(getByText('Sum')).toBeInTheDocument()
      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()
      expect(getByText(NumericFields[1])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      serie = onChange.mock.calls[1][0][0]
      expect(serie.type).toBe('barSeries')
      expect(serie.x).toBe(ByFieldSeriesX)
      expect(serie.y).toBe(ByFieldSeriesY)

      ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: NumericFields[1]
          }]
        }
      })
    })
    it('statistic type change', () => {
      const onChange = jest.fn()

      const propSeries = ColumnTemplate.series
      propSeries[0].id = ByFieldSeriesY
      propSeries[0].x = ByFieldSeriesX
      propSeries[0].y = ByFieldSeriesY

      const props = {
        chartDataSource,
        series: Immutable(propSeries),
        useDataSources,
        onChange
      }
      const { getByText, getBySelector, getAllBySelector } = render(<Container {...props} />)
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getBySelector(NumericFieldSelector))
      fireEvent.click(getAllBySelector(NumericFieldSelectItem)[1])
      expect(getByText(NumericFields[1])).toBeInTheDocument()

      fireEvent.click(getByText('Sum'))
      fireEvent.click(getByText('Max'))

      expect(getByText('Max')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()

      const series = onChange.mock.calls[1][0]
      expect(series.length).toBe(1)
      expect(series[0].type).toBe('barSeries')
      expect(series[0].x).toBe(ByFieldSeriesX)
      expect(series[0].y).toBe(ByFieldSeriesY)

      const ds = onChange.mock.calls[1][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'max',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: NumericFields[0]
          }, {
            statisticType: 'max',
            onStatisticField: NumericFields[1],
            outStatisticFieldName: NumericFields[1]
          }]
        }
      })
    })
    it('order by fields change', () => {
      const onChange = jest.fn()

      const series = ColumnTemplate.series
      series[0].id = ByFieldSeriesY
      series[0].x = ByFieldSeriesX
      series[0].y = ByFieldSeriesY

      const props = {
        chartDataSource,
        series: Immutable(series),
        useDataSources,
        onChange
      }
      const { getByText, getBySelector, getAllBySelector } = render(<Container {...props} />)
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getBySelector(SortFieldSelector))
      fireEvent.click(getAllBySelector(SortFieldSelectorItem)[1])

      waitFor(() => {
        expect(getBySelector(SortFieldSelector)).toHaveTextContent('Value')
      })

      const ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: [{
            statisticType: 'sum',
            onStatisticField: NumericFields[0],
            outStatisticFieldName: NumericFields[0]
          }]
        }
      })
    })
  })
})
