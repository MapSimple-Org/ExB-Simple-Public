import {
  React,
  Immutable,
  type ImmutableArray,
  type ImmutableObject,
  StatisticType
} from 'jimu-core'
import {
  withStoreThemeIntlRender,
  mockTheme,
  type WithRenderResult
} from 'jimu-for-test'
import {
  StatisticsDataSetting,
  type StatisticsDataSettingProps
} from '../../../src/setting/settings/chart/web-chart/common-sections/data'
import type { ChartDataSource, WebChartSeries } from '../../../src/config'
import { fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NumericFields, StringFields } from '../mock-field-selector'
import { getOutStatisticName } from '../../../src/utils/common/series'
const ColumnTemplate = require('../../../src/setting/template/column.json')

jest.mock('jimu-ui', () => {
  return {
    ...jest.requireActual<{ [key: string]: any }>('jimu-ui'),
    NumericInput: require('../mock-numeric-input').MockNumericInput
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
const SortFieldSelector = '.sort-select .dropdown-button-content'

const Container = (props: StatisticsDataSettingProps): React.ReactElement => {
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
    <StatisticsDataSetting
      {...others}
      chartDataSource={dataSource}
      series={series}
      onChange={handleChange}
    />
  )
}

let chartDataSource: ImmutableObject<ChartDataSource> = Immutable({
  query: {
    groupByFieldsForStatistics: [StringFields[0]],
    outStatistics: [{
      statisticType: 'sum',
      onStatisticField: NumericFields[0],
      outStatisticFieldName: getOutStatisticName(NumericFields[0], StatisticType.Sum)
    }],
    orderByFields: [`${StringFields[0]} ASC`]
  }
})

describe('<SerialDataSetting />', () => {
  let useDataSources = null
  let render: WithRenderResult = null
  describe('<SerialDataSetting />', () => {
    beforeAll(() => {
      useDataSources = [
        {
          dataSourceId: 'ds1',
          mainDataSourceId: 'ds1'
        }
      ]
      render = withStoreThemeIntlRender(true, mockTheme as any)
    })

    it('should render ok', () => {
      const series = Immutable(ColumnTemplate.series) as ImmutableArray<WebChartSeries>
      const props = {
        chartDataSource: undefined,
        series,
        useDataSources
      }
      const { getByText } = render(<StatisticsDataSetting type='barSeries' {...props} />)
      expect(getByText('Count')).toBeInTheDocument()
    })

    it('should clean ui when change category type', () => {
      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)

      const onChange = jest.fn()
      const props = {
        series: Immutable(series),
        useDataSources,
        chartDataSource,
        onChange
      }
      const { getByText, queryByText, queryBySelector, getBySelector } = render(<Container type='barSeries' {...props} />)

      expect(getByText('By group')).toBeInTheDocument()
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent(StringFields[0])
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getBySelector(SortFieldSelector)).toHaveTextContent('Category')

      fireEvent.click(getByText('By group'))
      fireEvent.click(getByText('By field'))

      expect(getByText('By field')).toBeInTheDocument()
      expect(queryBySelector(CategoryFieldSelector)).not.toBeInTheDocument()
      expect(queryByText('Sum')).toBeInTheDocument()
      expect(queryByText(NumericFields[0])).not.toBeInTheDocument()

      const serie = onChange.mock.calls[0][0][0]
      expect(serie.x).toBe('')
      const ds = onChange.mock.calls[0][1]
      expect(ds).toEqual({
        query: {
          outStatistics: []
        }
      })
    })

    it('test page size change', () => {
      const onChange = jest.fn()
      const series = ColumnTemplate.series
      series[0].id = NumericFields[0]
      series[0].x = StringFields[0]
      series[0].y = getOutStatisticName(NumericFields[0], StatisticType.Sum)
      chartDataSource = chartDataSource.setIn(['query', 'pageSize'], '99')

      const props = { series: Immutable(series), useDataSources, chartDataSource, onChange }
      const { getByText, getByDisplayValue, getBySelector } = render(<Container type='barSeries' {...props} />)

      const input = getByDisplayValue('99')
      fireEvent.change(input, { target: { value: '10' } })
      fireEvent.blur(input)
      expect(getBySelector(CategoryFieldSelector)).toHaveTextContent('Year')
      expect(getByText('Sum')).toBeInTheDocument()
      expect(getByText(NumericFields[0])).toBeInTheDocument()
      expect(getByDisplayValue('10')).toBeInTheDocument()

      const pageSize = onChange.mock.calls[0][1].query.pageSize
      expect(pageSize).toBe(10)
    })
  })
})
