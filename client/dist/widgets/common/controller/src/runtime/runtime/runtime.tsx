import { React, appActions, getAppStore, hooks } from 'jimu-core'
import { getListItemLength } from '../common/utils'
import { OverflownStyle, type IMConfig } from '../../config'
import { ScrollList } from '../common/scroll-list'
import { WidgetAvatarCard } from '../common'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import { isWidgetOpening, useControlledWidgets } from '../common/layout-utils'
import WidgetsLauncher from './widgets-launcher'
import { toggleWidget } from './utils'
import { PopupList } from '../common/scroll-list/popup-list'

export interface RuntimeProps {
  id: string
  config: IMConfig
  version?: number
  autoSize?: boolean
}

export const Runtime = (props: RuntimeProps) => {
  const { id, config, version, autoSize } = props

  const onlyOpenOne = config.behavior?.onlyOpenOne
  const vertical = config.behavior?.vertical
  const overflownStyle = config.behavior.overflownStyle || OverflownStyle.Arrows
  const card = config?.appearance?.card
  const itemLength = getListItemLength(card, config?.appearance?.space)
  const mobile = hooks.useCheckSmallBrowserSizeMode()
  const rootRef = React.useRef<HTMLDivElement>(null)
  // Get all the widgets contained in the controller
  const widgets = useControlledWidgets(id, BASE_LAYOUT_NAME)
  const widgetIds = Object.keys(widgets)
  const openingWidgets = widgetIds.filter((widgetId) => isWidgetOpening(widgets[widgetId]))

  const handleOpenWidget = React.useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const widgetId = evt.currentTarget.dataset?.widgetid
    if (!widgetId) return

    const keepOneOpened = mobile ? true : onlyOpenOne
    if (!openingWidgets.includes(widgetId)) {
      evt.stopPropagation()
    }
    toggleWidget(id, widgetId, openingWidgets, keepOneOpened, true)
  }, [mobile, onlyOpenOne, openingWidgets, id])

  //The function to create widget card
  const [autoFocus, setAutoFocus] = React.useState(false)
  const createItem = React.useCallback((id: string, className: string, onClick?: (e: React.MouseEvent<HTMLElement>) => void) => {
    const active = openingWidgets.includes(id)
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setAutoFocus(true)
      getAppStore().dispatch(appActions.widgetStatePropChange(id, 'autoFocus', true))
      onClick?.(e)
      handleOpenWidget(e)
    }
    return (
      <WidgetAvatarCard
        key={id}
        className={`${className} layout-item`}
        widgetid={id}
        markerEnabled={false}
        active={active}
        showLabel={card.showLabel}
        showIndicator={card.showIndicator}
        showTooltip={card.showTooltip}
        labelGrowth={card.labelGrowth}
        avatar={card.avatar}
        variant={card.variant}
        onClick={handleClick}
      />
    )
  }, [card, handleOpenWidget, openingWidgets])

  return (
    <div className='controller-runtime w-100 h-100'>
      <WidgetsLauncher
        id={id}
        config={config}
        version={version}
        rootRef={rootRef}
        autoFocus={autoFocus}
      />
      {overflownStyle === OverflownStyle.PopupWindow &&
        <PopupList
          ref={rootRef}
          className='runtime--popup-list'
          vertical={vertical}
          itemLength={itemLength}
          space={config.appearance?.space}
          alignment={config.behavior?.alignment}
          autoSize={autoSize}
          lists={widgetIds}
          createItem={createItem}
          itemStyle={card}
          advanced={config.appearance.advanced}
        />
      }
      {overflownStyle === OverflownStyle.Arrows &&
        <ScrollList
          ref={rootRef}
          controllerId={id}
          className={'runtime--scroll-list'}
          vertical={vertical}
          itemLength={itemLength}
          space={config.appearance?.space}
          alignment={config.behavior?.alignment}
          autoSize={autoSize}
          lists={widgetIds}
          createItem={createItem}
        />
      }
    </div>
  )
}
