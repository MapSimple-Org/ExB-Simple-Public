/** @jsx jsx */
import { jsx, React, DataSourceStatus, hooks } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessages } from 'jimu-ui'
import { useListRuntimeState } from '../../state'
import defaultMessages from '../../translations/default'
const { useEffect, useState } = React
interface Props {
  showRecordCount: boolean
  noDataMessage: string
}
const RecordLoadStatusA11y = (props: Props) => {
  const { dataSource, dsInfo, records } = useListRuntimeState()
  const { showRecordCount, noDataMessage } = props
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessages)

  const [recordLoadStatusString, setRecordLoadStatusString] = useState(null as string)

  useEffect(() => {
    const queryStatus = dsInfo?.status
    let newRecordLoadStatusString = null
    if (showRecordCount) {
      const dataTotal = queryStatus === DataSourceStatus.NotReady ? 0 : dataSource?.count
      const selected = queryStatus === DataSourceStatus.NotReady ? 0 : dataSource?.getSelectedRecords()?.length
      const statusString = nls('dataCount', { total: dataTotal, selected: selected })
      newRecordLoadStatusString = queryStatus === DataSourceStatus.Loaded ? `Results updated, ${statusString}` : ''
    } else {
      const updatedString = records?.length > 0 ? 'Results updated' : (noDataMessage || nls('listNoData'))
      newRecordLoadStatusString = queryStatus === DataSourceStatus.Loaded ? updatedString : ''
    }

    setRecordLoadStatusString(newRecordLoadStatusString)
  }, [dsInfo, dataSource, showRecordCount, records, nls, noDataMessage])


  return (
    <div className='sr-only'>
      {/* {recordLoadStatusString && ...} is used to ensure that recordLoadStatusString can be read */}
      {recordLoadStatusString && <div aria-live='assertive' role='alert'>{recordLoadStatusString}</div>}
    </div>
  )
}
export default RecordLoadStatusA11y