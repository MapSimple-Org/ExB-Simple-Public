/** @jsx jsx */
import { React, jsx, getAppStore, AppMode, css, appActions, LayoutItemType, hooks, ReactRedux, Immutable, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import type { IMState, LayoutInfo} from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage, } from 'jimu-ui'
import { SelectionModeType, Status, ListLayout, type IMConfig } from '../../../config'
import type { AppConfigAction } from 'jimu-for-builder'
import defaultMessages from '../../translations/default'
import { SyncOnOutlined } from 'jimu-icons/outlined/editor/sync-on'
import { SyncOffOutlined } from 'jimu-icons/outlined/editor/sync-off'
import { searchUtils } from 'jimu-layouts/layout-runtime'
const { useState, useEffect, useRef, Fragment } = React

const STATES_POPPER_OFFSET = [0, 5]
const statesModifiers = [
  {
    name: 'flip',
    options: {
      boundary: document.body,
      fallbackPlacements: ['right-start', 'left-start', 'bottom-start', 'top-end', 'top-start']
    }
  }
]

const APPLY_POPPER_MODIFIERS = [
  {
    name: 'offset',
    options: {
      offset: [0, 10]
    }
  },
  {
    name: 'arrow',
    enabled: true
  }
]

interface Props {
  builderSupportModules?: any
  selectionIsInList: boolean
  selectionIsList: boolean
  hideCardTool: boolean
  config: IMConfig
  datasourceId: string
  reference: any
  itemIdex: number
  builderStatus: Status
  selection: LayoutInfo
  widgetId: string
  layouts: any
  selectCard: () => void
}

const CardEditorTools = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const linkedToHoverRef = useRef(null)
  const linkedToSelectRef = useRef(null)
  const linkedToRegularRef = useRef(null)
  const dropDownItems = useRef(null)

  const { builderSupportModules, widgetId, reference, layouts, builderStatus, selection, selectionIsInList, datasourceId, selectionIsList, hideCardTool, config } = props
  const { selectCard } = props
  const { BuilderPopper, BuilderDropDown, BuilderButton, GLOBAL_RESIZING_CLASS_NAME, GLOBAL_H5_DRAGGING_CLASS_NAME, GLOBAL_DRAGGING_CLASS_NAME } = builderSupportModules.widgetModules

  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)

  const [showTools, setShowTools] = useState(false)
  const [showBreak, setShowBreak] = useState(false)
  const [title, setTitle] = useState('')
  const [applyToVersion, setApplyToVersion] = useState(1)

  useEffect(() => {
    let showTools = true
    const notSelectList = !selectionIsInList && !selectionIsList
    if (notSelectList || appMode === AppMode.Run || hideCardTool || !datasourceId) {
      showTools = false
    }
    setShowTools(showTools)
  }, [selectionIsInList, selectionIsList, appMode, hideCardTool, datasourceId])

  useEffect(() => {
    const action: AppConfigAction = builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    const appConfig = action.appConfig

    const relatedLayoutItemsInWidget = searchUtils?.getRelatedLayoutItemsInWidgetByLayoutInfo(appConfig, selection, widgetId, browserSizeMode) || []
    const showBreak = !selectionIsList && selection && relatedLayoutItemsInWidget.length > 1

    setShowBreak(showBreak)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionIsList, selection, widgetId, browserSizeMode, searchUtils, applyToVersion])

  useEffect(() => {
    updateDropDownItemsAndTitle(showBreak, layouts, selection, builderStatus, config)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBreak, layouts, selection, builderStatus, config, browserSizeMode])

  const updateDropDownItemsAndTitle = (showBreak: boolean, layouts: any, selection: LayoutInfo, builderStatus: Status, config: IMConfig) => {
    const item = getCopyDropdownItems(showBreak, layouts, selection, builderStatus, config)
    dropDownItems.current = item
    getTitle(showBreak)
  }

  const updateApplyToVersion = hooks.useEventCallback(() => {
    setApplyToVersion(applyToVersion + 1)
  })

  const getCardToolsStyle = () => {
    return css`
      width: 100%;
      .btn {
        width: 100%;
      }
      .dropdown-toggle {
        justify-content: center;
      }
    `
  }

  const handleBuilderStatusChange = (evt, status) => {
    editStatus('showCardSetting', status)
    editStatus('builderStatus', status)
    selectCard()
    evt.stopPropagation()
    evt.nativeEvent.stopImmediatePropagation()
  }

  const editStatus = (name, value) => {
    getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, name, value))
  }

  const getCopyDropdownItems = (showBreak: boolean, layouts: any, selection: LayoutInfo, builderStatus: Status, config: IMConfig) => {
    const cardConfigs = config?.cardConfigs
    const appConfig = getAppConfig()
    const selectedLayoutItem = searchUtils.findLayoutItem(appConfig, selection)

    if (!selection || !selectedLayoutItem || !window.jimuConfig.isInBuilder) {
      return Immutable([])
    }
    const items = [] as any

    linkedToRegularRef.current = true
    linkedToSelectRef.current = cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    linkedToHoverRef.current = !!cardConfigs[Status.Hover].enable

    const isShowApplyToHover = cardConfigs[Status.Hover]?.listLayout !== ListLayout?.AUTO
    const isShowApplyToSelected = cardConfigs[Status.Selected]?.listLayout !== ListLayout?.AUTO

    const syncToHover = () => {
      if (cardConfigs[Status.Hover].enable) {
        const item = getDropDownItem(Status.Hover, layouts)
        items.push(item)
      }
    }

    const syncToSelected = () => {
      if (cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None) {
        const item = getDropDownItem(Status.Selected, layouts)
        items.push(item)
      }
    }

    const syncToRegular = () => {
      const item = getDropDownItem(Status.Default, layouts)
      items.push(item)
    }

    if (builderStatus === Status.Default) {
      isShowApplyToHover && syncToHover()
      isShowApplyToSelected && syncToSelected()
    } else if (builderStatus === Status.Hover) {
      syncToRegular()
      isShowApplyToSelected && syncToSelected()
    } else {
      syncToRegular()
      isShowApplyToHover && syncToHover()
    }

    if (showBreak) {
      items.push({
        label: nls('isolate'),
        event: handleBreakLink
      })
    }

    return items
  }

  const getDropDownItem = (status: Status, layouts) => {
    const appConfig = getAppConfig()
    const layoutId = searchUtils.findLayoutId(layouts[status], browserSizeMode, appConfig.mainSizeMode)
    const childrenWidgetId = appConfig.layouts[selection.layoutId].content[selection.layoutItemId].widgetId
    const widgetInListLayout = isWidgetInLayout(layoutId, childrenWidgetId)

    if (!widgetInListLayout) {
      status === Status.Default && (linkedToRegularRef.current = false)
      status === Status.Hover && (linkedToHoverRef.current = false)
      status === Status.Selected && (linkedToSelectRef.current = false)
    }

    let nlsKey = ''
    let linked = false
    switch (status) {
      case Status.Default:
        nlsKey = 'default'
        linked = linkedToRegularRef.current
        break
      case Status.Hover:
        nlsKey = 'hover'
        linked = linkedToHoverRef.current
        break
      case Status.Selected:
        nlsKey = 'selected'
        linked = linkedToSelectRef.current
        break
    }
    return {
      label: nls('applyTo', {
        status: nls(nlsKey).toLocaleLowerCase()
      }),
      event: evt => { handleCopyTo(evt, status,linked) }
    }
  }

  const getAppConfig = hooks.useEventCallback(() => {
    const action: AppConfigAction = builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    return action.appConfig
  })

  const isWidgetInLayout = (layoutId: string, widgetId: string): boolean => {
    const appConfig = getAppConfig()
    const searchUtils = builderSupportModules.widgetModules.searchUtils
    const widgets = searchUtils.getContentsInLayoutWithRecursiveLayouts(
      appConfig,
      layoutId,
      LayoutItemType.Widget,
      browserSizeMode
    )
    return widgets.indexOf(widgetId) > -1
  }

  const getTitle = (showBreak: boolean) => {
    let title = ''
    const appConfig = getAppConfig()
    const selectedLayoutItem = searchUtils.findLayoutItem(appConfig, selection)
    if (!selection || !selectedLayoutItem || !window.jimuConfig.isInBuilder) {
      title = ''
      setTitle(title)
      return
    }

    if (!showBreak) {
      title = nls('isolate')
      setTitle(title)
      return
    }

    if (builderStatus === Status.Default) {
      if (linkedToHoverRef.current && linkedToSelectRef.current) {
        title = nls('linkedToAnd', {
          where1: nls('selected').toLocaleLowerCase(),
          where2: nls('hover').toLocaleLowerCase()
        })
      } else if (linkedToHoverRef.current) {
        title = nls('linkedTo', {
          where: nls('hover').toLocaleLowerCase()
        })
      } else if (linkedToSelectRef.current) {
        title = nls('linkedTo', {
          where: nls('selected').toLocaleLowerCase()
        })
      }
    } else if (builderStatus === Status.Hover) {
      if (linkedToRegularRef.current && linkedToSelectRef.current) {
        title = nls('linkedToAnd', {
          where1: nls('default').toLocaleLowerCase(),
          where2: nls('selected').toLocaleLowerCase()
        })
      } else if (linkedToRegularRef.current) {
        title = nls('linkedTo', {
          where: nls('default').toLocaleLowerCase()
        })
      } else if (linkedToSelectRef.current) {
        title = nls('linkedTo', {
          where: nls('selected').toLocaleLowerCase()
        })
      }
    } else {
      if (linkedToRegularRef.current && linkedToHoverRef.current) {
        title = nls('linkedToAnd', {
          where1: nls('default').toLocaleLowerCase(),
          where2: nls('hover').toLocaleLowerCase()
        })
      } else if (linkedToRegularRef.current) {
        title = nls('linkedTo', {
          where: nls('default').toLocaleLowerCase()
        })
      } else if (linkedToHoverRef.current) {
        title = nls('linkedTo', {
          where: nls('hover').toLocaleLowerCase()
        })
      }
    }
    setTitle(title)
  }

  const handleBreakLink = hooks.useEventCallback(evt => {
    const action: AppConfigAction = builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    const appConfig = getAppConfig()
    const selectedLayoutItem = searchUtils.findLayoutItem(appConfig, selection)
    if (!selectedLayoutItem) return

    const currentLayoutId = appConfig.widgets[widgetId].layouts[builderStatus][browserSizeMode]
    const newItemId = action.duplicateLayoutItemInSameLayout({ layoutId: currentLayoutId, layoutItemId: selectedLayoutItem.id })
    // keep its position
    action.editLayoutItemProperty({ layoutId: currentLayoutId, layoutItemId: newItemId }, 'bbox', selectedLayoutItem.bbox)
      .removeLayoutItem({ layoutId: currentLayoutId, layoutItemId: selectedLayoutItem.id }, false)
    action.exec()

    getAppStore().dispatch(
      appActions.selectionChanged({
        layoutId: currentLayoutId,
        layoutItemId: newItemId
      })
    )

    evt.stopPropagation()
    evt.nativeEvent.stopImmediatePropagation()
  })

  const checkIsShowCopyPopper = (showBreak: boolean, selectionIsList: boolean, config: IMConfig) => {
    const showSync = dropDownItems.current && dropDownItems.current.length > 0
    const listLayout = config?.cardConfigs[builderStatus]?.listLayout || ListLayout.CUSTOM
    const isShowSyncOrBreak = showSync || showBreak
    const isShowCopyPopper = !selectionIsList && isShowSyncOrBreak && listLayout === ListLayout.CUSTOM
    return isShowCopyPopper
  }


  const handleCopyTo = hooks.useEventCallback((evt, status: Status, linked: boolean) => {
    let action: AppConfigAction = builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    const selectedLayoutItem = searchUtils.findLayoutItem(action.appConfig, selection)
    if (!selectedLayoutItem) return
    let appConfig = action.appConfig
    const originLayoutId = searchUtils.findLayoutId(
      layouts[builderStatus],
      browserSizeMode,
      appConfig.mainSizeMode
    )
    const desLayoutId = searchUtils.findLayoutId(
      layouts[status],
      browserSizeMode,
      appConfig.mainSizeMode
    )

    if (!linked) {
      // no target item, duplicate one
      // create a blank layout item and set widgetId
      const service = builderSupportModules.jimuForBuilderLib.LayoutServiceProvider.getService(appConfig, desLayoutId)
      const cResult = service.createBlankItem(appConfig, desLayoutId)
      appConfig = cResult[0]
      const newItemId = cResult[1]
      const destLayoutInfo = { layoutId: desLayoutId, layoutItemId: newItemId }
      const originLayoutItem = searchUtils.findLayoutItem(appConfig, { layoutId: originLayoutId, layoutItemId: selectedLayoutItem.id })

      // add widget parent
      appConfig = builderSupportModules.jimuForBuilderLib.widgetService.addParent(appConfig, selectedLayoutItem.widgetId, destLayoutInfo, browserSizeMode)

      // sync the two layout items
      action = builderSupportModules.jimuForBuilderLib.getAppConfigAction(appConfig)
      action.editLayoutItemProperty(destLayoutInfo, 'bbox', originLayoutItem.bbox)
        .editLayoutItemProperty(destLayoutInfo, 'setting', originLayoutItem.setting)
        .editLayoutItemProperty(destLayoutInfo, 'type', originLayoutItem.type)
        .editLayoutItemProperty(destLayoutInfo, 'widgetId', originLayoutItem.widgetId)
        .adjustOrderOfItem(destLayoutInfo, -1)
    } else {
      const searchUtils = builderSupportModules.widgetModules.searchUtils
      const widgetId = selectedLayoutItem.widgetId
      const widgetJson = appConfig.widgets[widgetId]
      const parents = widgetJson.parent[browserSizeMode]
      const originLayoutInfo = parents.find(item => item.layoutId === originLayoutId)
      const destLayoutInfo = parents.find(item => item.layoutId === desLayoutId)

      const originLayoutItem = searchUtils.findLayoutItem(appConfig, originLayoutInfo)
      // sync bbox and setting
      action.editLayoutItemProperty(destLayoutInfo, 'bbox', originLayoutItem.bbox)
        .editLayoutItemProperty(destLayoutInfo, 'setting', originLayoutItem.setting)
    }

    action.exec()
    evt.stopPropagation()
    evt.nativeEvent.stopImmediatePropagation()
    updateApplyToVersion()
  })

  return (<Fragment>
    <BuilderPopper
      placement='left-start'
      trapFocus={false}
      autoFocus={false}
      css={css`
        .${GLOBAL_DRAGGING_CLASS_NAME} &,
        .${GLOBAL_RESIZING_CLASS_NAME} &,
        .${GLOBAL_H5_DRAGGING_CLASS_NAME} & {
          &.popper {
            display: none;
          }
        }
      `}
      reference={reference}
      offset={STATES_POPPER_OFFSET}
      modifiers={statesModifiers}
      open={showTools}
    >
      <div
        className='status-group d-flex flex-column align-items-center p-2'
        css={getCardToolsStyle()}
      >
        <BuilderButton
          active={builderStatus === Status.Default}
          onClick={evt => { handleBuilderStatusChange(evt, Status.Default) }}
        >
          {nls('default')}
        </BuilderButton>
        {config.cardConfigs?.[Status.Hover]?.enable && (
          <BuilderButton
            active={builderStatus === Status.Hover}
            className='mt-1'
            onClick={evt => { handleBuilderStatusChange(evt, Status.Hover) }}
          >
            {nls('hover')}
          </BuilderButton>
        )}
        {config?.cardConfigs?.[Status.Selected]?.selectionMode !== SelectionModeType.None && (
          <BuilderButton
            active={builderStatus === Status.Selected}
            className='mt-1'
            onClick={evt => { handleBuilderStatusChange(evt, Status.Selected) }}
          >
            {nls('selected')}
          </BuilderButton>
        )}
        {checkIsShowCopyPopper(showBreak, selectionIsList, config) && (
          <BuilderDropDown
            className='mt-1 w-100'
            toggleIsIcon
            toggleTitle={title}
            toggleType='default'
            direction='left'
            toggleArrow={false}
            toggleContent={theme => (
              showBreak ? <SyncOnOutlined size={16}/> : <SyncOffOutlined size={16}/>
            )}
            modifiers={APPLY_POPPER_MODIFIERS}
            items={Immutable(dropDownItems.current)}
          />
        )}
      </div>
    </BuilderPopper>
  </Fragment>)
}
export default CardEditorTools
