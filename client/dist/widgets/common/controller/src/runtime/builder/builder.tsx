import { React, ReactRedux, type IMState, appActions, getAppStore, hooks, Immutable, type Size, AppMode, type LayoutInfo } from 'jimu-core'
import type { IMSizeMap, IMConfig } from '../../config'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import { getAppConfigAction } from 'jimu-for-builder'
import { isWidgetOpening, useControlledWidgets } from '../common/layout-utils'
import { ListPlaceholder } from '../common'
import { LayoutList } from './layout/layout-list'
import { PageContext } from 'jimu-layouts/layout-runtime'
import WidgetsLauncher from '../runtime/widgets-launcher'
import WidgetToolbar from './widget-toolbar'
import { toggleWidget } from '../runtime/utils'
import useAddWidget from './use-add-widget'

export interface BuilderProps {
  id: string
  config: IMConfig
  version?: number
  autoSize?: boolean
}

export const Builder = (props: BuilderProps) => {
  const { id, config, version, autoSize } = props

  const mobile = hooks.useCheckSmallBrowserSizeMode()
  const { viewOnly } = React.useContext(PageContext)
  const isExpressMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode === AppMode.Express)
  const rootRef = React.useRef<HTMLDivElement>(null)

  //Get all open state widgets in controller
  const widgets = useControlledWidgets(id, BASE_LAYOUT_NAME)
  const showPlaceholder = !Object.keys(widgets ?? {}).length

  hooks.useUpdateEffect(() => {
    // After adding the first widget or removing the last widget, update the "manage widgets" tool state.
    getAppStore().dispatch(appActions.widgetToolbarStateChange(id, ['controller-manage-widgets']))
  }, [id, showPlaceholder])

  const clickXY = React.useRef([0, 0])
  const widgetIds = Object.keys(widgets)
  const openingWidgets = widgetIds.filter((widgetId) => isWidgetOpening(widgets[widgetId]))
  const onlyOpenOne = config.behavior?.onlyOpenOne
  const keepOneOpened = mobile ? true : onlyOpenOne
  const notMainSizeMode = ReactRedux.useSelector((state: IMState) => state.browserSizeMode !== state.appConfig.mainSizeMode)
  const handleItemClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const reference = evt.currentTarget
    const widgetId = reference.dataset?.widgetid
    const isDragging = clickXY.current[0] !== evt.clientX || clickXY.current[1] !== evt.clientY
    if (!widgetId || isDragging) return
    if (!openingWidgets.includes(widgetId)) {
      evt.stopPropagation()
    }
    toggleWidget(id, widgetId, openingWidgets, keepOneOpened, !viewOnly && !(isExpressMode && notMainSizeMode))
  }
  const handleMouseDown: React.MouseEventHandler = (e) => {
    clickXY.current = [e.clientX, e.clientY]
  }

  const onWidgetSizeChanged = (widgetId: string, _size: Size) => {
    if (!widgetId) {
      return
    }
    let size = config?.behavior.size || Immutable({}) as IMSizeMap
    size = size.set(widgetId, _size)
    const newConfig = config.setIn(['behavior', 'size'], size)
    getAppConfigAction().editWidgetConfig(id, newConfig).exec()
  }

  const vertical = config.behavior.vertical
  const itemStyle = config.appearance.card
  const space = config.appearance.space
  const alignment = config.behavior.alignment
  const overflownStyle = config.behavior.overflownStyle

  const placeholder = React.useMemo(() => <ListPlaceholder
    size={itemStyle.avatar?.size}
    buttonSize={itemStyle.avatar?.buttonSize}
    space={vertical ? space : itemStyle.labelGrowth}
    shape={itemStyle.avatar?.shape}
    vertical={vertical}
    alignment={alignment}
  />, [alignment, itemStyle.avatar?.buttonSize, itemStyle.avatar?.shape, itemStyle.avatar?.size, itemStyle.labelGrowth, space, vertical])

  // In express, open and select the widget after adding
  const openingWidgetsRef = hooks.useLatest(openingWidgets)
  const afterAddWidget = React.useCallback((layoutInfo: LayoutInfo) => {
    if (layoutInfo && isExpressMode) {
      setTimeout(() => {
        const widgetId = getAppStore().getState().appConfig.layouts[layoutInfo.layoutId]?.content?.[layoutInfo.layoutItemId]?.widgetId
        toggleWidget(id, widgetId, openingWidgetsRef.current, keepOneOpened, true)
      }, 50)
    }
  }, [id, isExpressMode, keepOneOpened, openingWidgetsRef])

  useAddWidget(id, afterAddWidget)

  return <div className='controller-builder w-100 h-100' ref={rootRef}>
    <WidgetsLauncher
      id={id}
      config={config}
      version={version}
      rootRef={rootRef}
      onResizeStop={onWidgetSizeChanged}
    />
    {!isExpressMode && <WidgetToolbar id={id} />}
    <LayoutList
      autoSize={autoSize}
      vertical={vertical}
      controllerId={id}
      onItemClick={handleItemClick}
      onMouseDown={handleMouseDown}
      itemStyle={itemStyle}
      draggable={true}
      markerEnabled={!viewOnly && !isExpressMode}
      space={space}
      alignment={alignment}
      overflownStyle={overflownStyle}
      placeholder={showPlaceholder ? placeholder : null}
      advanced={config.appearance.advanced}
    />
  </div>
}
