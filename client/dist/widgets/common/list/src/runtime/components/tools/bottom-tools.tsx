import { React, polished, DataSourceStatus, css, hooks, ReactRedux, defaultMessages as jimuCoreDefaultMessage, type IMState, type QueriableDataSource } from 'jimu-core'
import { Pagination, Button, defaultMessages as jimuUiDefaultMessage, } from 'jimu-ui'
import { checkIsLastPage, getTotalPage, checkIsQueryCount } from '../../utils/utils'
import { PageStyle, ListLayoutType, type IMConfig } from '../../../config'
import { LeftOutlined } from 'jimu-icons/outlined/directional/left'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
import defaultMessages from '../../translations/default'
const { useState, useEffect, useRef } = React

interface ListBottomToolProps {
  isScrollEnd: boolean
  hidePageTotal: boolean
  config: IMConfig
  handleScrollUp: (evt: React.MouseEvent) => void
  handleScrollDown: (evt: React.MouseEvent) => void
  updatePage: (pageNum: number, isSwitchPage?: boolean) => void
}

const STYLE = css`
  .scroll-navigator button {
    &:not(.jimu-disabled) {
      color: inherit !important;
      border-color: inherit;
    }
  }
`

export function ListBottomTools (props: ListBottomToolProps) {
  const maxPageForHidePageTotalRef = useRef(1)
  const configRef = useRef(null as IMConfig)
  const dsRef = useRef(null as QueriableDataSource)
  const { isScrollEnd, hidePageTotal, config } = props
  const { handleScrollDown, handleScrollUp, updatePage } = props

  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)

  const { page, scrollStatus, records, dataSource, dsInfo, pageSize, showLoading } = useListRuntimeState()
  const listRuntimeDispatch = useListRuntimeDispatch()
  const isRTL = ReactRedux.useSelector((state: IMState) => state.appContext.isRTL)

  const [isCurrentPageOrNextPageIsLastPage, setIsCurrentPageOrNextPageIsLastPage] = useState(false)
  const [totalPage, setTotalPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (dsRef.current?.id !== dataSource?.id) {
      maxPageForHidePageTotalRef.current = 1
    }
    checkIsLastPageWithQueryStatus(dataSource as QueriableDataSource, dsInfo?.status, page)
    checkAndResetPage(dataSource)
    getDsTotalCount(dataSource as QueriableDataSource, dsInfo?.status, config)
    dsRef.current = dataSource as QueriableDataSource
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, dsInfo, config, page])

  useEffect(() => {
    const oldPageStyle = configRef.current?.pageStyle
    const pageStyleChange = config?.pageStyle !== oldPageStyle
    const hidePageTotalChange = config?.hidePageTotal !== configRef.current?.hidePageTotal
    if (pageStyleChange || hidePageTotalChange) {
      maxPageForHidePageTotalRef.current = 1
    }
    configRef.current = config
  }, [config])

  useEffect(() => {
    const recordsLength = records?.length
    updateIsCurrentPageOrNextPageIsLastPage(dataSource, page, pageSize, recordsLength)
    updateTotalPage(dataSource as QueriableDataSource, totalCount, config, page, recordsLength)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, pageSize, dsInfo, records, config, totalCount, page])

  const updateIsCurrentPageOrNextPageIsLastPage = (ds, page, pageSize, recordsLength) => {
    const currentPageIsLastPage = checkIsLastPage(ds, page, pageSize, recordsLength)
    const nextPageIsLastPage = checkIsLastPage(ds, page + 1, pageSize, recordsLength)
    const isLastPage = currentPageIsLastPage || nextPageIsLastPage
    setIsCurrentPageOrNextPageIsLastPage(isLastPage)
  }

  const updateTotalPage = (ds: QueriableDataSource, totalCount: number, config: IMConfig, page: number, recordsLength: number) => {
    const currentPageIsLastPage = checkIsLastPage(ds, page, pageSize, recordsLength)
    let newTotalPage
    if (config?.hidePageTotal as any === false) {
      newTotalPage = getTotalPage(totalCount, config.itemsPerPage)
    } else {
      if (currentPageIsLastPage) {
        maxPageForHidePageTotalRef.current = page
        newTotalPage = page
      } else {
        if (recordsLength < pageSize) {
          maxPageForHidePageTotalRef.current = page
          newTotalPage = page
        } else {
          newTotalPage = (page === maxPageForHidePageTotalRef.current) ? maxPageForHidePageTotalRef.current + 1 : maxPageForHidePageTotalRef.current
        }
      }
    }
    setTotalPage(newTotalPage)
  }

  const checkIsShowEndEllipsis = hooks.useEventCallback((hidePageTotal: boolean, recordsLength: number, pageSize: number) => {
    if (!hidePageTotal) return false
    const maxPageForHidePageIsLasPage = checkIsLastPage(dataSource as QueriableDataSource, maxPageForHidePageTotalRef.current, pageSize, recordsLength)
    if (maxPageForHidePageIsLasPage) {
      return false
    } else {
      return recordsLength >= pageSize
    }
  })

  const checkIsLastPageWithQueryStatus = (ds: QueriableDataSource, queryStatus: DataSourceStatus, page: number) => {
    if (queryStatus === DataSourceStatus.Loaded && queryStatus) {
      if (page > maxPageForHidePageTotalRef.current) {
        maxPageForHidePageTotalRef.current = page
      }
    }
  }

  const checkAndResetPage = hooks.useEventCallback((ds?: QueriableDataSource) => {
    const recordsLength = records?.length
    if (maxPageForHidePageTotalRef.current < 2) return
    const isLastPage = checkIsLastPage(ds, maxPageForHidePageTotalRef.current, pageSize, recordsLength)
    const preMaxPage = maxPageForHidePageTotalRef.current - 1
    const preMaxPageLastPage = checkIsLastPage(ds, preMaxPage, pageSize, recordsLength)
    if (isLastPage && preMaxPageLastPage) {
      listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
    }
  })

  const getDsTotalCount = (ds: QueriableDataSource, queryStatus: DataSourceStatus, config: IMConfig) => {
    const isQueryCount = checkIsQueryCount(config)
    if (!isQueryCount) return
    const count = ds?.count
    // total count
    if (queryStatus === DataSourceStatus.Loaded && count !== null) {
      setTotalCount(count)
    }
  }

  const handleSwitchPage = hooks.useEventCallback((pageNum: number) => {
    const totalPages = getTotalPage(totalCount, config.itemsPerPage)
    if (totalPages && (pageNum < 1 || pageNum > totalPages)) return
    updatePage(pageNum, true)
  })

  return (
    <div className='bottom-tools w-100 d-flex align-items-center justify-content-center pl-2 pr-2' css={STYLE}>
      {config.pageStyle === PageStyle.MultiPage && <Pagination
        size='sm'
        totalPage={totalPage}
        current={page}
        onChangePage={handleSwitchPage}
        disabled={showLoading}
        showEndEllipsis={checkIsShowEndEllipsis(hidePageTotal, records?.length, pageSize)}
        isLastPage={isCurrentPageOrNextPageIsLastPage}
      />}

      {config.pageStyle !== PageStyle.MultiPage && <div className='d-flex scroll-navigator'>
        <Button
          title={nls('previous')}
          disabled={scrollStatus === 'start' || records?.length < pageSize}
          type='secondary'
          size='sm'
          icon
          onClick={handleScrollUp}
        >
          {config.layoutType === ListLayoutType.Column ? <LeftOutlined size={12}/> : <UpOutlined size={12}/>}
        </Button>
        <Button
          title={nls('next')}
          disabled={scrollStatus === 'end' || isScrollEnd}
          type='secondary'
          size='sm'
          style={
            isRTL
              ? { marginRight: polished.rem(10) }
              : { marginLeft: polished.rem(10) }
          }
          icon
          onClick={handleScrollDown}
        >
          {config.layoutType === ListLayoutType.Column ? <RightOutlined/> : <DownOutlined/>}
        </Button>
      </div>}
    </div>
  )
}
