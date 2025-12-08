/** @jsx jsx */
import { jsx, React, hooks, DataSourceStatus, AppMode, classNames, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import type { QueriableDataSource } from 'jimu-core'
import { LIST_AUTO_REFRESH_INFO_SWITCH_SIZE, ListLayoutType } from '../../../config'
import type { IMConfig } from '../../../config'
import { Button, Tooltip, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
const { useEffect, useState, useRef } = React
interface Props {
  config: IMConfig
  appMode: AppMode
  LayoutEntry: any
  showLoadingWhenConfirmSelectTemplate: boolean
}
const BASE_REFRESH_TIME = 60000
const LoadingComponent = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuCoreDefaultMessage)
  const autoRefreshLoadingTimeRef = useRef(null)
  const resetAutoRefreshTimeRef = useRef(null)
  const listRuntimeDispatch = useListRuntimeDispatch()
  const { dataSource, dsInfo, showLoading, widgetRect, lastRefreshTime } = useListRuntimeState()

  const { config, appMode, LayoutEntry, showLoadingWhenConfirmSelectTemplate } = props
  const [isShowAutoRefresh, setIsShowAutoRefresh] = useState(false)
  const [isShowTooltip, setIsShowTooltip] = useState(false)
  const [autoRefreshLoadingString, setAutoRefreshLoadingString] = useState(null as string)
  const [dsIntervalTime, setDsIntervalTime] = useState(0)

  useEffect(() => {
    checkIsShowAutoRefresh(config)
  }, [config])

  useEffect(() => {
    const listWidth = widgetRect?.width || 620
    const isShowTooltip = listWidth < LIST_AUTO_REFRESH_INFO_SWITCH_SIZE
    setIsShowTooltip(isShowTooltip)
  }, [widgetRect])

  const updateShowLoading = React.useCallback((showLoading: boolean) => {
    listRuntimeDispatch({type: 'SET_SHOW_LOADING', value: showLoading})
  }, [listRuntimeDispatch])

  const getInterval = (dataSource) => {
    const interval = (dataSource as QueriableDataSource)?.getAutoRefreshInterval() || 0
    return interval
  }

  const getLoadingStatus = React.useCallback((ds?: QueriableDataSource, queryStatus?: DataSourceStatus, showLoadingWhenConfirmSelectTemplate?: boolean) => {
    // loading
    let showLoading = false
    if (showLoadingWhenConfirmSelectTemplate || (window.jimuConfig.isInBuilder && !LayoutEntry) || (ds && queryStatus === DataSourceStatus.Loading)) {
      showLoading = true
    }

    return showLoading
  }, [LayoutEntry])

  const resetAutoRefreshTimes = React.useCallback((interval: number) => {
    clearTimeout(resetAutoRefreshTimeRef.current)
    if (interval <= 0) {
      clearInterval(autoRefreshLoadingTimeRef.current)
    }

    resetAutoRefreshTimeRef.current = setTimeout(() => {
      if (interval > 0) {
        setAutoRefreshLoadingString(nls('lastUpdateAFewTime'))
      }
    }, 0)
  }, [nls])

  const getLoadingString = React.useCallback((lastRefreshTime: number): string => {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    const time = currentTime - lastRefreshTime
    let loadingString = nls('lastUpdateAFewTime')
    if (time > BASE_REFRESH_TIME && time <= (2 * BASE_REFRESH_TIME)) {
      loadingString = nls('lastUpdateAMinute')
    } else if (time > (2 * BASE_REFRESH_TIME)) {
      loadingString = nls('lastUpdateTime', { updateTime: Math.floor(time/BASE_REFRESH_TIME) })
    }
    return loadingString
  }, [nls])

  const setRefreshLoadingString = React.useCallback((lastRefreshTime: number) => {
    clearInterval(autoRefreshLoadingTimeRef.current)
    autoRefreshLoadingTimeRef.current = setInterval(() => {
      setAutoRefreshLoadingString(getLoadingString(lastRefreshTime))
    }, BASE_REFRESH_TIME)
  }, [getLoadingString])

  const checkIsShowAutoRefresh = (config: IMConfig) => {
    let isShowAutoRefresh = config?.isShowAutoRefresh
    if (typeof (isShowAutoRefresh) !== 'boolean') {
      isShowAutoRefresh = true
    }
    setIsShowAutoRefresh(isShowAutoRefresh)
  }

  const toggleAutoRefreshLoading = React.useCallback((interval: number, lastRefreshTime: number) => {
    resetAutoRefreshTimes(interval)
    if (interval > 0 && lastRefreshTime) {
      setRefreshLoadingString(lastRefreshTime)
    }
  }, [resetAutoRefreshTimes, setRefreshLoadingString])

  const getRefreshLoadingClass = (config: IMConfig, appMode: AppMode) => {
    const { scrollBarOpen, layoutType } = config
    const isEditor = window.jimuConfig.isInBuilder && appMode === AppMode.Design
    if (!scrollBarOpen || isEditor) {
      return ''
    }
    if (layoutType === ListLayoutType.Column) {
      return 'horizon-loading'
    } else {
      return 'vertical-loading'
    }
  }

  useEffect(() => {
    //get loading status
    const showLoading = getLoadingStatus(dataSource as QueriableDataSource, dsInfo?.status, showLoadingWhenConfirmSelectTemplate)
    updateShowLoading(showLoading)

    const newInterval = getInterval(dataSource)
    setDsIntervalTime(newInterval)
  }, [dataSource, dsInfo, showLoadingWhenConfirmSelectTemplate, getLoadingStatus, updateShowLoading])

  useEffect(() => {
    if (isShowAutoRefresh) {
      isShowAutoRefresh && toggleAutoRefreshLoading(dsIntervalTime, lastRefreshTime)
    }

    return () => {
      clearInterval(autoRefreshLoadingTimeRef.current)
    }
  }, [lastRefreshTime, dsIntervalTime, isShowAutoRefresh, toggleAutoRefreshLoading])

  return (
    <div
      className={classNames(
        'position-absolute refresh-loading-con d-flex align-items-center',
        getRefreshLoadingClass(config, appMode)
      )}
    >
      {showLoading && <div className='loading-con' />}
      {(dsIntervalTime > 0 && isShowAutoRefresh) && (
        <div className={classNames('flex-grow-1 auto-refresh-loading', {'auto-refresh-loading-with-icon': isShowTooltip})}>
          {isShowTooltip && <Tooltip title={autoRefreshLoadingString} placement='top'>
            <Button className='list-auto-refresh-button' type='tertiary' aria-label={autoRefreshLoadingString}>
              <InfoOutlined />
            </Button>
          </Tooltip>}
          {!isShowTooltip && <div className='auto-refresh-string-con'>{autoRefreshLoadingString}</div>}
        </div>
      )}
    </div>
  )
}
export default LoadingComponent