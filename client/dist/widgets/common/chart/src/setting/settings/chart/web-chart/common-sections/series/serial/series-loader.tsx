import { React, classNames, hooks, type QueriableDataSource, QueryScope, DataSourceManager } from 'jimu-core'
import { LoadOutlined } from 'jimu-icons/outlined/editor/load'
import { Button, Loading, LoadingType, Tooltip } from 'jimu-ui'
import defaultMessages from '../../../../../../translations/default'
import { Message } from '../components'
import { queryFieldUniqueValues } from '../../../../../../../../src/utils/common'
import { SplitByOtherSeriesValue } from '../../../../../../../../src/constants'

interface SeriesLoaderProps {
  className?: string
  dataSourceId: string
  splitByField: string
  values?: Array<string | number>
  onChange?: (values: Array<string | number>) => void
}

const NumberPerLoads = 10
const NumberMaxCount = 100

const loadSplitByValues = async (dataSource: QueriableDataSource, field: string, inputValues: Array<string | number>, count: number = NumberPerLoads): Promise<Array<string | number>> => {
  const uniqueValues = await queryFieldUniqueValues(dataSource, field, 101, QueryScope.InConfigView)
  const values: Array<string | number> = []
  let counter = 0
  uniqueValues.some((value) => {
    if (counter === count) return true
    if (value && !inputValues.includes(value)) {
      values.push(value)
      counter++
    }
    return false
  })
  return values
}

const getLoadState = (inputValues: Array<string | number>, values: Array<string | number>): 'loadout' | 'exceed' => {
  const valuesCount = values.length
  if (valuesCount === 0) return 'loadout'
  const inputValuesCount = inputValues.length
  const exceedCount = inputValuesCount + valuesCount - NumberMaxCount
  if (exceedCount >= 0) return 'exceed'
}

export const SeriesLoader = (props: SeriesLoaderProps): React.ReactElement => {
  const { className, dataSourceId, splitByField, values: propValues = [], onChange } = props
  const translate = hooks.useTranslation(defaultMessages)
  const [version, setVersion] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const messageRef = React.useRef('')

  const dataSource = React.useMemo(() => DataSourceManager.getInstance().getDataSource(dataSourceId) as QueriableDataSource, [dataSourceId])

  const handleLoadClick = async () => {
    try {
      setLoading(true)
      const inputValues = propValues.filter(value => value !== SplitByOtherSeriesValue)
      let values = await loadSplitByValues(dataSource, splitByField, inputValues)
      const state = getLoadState(inputValues, values)
      values = inputValues.concat(values)
      if (state) {
        messageRef.current = state === 'loadout' ? translate('allSeriesLoaded') : translate('tooManySeries')
        setVersion(v => v + 1)
      }
      if (state === 'exceed') {
        values = values.slice(0, NumberMaxCount)
      }
      if (state !== 'loadout') {
        values = values.concat(SplitByOtherSeriesValue)
        onChange(values)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
      messageRef.current = translate('fetchFieldValueFailed')
    }
  }

  return (<>
    <Tooltip placement='left' title={translate('loadMoreSeries')} showArrow enterDelay={300}>
      <Button aria-label={translate('loadMoreSeries')} className={classNames('series-loader', className)} size='sm' icon onClick={handleLoadClick}>
        <LoadOutlined size='m' />
      </Button>
    </Tooltip>
    <Message version={version} message={messageRef.current} />
    {loading && <Loading type={LoadingType.Secondary} />}
  </>)
}
