/** @jsx jsx */
import { jsx, React, hooks, DataSourceStatus, utils, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import type { QueriableDataSource } from 'jimu-core'
import { LIST_AUTO_REFRESH_INFO_SWITCH_SIZE } from '../../../config'
import type { ElementSize } from '../../../config'
import { defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { useListRuntimeState } from '../../state'

const { useEffect, useState, useRef } = React
const DataCountComponent = (props) => {
  const nls = hooks.useTranslation(jimuUIDefaultMessages, jimuCoreDefaultMessage)
  const iniDataTimeoutRef = useRef(null)

  const { dataSource, dsInfo, widgetRect } = useListRuntimeState()

  const [totalCount, setTotalCount] = useState(null as string)
  const [selected, setSelected] = useState(null as string)
  const [countMaxWidth, setCountMaxWidth] = useState(null as number)

  useEffect(() => {
    clearTimeout(iniDataTimeoutRef.current)
    iniDataTimeoutRef.current = setTimeout(() => {
      initData(widgetRect, dataSource, dsInfo?.status)
    }, 100)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetRect, dataSource, dsInfo])

  const initData = hooks.useEventCallback((widgetRect: ElementSize, ds: QueriableDataSource, queryStatus: DataSourceStatus) => {
    const listWidth = widgetRect?.width || 620
    const isSizeSmall = listWidth < LIST_AUTO_REFRESH_INFO_SWITCH_SIZE
    const countMaxWidth = isSizeSmall ? listWidth - 36 : listWidth / 2
    const dataTotal = queryStatus === DataSourceStatus.NotReady ? 0 : ds?.count
    const selected = queryStatus === DataSourceStatus.NotReady ? 0 : ds?.getSelectedRecords()?.length
    setTotalCount(getFormatNumber(dataTotal))
    setSelected(getFormatNumber(selected))
    setCountMaxWidth(countMaxWidth)
  })

  const getFormatNumber = (number: number): string => {
    const formatResult = number ? utils.formatNumber(number).join('') : '0'
    return formatResult
  }

  return (
    <div className='position-absolute data-count d-flex align-items-center' style={{ maxWidth: countMaxWidth }}>
      <div className='flex-grow-1 total-count-text text-truncate' title={nls('dataCount', { total: totalCount, selected: selected })}>
        {nls('dataCount', { total: totalCount, selected: selected })}
      </div>
    </div>
  )
}
export default DataCountComponent