import { React, classNames, ReactRedux, type IMState, polished } from 'jimu-core'
import { type ListProps, ScrollList } from '../../common/scroll-list'
import { getListItemLength } from '../../common/utils'
import { BASE_LAYOUT_NAME, DROP_ZONE_PLACEHOLDER_WIDTH } from '../../../common/consts'
import { LayoutContext } from 'jimu-layouts/layout-runtime'
import { DropZone } from './drop-zone'
import { LayoutItem } from './layout-item'
import { getIsItemAccepted, removeLayoutItem } from '../utils'
import { getBuilderThemeVariables } from 'jimu-theme'
import { getVisibleOrderFromLayout, isWidgetOpening, useControlledWidgets, useWidgetChildLayoutJson } from '../../common/layout-utils'
import { OverflownStyle } from '../../../config'
import { PopupList, type PopupListProps } from '../../common/scroll-list/popup-list'

export interface LayoutListProps extends Omit<ListProps, 'lists' | 'createItem' | 'itemLength'>, Pick<PopupListProps, 'advanced' | 'itemStyle'> {
  controllerId: string
  draggable?: boolean
  onItemClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void
  markerEnabled?: boolean
  placeholder?: React.ReactNode
  overflownStyle?: OverflownStyle
  className?: string
}

export const LayoutList = React.forwardRef((props: LayoutListProps, ref: React.RefObject<HTMLDivElement>) => {
  const { controllerId, draggable, itemStyle, vertical, className, space, alignment, overflownStyle = OverflownStyle.Arrows, onItemClick, markerEnabled = true, autoSize, advanced, placeholder, onMouseDown } = props
  const layouts = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets?.[controllerId]?.layouts?.[BASE_LAYOUT_NAME])
  const layout = useWidgetChildLayoutJson(controllerId, BASE_LAYOUT_NAME)
  const order = getVisibleOrderFromLayout(layout)
  const builderTheme = getBuilderThemeVariables()
  //Get all open state widgets in controller
  const widgets = useControlledWidgets(controllerId, BASE_LAYOUT_NAME)
  const openingWidgets = Object.keys(widgets).filter((widgetId) => isWidgetOpening(widgets[widgetId]))
  const itemLength = getListItemLength(itemStyle, space)
  const placeholderProps = {
    color: polished.rgba(builderTheme?.sys.color.primary.light, 0.5),
    size: [itemLength, DROP_ZONE_PLACEHOLDER_WIDTH]
  }

  const createItem = (itemId: string, className: string, onClick?: (e: React.MouseEvent<HTMLElement>) => void, disableDrag?: boolean) => {
    const layoutItem = layout.content[itemId]
    const widgetId = (layoutItem && layoutItem.widgetId) || ''
    const active = openingWidgets.includes(widgetId)

    const removeWidget = () => {
      removeLayoutItem({ layoutId: layout.id, layoutItemId: itemId }, controllerId)
    }
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      onItemClick?.(e)
    }

    return (
      <LayoutItem
        key={itemId}
        className={classNames(`layout-${layout?.id}-item layout-item`, className)}
        layoutId={layout.id}
        layoutItemId={itemId}
        draggable={draggable && !disableDrag}
        markerEnabled={markerEnabled}
        layoutItem={layoutItem}
        active={active}
        showLabel={itemStyle.showLabel}
        showIndicator={itemStyle.showIndicator}
        showTooltip={itemStyle.showTooltip}
        labelGrowth={itemStyle.labelGrowth}
        avatar={itemStyle.avatar}
        removeWidget={removeWidget}
        onClick={handleClick}
      />
    )
  }
  const isItemAccepted = getIsItemAccepted(controllerId)

  return (layout &&
    <LayoutContext.Provider value={{ isItemAccepted }}>
      <div
        ref={ref}
        className={classNames(className, 'layout controller-layout w-100 h-100 d-flex align-items-center justify-content-center')}
        data-layoutid={layout.id}
      >
        <DropZone
          vertical={vertical}
          layout={layout}
          childClass={`layout-${layout.id}-item`}
          placeholder={placeholderProps}
          layouts={layouts}
        />
        {!placeholder && overflownStyle === OverflownStyle.PopupWindow &&
          <PopupList
            className='popup-list'
            vertical={vertical}
            space={space}
            itemStyle={itemStyle}
            alignment={alignment}
            lists={order}
            createItem={createItem}
            itemLength={itemLength}
            autoSize={autoSize}
            advanced={advanced}
            onMouseDown={onMouseDown}
          />
        }
        {!placeholder && overflownStyle === OverflownStyle.Arrows &&
          <ScrollList
            controllerId={controllerId}
            autoSize={autoSize}
            className='layout-item-list'
            vertical={vertical}
            itemLength={itemLength}
            space={space}
            alignment={alignment}
            lists={order}
            autoScrollEnd={true}
            createItem={createItem}
            onMouseDown={onMouseDown}
          />
        }
        {placeholder}
      </div>
    </LayoutContext.Provider>
  )
})
