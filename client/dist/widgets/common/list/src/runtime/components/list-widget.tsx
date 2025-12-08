/** @jsx jsx */
import { React, jsx, hooks, classNames, AppMode, appActions, ReactRedux, getAppStore, utils, type IMState } from 'jimu-core'
import { useListRuntimeState, useListRuntimeDispatch } from '../state'
import { WidgetPlaceholder, defaultMessages as jimuUiDefaultMessages } from 'jimu-ui'
import type { ListProps, IMConfig } from '../../config'
import { Status, ListLayoutType } from '../../config'
import { getStyle } from '../styles/style'
import { getItemColumnCount } from '../utils/list-element-util'
import { checkIsEditing, getCardSizeNumberInConfig, getBottomToolH, getListHeight, getPageSize as getPageSizeUtil, getDefaultMinListSize as getDefaultMinListSizeUtil, showBottomTools as checkShowBottomTools, showTopTools as checkShowTopTools } from '../utils/utils'
import ListElement from './list-content-element'
import TransparentMask from './list-status-component/transparent-mask'
import defaultMessages from '../translations/default'
const { useRef, useState, useEffect, Fragment } = React

const ListWidget = (props: ListProps): React.ReactElement => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessages)
  const listWidgetConRef = useRef<HTMLDivElement>(null)
  const mouseClickTimeoutRef = useRef(null)
  const hasSetLayoutRef = useRef(false)
  const configRef = useRef(null as IMConfig)
  const paginatorDivRef = useRef<HTMLDivElement>(null)
  const firstItemIndexInViewportRef = useRef(0)

  const { id, config, appMode, selectionIsSelf, selectionIsInSelf, useDataSources, layouts, builderStatus, parentSize, browserSizeMode, dispatch, selectionStatus, layoutId, layoutItemId, isHeightAuto, isWidthAuto, } = props
  const { dataSource, showSelectionOnly, widgetRect, currentCardSize, firstItemIndexInViewport, records } = useListRuntimeState()
  const listRuntimeDispatch = useListRuntimeDispatch()
  const enableDataAction = ReactRedux.useSelector((state: IMState) => state?.appConfig.widgets?.[id]?.enableDataAction)
  const isDynamicStyleSettingActive = ReactRedux.useSelector((state: IMState) => typeof state?.dynamicStyleState?.previewConditionInfo?.[id]?.conditionId === 'number')
  const needUpdateRecordIndex = ReactRedux.useSelector((state: IMState) => state?.dynamicStyleState?.previewRepeatedRecordInfo?.[id]?.needUpdateRecordIndex)

  const [isEditing, setIsEditing] = useState(false)
  const [showTopTools, setShowTopTools] = useState(false)
  const [showBottomTools, setShowBottomTools] = useState(false)
  const [forceShowMask, setForceShowMask] = useState(false)

  useEffect(() => {
    const widgetRect = getDefaultMinListSize()
    const currentCardSize = getCardSizeNumberInConfig(config, builderStatus, browserSizeMode, widgetRect)
    listRuntimeDispatch({type: 'SET_CURRENT_CARD_SIZE', value: currentCardSize})
    listRuntimeDispatch({type: 'SET_WIDGET_RECT', value: widgetRect})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    appModeChange(appMode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode])

  useEffect(() => {
    const isEditing = checkIsEditing(appMode, config, selectionIsSelf, selectionIsInSelf)
    setIsEditing(isEditing)
  }, [appMode, config, selectionIsSelf, selectionIsInSelf])

  useEffect(() => {
    firstItemIndexInViewportRef.current = firstItemIndexInViewport
  }, [firstItemIndexInViewport])


  useEffect(() => {
    if (isEditing || isDynamicStyleSettingActive || needUpdateRecordIndex) {
      dispatch(appActions.changeDynamicStylePreviewRepeatedRecordInfo(id, { recordIndex: firstItemIndexInViewportRef.current, needUpdateRecordIndex: false }))
    }
  }, [isEditing, records, isDynamicStyleSettingActive, dispatch, id, appMode, needUpdateRecordIndex])

  useEffect(() => {
    const showBottomTools = checkShowBottomTools(config, dataSource)
    setShowBottomTools(showBottomTools)
  }, [dataSource, config])

  useEffect(() => {
    setListLayoutInfoInWidgetState(layoutId, layoutItemId, id, selectionIsSelf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutId, layoutItemId, id, selectionIsSelf])

  useEffect(() => {
    const showTopTools = checkShowTopTools(id, config, useDataSources?.asMutable({ deep: true }))
    setShowTopTools(showTopTools)
  }, [dataSource, config, useDataSources, id, enableDataAction])

  useEffect(() => {
    // Reset page when 'itemsPerPage' or 'pageStyle' change
    const itemsPerPageChange = config.itemsPerPage && config.itemsPerPage !== configRef.current?.itemsPerPage
    const pageStyleChange = config.pageStyle && config.pageStyle !== configRef.current?.pageStyle
    if (itemsPerPageChange || pageStyleChange) {
      listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
    }
    configRef.current = config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    dispatch(appActions.widgetStatePropChange(id, 'selectionIsInSelf', selectionIsInSelf))
  }, [selectionIsInSelf, id, dispatch])

  useEffect(() => {
    setListParentSizeInWidgetState(browserSizeMode, id, parentSize, layoutId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserSizeMode, id, parentSize, layoutId])

  const onPointerDown = hooks.useEventCallback(evt => {
    const isInBuilder = window.jimuConfig.isInBuilder
    if(isInBuilder && appMode === AppMode.Design && !selectionIsSelf && !selectionIsInSelf) {
      handleListPointerDown(evt)
    }
  })

  const getDefaultMinListSize = hooks.useEventCallback(() => {
    return getDefaultMinListSizeUtil(config, builderStatus, browserSizeMode)
  })

  const handleListPointerDown = evt => {
    setForceShowMask(true)
    if (mouseClickTimeoutRef.current) {
      clearTimeout(mouseClickTimeoutRef.current)
    }
    mouseClickTimeoutRef.current = setTimeout(() => {
      setForceShowMask(false)
    }, 200)
  }

  const appModeChange = hooks.useEventCallback((appMode: AppMode) => {
    if (appMode !== AppMode.Design) {
      editBuilderAndSettingStatus(Status.Default)
    } else {
      if (selectionStatus !== builderStatus) {
        // change status by toc
        if (!selectionStatus) {
          if (!selectionIsSelf) {
            editBuilderAndSettingStatus(Status.Default)
          }
        } else {
          editBuilderAndSettingStatus(selectionStatus)
        }
      }
      updateShowSelectionOnly(false)
    }
  })

  const editBuilderAndSettingStatus = (status: Status) => {
    editStatus('showCardSetting', status)
    editStatus('builderStatus', status)
  }

  const updateShowSelectionOnly = (newShowSelectionOnly: boolean) => {
    listRuntimeDispatch({type: 'SET_SHOW_SELECTION_ONLY', value: showSelectionOnly})
  }

  const editStatus = (name, value) => {
    dispatch(appActions.widgetStatePropChange(id, name, value))
  }

  const setListLayoutInfoInWidgetState = (layoutId, layoutItemId, id, selectionIsSelf) => {
    if (layoutId && id && layoutItemId && !hasSetLayoutRef.current && selectionIsSelf) {
      dispatch(appActions.widgetStatePropChange(id, 'layoutInfo', { layoutId, layoutItemId }))
      hasSetLayoutRef.current = true
    }
  }

  const getPageSize = React.useCallback((options) => {
    const { config, isHeightAuto, isWidthAuto, builderStatus, browserSizeMode, showBottomTools, showTopTools, widgetRect } = options
    const bottomToolH = getBottomToolH(paginatorDivRef.current, showBottomTools)
    const listHeight = getListHeight(widgetRect, bottomToolH, showTopTools) || 1
    const columnCount = config?.layoutType === ListLayoutType.GRID ? getItemColumnCount(config, widgetRect, currentCardSize) : null

    const getPageSizeOption = {
      widgetRect: widgetRect,
      listHeight: listHeight,
      columnCount: columnCount,
      config: config,
      isHeightAuto: isHeightAuto,
      isWidthAuto: isWidthAuto,
      builderStatus: builderStatus,
      browserSizeMode: browserSizeMode
    }
    const recordSizePerPage = Math.max(getPageSizeUtil(getPageSizeOption), 1)
    return recordSizePerPage
  }, [currentCardSize])

  const setPaginatorDivRef = (ref) => {
    paginatorDivRef.current = ref
  }

  const setListParentSizeInWidgetState = (browserSizeMode, id, parentSize, layoutId) => {
    const appConfig = getAppStore().getState().appConfig
    const viewportSize = utils.findViewportSize(appConfig, browserSizeMode)

    const selector = `div.layout[data-layoutid=${layoutId}]`
    const parentElement = document.querySelector(selector)
    const newParentSize = {
      width: parentElement?.clientWidth || viewportSize.width,
      height: parentElement?.clientHeight || viewportSize.height
    }
    if (!parentSize || parentSize.height !== newParentSize.height || parentSize.width !== newParentSize.width) {
      dispatch(appActions.widgetStatePropChange(id, 'parentSize', newParentSize))
    }
  }

  useEffect(() => {
    //Update page size
    const options = {config, isHeightAuto, isWidthAuto, builderStatus, browserSizeMode, showBottomTools, showTopTools, widgetRect}
    const pageSize = getPageSize(options)
    listRuntimeDispatch({type: 'SET_PAGE_SIZE', value: pageSize})
  }, [config, isHeightAuto, isWidthAuto, builderStatus, browserSizeMode, showBottomTools, showTopTools, widgetRect, getPageSize, listRuntimeDispatch])

  return (
    <Fragment>
      {!config.itemStyle && <WidgetPlaceholder
        name={nls('_widgetLabel')}
        icon={require('../assets/icon.svg')}
        message={nls('placeHolderTip')}
      />}
      {config.itemStyle && <div
        className={classNames('jimu-widget', 'widget-list', 'list-widget-' + id)}
        ref={listWidgetConRef}
        css={getStyle(props, isEditing, showBottomTools)}
        onPointerDown={onPointerDown}
      >
        <ListElement
          {...props}
          listWidgetConRef={listWidgetConRef}
          isEditing={isEditing}
          showTopTools={showTopTools}
          showBottomTools={showBottomTools}
          setPaginatorDivRef={setPaginatorDivRef}
          paginatorDiv={paginatorDivRef.current}
        />
        <TransparentMask
          config={config}
          selectionIsInSelf={selectionIsInSelf}
          selectionIsSelf={selectionIsSelf}
          builderStatus={builderStatus}
          forceShowMask={forceShowMask}
          layouts={layouts}
        />
      </div>}
    </Fragment>
  )
}

export default ListWidget
