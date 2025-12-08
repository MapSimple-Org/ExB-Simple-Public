import {
  React, appActions, getAppStore, type Size, hooks, ReactRedux, type IMState,
  type IMRuntimeInfos, type IMLayoutJson, AppMode, focusElementInKeyboardMode
} from 'jimu-core'
import type { IMSizeMap, IMConfig } from '../../config'
import { BASE_LAYOUT_NAME, DEFAULT_WIDGET_START_POSITION, DEFAULT_PANEL_SIZE, DEFAULT_PANEL_SPACE } from '../../common/consts'
import { getLayoutItemId, isWidgetOpening, useControlledWidgets, useSelectedWidgetId, useWidgetChildLayoutJson } from '../common/layout-utils'
import { MobileWidgetLuncher } from './mobile-widget-luncher'
import { MultipleWidgetsLuncher } from './multiple-widgets-luncher'
import { SingleWidgetsLuncher } from './single-widget-luncher'
import { getMoreButtonNode, getWidgetButtonNode, toggleWidget } from './utils'
import { PageContext, searchUtils } from 'jimu-layouts/layout-runtime'
import { OffPanelWidgetsLuncher } from './off-panel-widget-launcher'
import { VisibleContext } from '../widget'

interface WidgetsLauncherProps {
  id: string
  config: IMConfig
  version: number
  rootRef: React.RefObject<HTMLDivElement>
  autoFocus?: boolean
  onResizeStop?: (widgetId: string, size: Size) => void
}

export interface CommonLauncherProps {
  widgets: IMRuntimeInfos
  layout: IMLayoutJson
  onClick: (evt: React.MouseEvent<HTMLDivElement>, widgetId: string) => void
  onClose?: (evt: React.MouseEvent<any> | React.KeyboardEvent<any> | React.TouchEvent<any>, widgetId: string) => void
}

export interface FloatingLauncherProps extends CommonLauncherProps {
  sizes: IMSizeMap
  autoFocus: boolean
  onResizeStop?: (widgetId: string, size: Size) => void
}

//If current widget place in map widget, the id of map widget will be passed to the mobile panel
export const useContainerMapId = (id: string): string => {
  return ReactRedux.useSelector((state: IMState) => {
    const appConfig = state.appConfig
    const browserSizeMode = state.browserSizeMode
    const layoutInfosObject = appConfig.widgets[id].parent
    let layoutInfos = layoutInfosObject[browserSizeMode] ?? []
    // In Auto mode, SMALL and MEDIUM do not own a layout. So adopt LARGE's layout.
    if (layoutInfos.length === 0) {
      const mainSizeMode = appConfig.mainSizeMode
      layoutInfos = layoutInfosObject[mainSizeMode] ?? []
    }
    const layoutId = layoutInfos[0]?.layoutId
    const containerId = searchUtils.getWidgetIdThatUseTheLayoutId(appConfig, layoutId)
    const container = appConfig.widgets[containerId]
    return container?.manifest?.name === 'arcgis-map' ? container.id : ''
  })
}

export default function WidgetsLauncher (props: WidgetsLauncherProps) {
  const { id, config, version, rootRef, autoFocus = true, onResizeStop } = props
  const { viewOnly } = React.useContext(PageContext)

  // mode: mobile, single, multiple
  const mobile = hooks.useCheckSmallBrowserSizeMode()
  const onlyOpenOne = config.behavior?.onlyOpenOne
  const arrangement = config?.behavior?.arrangement ?? 'floating'
  const singleFloatingMode = onlyOpenOne && arrangement === 'floating'
  const multiFloatingMode = !onlyOpenOne && arrangement === 'floating'

  // common props
  const layout = useWidgetChildLayoutJson(id, BASE_LAYOUT_NAME)
  const handleClickWidget = React.useCallback((evt: React.MouseEvent<HTMLDivElement>, widgetId: string) => {
    evt.stopPropagation()
    const fakeEvent = new CustomEvent('click')
    fakeEvent.composedPath = () => evt.nativeEvent.composedPath()
    window.dispatchEvent(fakeEvent)
    const state = getAppStore().getState()
    const isExpressMode = state.appRuntimeInfo.appMode === AppMode.Express
    const notMainSizeMode = state.browserSizeMode !== state.appConfig.mainSizeMode
    if (viewOnly || (isExpressMode && notMainSizeMode)) return
    const layoutId = layout?.id
    const layoutItemId = getLayoutItemId(layout, widgetId)
    const selection = getAppStore().getState().appRuntimeInfo?.selection

    if (!selection || selection.layoutId !== layoutId || selection.layoutItemId !== layoutItemId) {
      getAppStore().dispatch(appActions.selectionChanged({ layoutId, layoutItemId }))
    }
  }, [layout, viewOnly])
  const handleCloseWidget = React.useCallback((evt: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>, widgetId: string) => {
    if (!widgetId) return
    evt?.stopPropagation()
    evt?.preventDefault()
    getAppStore().dispatch(appActions.closeWidget(widgetId))
    const widgetButtonNode = getWidgetButtonNode(widgetId) || getMoreButtonNode(id)
    focusElementInKeyboardMode(widgetButtonNode)
    getAppStore().dispatch(appActions.selectionChanged(null))
  }, [id])

  // mobile props
  const containerMapId = useContainerMapId(id)

  // single & off panel props
  const placement = !config.behavior?.vertical ? 'bottom-start' : 'right-start'

  // multiple props
  const displayType = config.behavior?.displayType
  const isRTL = getAppStore()?.getState()?.appContext?.isRTL
  const widgetsLuncherStart = React.useMemo(() => {
    return isRTL ? { ...DEFAULT_WIDGET_START_POSITION, x: document.body.clientWidth - DEFAULT_PANEL_SIZE.width - DEFAULT_WIDGET_START_POSITION.x } : DEFAULT_WIDGET_START_POSITION
  }, [isRTL])
  const widgetsLuncherSpace = React.useMemo(() => isRTL ? { ...DEFAULT_PANEL_SPACE, x: -DEFAULT_PANEL_SPACE.x } : DEFAULT_PANEL_SPACE, [isRTL])

  // single & multiple props
  const size = config.behavior?.size

  const widgets = useControlledWidgets(id, BASE_LAYOUT_NAME)
  const latestWidgets = hooks.useLatest(widgets)
  const widgetIds = Object.keys(widgets)
  // when selecting a widget from TOC, open its panel
  const selectedWidgetId = useSelectedWidgetId()
  hooks.useUpdateEffect(() => {
    const widgetIds = Object.keys(latestWidgets.current)
    const openingWidgets = widgetIds.filter((widgetId) => isWidgetOpening(latestWidgets.current[widgetId]))
    if (widgetIds.includes(selectedWidgetId) && !openingWidgets.includes(selectedWidgetId)) {
      toggleWidget(id, selectedWidgetId, openingWidgets, config.behavior.onlyOpenOne)
    }

  }, [config.behavior.onlyOpenOne, id, selectedWidgetId, latestWidgets])

  const closeWidgets = React.useCallback(() => {
    const widgets = latestWidgets.current
    const widgetIds = Object.keys(widgets)
    const openingWidgets = widgetIds.filter((widgetId) => isWidgetOpening(widgets[widgetId]))
    getAppStore().dispatch(appActions.closeWidgets(openingWidgets))
  }, [latestWidgets])

  // When version changed(it means in builder and related config changed), reset widgets' state
  hooks.useUpdateEffect(() => {
    getAppStore().dispatch(appActions.resetWidgetsState(widgetIds))
  }, [version])
  // When currentPageId changed, close opening widgets
  const currentPageId = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.currentPageId)
  hooks.useUpdateEffect(() => {
    closeWidgets()
  }, [currentPageId])
  //When widget mounted, trigger open at start widgets
  const rootVisible = React.useContext(VisibleContext)
  const isInBuilder = ReactRedux.useSelector((state: IMState) => state.appContext.isInBuilder)
  const openStarts = config.behavior?.openStarts as unknown as string[]
  React.useEffect(() => {
    if (!rootVisible) {
      closeWidgets()
    } else if (!isInBuilder && openStarts?.length > 0) {
      getAppStore().dispatch(appActions.openWidgets(openStarts))
    }
  }, [closeWidgets, isInBuilder, openStarts, rootVisible])

  const widgetIdsOffPanel = ReactRedux.useSelector((state: IMState) => {
    const widgetsJson = state.appConfig.widgets
    return widgetIds.filter(widgetId => {
      if (mobile) {
        return widgetsJson[widgetId].manifest.name === 'controller'
      } else {
        return widgetsJson[widgetId].offPanel
      }
    }).join(',')
  }, ReactRedux.shallowEqual)

  const widgetIdsInPanel = widgetIds.filter(widgetId => !widgetIdsOffPanel.split(',').includes(widgetId)).join(',')

  const widgetsOffPanel = React.useMemo(() => {
    return widgets.without.apply(widgets, widgetIdsInPanel.split(','))
  }, [widgetIdsInPanel, widgets])

  const widgetsInPanel = React.useMemo(() => {
    return widgets.without.apply(widgets, widgetIdsOffPanel.split(','))
  }, [widgetIdsOffPanel, widgets])

  return <React.Fragment>
    {
      mobile && <MobileWidgetLuncher
        containerMapId={containerMapId}
        layout={layout}
        widgets={widgetsInPanel}
        rootVisible={rootVisible}
        onClick={handleClickWidget}
        onClose={handleCloseWidget}
      />
    }
    {!mobile && singleFloatingMode && <SingleWidgetsLuncher
      sizes={size}
      root={rootRef.current}
      placement={placement}
      widgets={widgetsInPanel}
      layout={layout}
      autoFocus={autoFocus}
      onResizeStop={onResizeStop}
      onClick={handleClickWidget}
      onClose={handleCloseWidget}
    />}
    {!mobile && multiFloatingMode && <MultipleWidgetsLuncher
      sizes={size}
      rootVisible={rootVisible}
      mode={displayType}
      start={widgetsLuncherStart}
      spaceX={widgetsLuncherSpace.x}
      spaceY={widgetsLuncherSpace.y}
      widgets={widgetsInPanel}
      layout={layout}
      autoFocus={autoFocus}
      onResizeStop={onResizeStop}
      onClick={handleClickWidget}
      onClose={handleCloseWidget}
    />}
    <OffPanelWidgetsLuncher
      root={rootRef.current}
      placement={placement}
      widgets={widgetsOffPanel}
      layout={layout}
      onClick={handleClickWidget}
      onClose={handleCloseWidget}
    />
  </React.Fragment>
}
