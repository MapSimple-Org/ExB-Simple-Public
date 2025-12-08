import { React, css, type IconResult, classNames, polished } from 'jimu-core'
import { Button, type ButtonProps, Icon, Tooltip, hooks as uiHooks } from 'jimu-ui'
import type { AvatarCardConfig, IMControllerButtonStylesByState, IMAvatarProps, AvatarProps } from '../../config'
import { calcPadding, getButtonSize, getIconSize, getItemLength, getSize } from './utils'

export interface AvatarCardProps extends Omit<AvatarCardConfig, 'avatar' | 'variant'> {
  icon?: IconResult | string
  autoFlip?: boolean
  label?: string
  avatar: IMAvatarProps
  variant?: IMControllerButtonStylesByState
  active?: boolean
  disabled?: boolean
  editDraggable?: boolean
  widgetid?: string
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void
  marker?: string
  onMarkerClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

interface UseStyleOptions {
  size: ButtonProps['size']
  buttonSize: number
  showLabel: boolean
  showIndicator: boolean
  shape: AvatarProps['shape']
  labelGrowth: number
}

const useStyle = (options: UseStyleOptions) => {
  const { size, buttonSize, showLabel, showIndicator, shape, labelGrowth } = options
  const isClassicTheme = uiHooks.useClassicTheme()
  return React.useMemo(() => {
    const length = getItemLength(size, buttonSize, showLabel, shape)
    const width = length + labelGrowth
    const padding = calcPadding(size, shape)
    const borderRadius = shape === 'circle' ? '50%' : borderRadiuses[size]
    const circleRemoveDis = {sm: -1, default: 0, lg: 4}
    const removeTopRight = shape === 'circle' ? circleRemoveDis[size] : padding - 6
    return css`
      display: flex;
      align-items:center;
      flex-direction: column;
      justify-content: ${showLabel ? 'space-around' : 'center'};
      width: ${isClassicTheme ? polished.rem(width) : width + 'px'} !important;
      height: ${isClassicTheme ? polished.rem(length) : length + 'px'};
      .tool-drag-handler {
        cursor: auto;
      }
      .avatar {
        padding: ${padding}px;
        position: relative;
        text-align: center;
        &:hover .marker {
          visibility: visible;
        }
        .avatar-button {
          width: ${buttonSize}px;
          height: ${buttonSize}px;
          border-radius: ${borderRadius};
        }
        .avatar-button.disabled {
          color: var(--sys-color-action-disabled-text);
          background-color: var(--sys-color-action-disabled);
          border: 1px solid var(--sys-color-divider-secondary);
        }
        .marker {
          position: absolute;
          right: ${removeTopRight}px;
          top: ${removeTopRight}px;
          padding: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          .icon-btn-sizer {
            min-width: .625rem;
            min-height: .625rem;
          }
          visibility: hidden;
        }
      }
      ${showIndicator
        ? `.avatar.active {
        .avatar-button, .marker {
          transform: translateY(-7px);
        }
        ::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          border: 1px solid var(--ref-palette-white);
          border-radius: 3px;
          width: 6px;
          height: 3px;
          background-color: var(--sys-color-primary-main);
          box-sizing: content-box;
        }
      }`
        : ''}
      .avatar-label {
        text-align: center;
        width: 100%;
        min-height: ${isClassicTheme ? polished.rem(21) : '21px'};
        cursor: default;
      }
    `
  }, [size, buttonSize, showLabel, shape, labelGrowth, isClassicTheme, showIndicator])
}

const borderRadiuses = { none: '0', sm: '0', default: 'var(--sys-shape-1)', lg: 'var(--sys-shape-2)' }

export const AvatarCard = React.forwardRef((props: AvatarCardProps, ref: React.RefObject<HTMLDivElement>) => {
  const {
    label,
    className,
    showLabel,
    showIndicator = true,
    showTooltip = true,
    labelGrowth = 0,
    icon,
    marker,
    onClick,
    onMarkerClick,
    avatar,
    autoFlip,
    active,
    editDraggable,
    disabled,
    widgetid
  } = props

  const type = avatar.type || 'primary'
  const size = getSize(avatar.size, avatar.buttonSize)
  const buttonSize = getButtonSize(avatar.size, avatar.buttonSize)
  const iconSize = getIconSize(avatar.size, avatar.iconSize)
  const shape = avatar.shape || 'circle'
  const cssStyle = useStyle({ size, buttonSize, showLabel, showIndicator, shape, labelGrowth })
  const buttonBorderRadius = borderRadiuses[size]

  const avatarButton = <Button
    data-widgetid={widgetid}
    aria-label={label}
    aria-expanded={active}
    aria-haspopup='dialog'
    icon
    active={active}
    className={classNames('avatar-button', { disabled })}
    type={type}
    size={size}
    style={{ borderRadius: shape === 'circle' ? '50%' : buttonBorderRadius }}
    onClick={onClick}
  >
    <Icon
      color={typeof icon !== 'string' && icon.properties?.color}
      icon={typeof icon !== 'string' ? icon.svg : icon}
      size={iconSize}
      autoFlip={autoFlip}
    />
  </Button>

  return (
    <div
      ref={ref}
      data-widgetid={widgetid}
      className={classNames('avatar-card', { active }, className)}
      css={cssStyle}
    >
      <div
        className={classNames({ 'no-drag-action': !editDraggable, active }, 'avatar tool-drag-handler')}
      >
        {showTooltip ? <Tooltip title={label} style={{ pointerEvents: 'none' }}>{avatarButton}</Tooltip> : avatarButton}
        {
          marker && <Button className='marker' size='sm' icon onClick={onMarkerClick}>
            <Icon size={8} icon={marker} />
          </Button>
        }
      </div>
      {
        showLabel &&
        <div className={classNames('avatar-label text-truncate', { active })}>{label}</div>
      }
    </div>
  )
})
