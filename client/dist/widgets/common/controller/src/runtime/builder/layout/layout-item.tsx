import { React, type IMLayoutItemJson, classNames } from 'jimu-core'
import { withRnd } from 'jimu-layouts/layout-builder'
import { type WidgetAvatarCardProps, WidgetAvatarCard } from '../../common'

type WidgetRndAvatarCardProps = WidgetAvatarCardProps & {
  layoutId: string
  layoutItem: IMLayoutItemJson
  layoutItemId: string
  useDragHandler: boolean
}

const WidgetRndAvatarCard = withRnd(false)(WidgetAvatarCard as any) as unknown as (props: WidgetRndAvatarCardProps) => React.JSX.Element

export interface ControllerLayoutItemProps extends Omit<WidgetAvatarCardProps, 'widgetid' | 'onMarkerClick' | 'useDragHandler'> {
  draggable?: boolean
  layoutId: string
  layoutItem: IMLayoutItemJson
  layoutItemId: string
  removeWidget: (widgetId: string) => void
  className?: string
}

export const LayoutItem = (props: ControllerLayoutItemProps) => {
  const {
    className,
    draggable,
    layoutId,
    layoutItem,
    onClick,
    showLabel,
    showIndicator,
    showTooltip,
    labelGrowth,
    markerEnabled,
    avatar,
    active,
    removeWidget
  } = props
  return (
    <WidgetRndAvatarCard
      className={classNames(className, 'layout-item', 'align-items-center')}
      layoutId={layoutId}
      layoutItem={layoutItem}
      widgetid={layoutItem.widgetId}
      layoutItemId={layoutItem.id}
      markerEnabled={markerEnabled}
      showLabel={showLabel}
      showIndicator={showIndicator}
      showTooltip={showTooltip}
      labelGrowth={labelGrowth}
      avatar={avatar}
      active={active}
      editDraggable={draggable}
      useDragHandler={true}
      onClick={onClick}
      onMarkerClick={() => { removeWidget(layoutItem.widgetId) }}
    />
  )
}
