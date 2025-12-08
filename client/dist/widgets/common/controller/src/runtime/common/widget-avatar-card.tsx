import { React, type IMState, ReactRedux } from 'jimu-core'
import { AvatarCard, type AvatarCardProps } from './avatar-card'
import { Loading } from 'jimu-ui'
import closeOutlined from 'jimu-icons/svg/outlined/editor/close.svg'

export interface WidgetAvatarCardProps extends Omit<AvatarCardProps, 'icon' | 'autoFlip' | 'label' | 'marker'> {
  markerEnabled?: boolean
  className?: string
}

export const WidgetAvatarCard = (props: WidgetAvatarCardProps) => {
  const {
    markerEnabled,
    onMarkerClick,
    widgetid,
    showLabel,
    showIndicator,
    showTooltip,
    labelGrowth,
    avatar,
    onClick,
    active,
    editDraggable,
    className
  } = props

  const widgetJson = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets?.[widgetid])

  const icon = typeof widgetJson.icon === 'string' ? widgetJson.icon : widgetJson.icon.asMutable({ deep: true })

  const result = widgetJson
    ? (
      <AvatarCard
        widgetid={widgetid}
        className={`widget-avatar-card ${className}`}
        showLabel={showLabel}
        showIndicator={showIndicator}
        showTooltip={showTooltip}
        labelGrowth={labelGrowth}
        avatar={avatar}
        label={widgetJson.label}
        icon={icon}
        autoFlip={widgetJson?.manifest?.properties?.flipIcon}
        marker={markerEnabled ? closeOutlined : ''}
        active={active}
        editDraggable={editDraggable}
        onMarkerClick={onMarkerClick}
        onClick={onClick}
      />
      )
    : <Loading />

  return result
}
