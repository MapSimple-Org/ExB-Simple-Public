import { type React, getAppStore, type WidgetProps, WidgetManager } from 'jimu-core'
import type { ButtonProps } from 'jimu-ui'
import type { AvatarProps, IMAvatarCardConfig } from '../../config'
import { DEFAULT_ICON_SIZE, LABEL_HEIGHT, WIDGET_BUTTON_SIZES } from '../../common/consts'

export const getSize = (size: AvatarProps['size'], buttonSize: number) => {
  if (size === 'custom') {
    if (buttonSize <= WIDGET_BUTTON_SIZES.sm) {
      return 'sm'
    } else if (buttonSize > WIDGET_BUTTON_SIZES.sm && buttonSize <= WIDGET_BUTTON_SIZES.default) {
      return 'default'
    } else if (buttonSize > WIDGET_BUTTON_SIZES.default) {
      return 'lg'
    }
  } else {
    return size || 'default'
  }
}

export const getButtonSize = (size: AvatarProps['size'], buttonSize: number) => {
  if (size === 'custom') {
    // iconSize can be 0
    return buttonSize ?? WIDGET_BUTTON_SIZES.default
  } else {
    return WIDGET_BUTTON_SIZES[size]
  }
}

export const getIconSize = (size: AvatarProps['size'], iconSize: number) => {
  if (size === 'custom') {
    // iconSize can be 0
    return iconSize ?? DEFAULT_ICON_SIZE
  } else {
    return DEFAULT_ICON_SIZE
  }
}

export const calcPadding = (size: ButtonProps['size'], shape: AvatarProps['shape']): number => {
  const circle = shape === 'circle'
  if (size === 'sm') return circle ? 3 : 5
  if (size === 'default') return circle ? 2 : 6
  if (size === 'lg') return circle ? 4 : 10
}

export const getItemLength = (size: ButtonProps['size'], buttonSize: number, showLabel: boolean, shape: AvatarProps['shape']) => {
  let itemSize = buttonSize
  if (showLabel) {
    itemSize = itemSize + LABEL_HEIGHT
  }

  const padding = calcPadding(size, shape)
  itemSize = itemSize + padding * 2
  return itemSize
}

/**
 * Get AvatarCard element length by AvatarCard props and space
 * @param props The props of AvatarCard
 * @param space Spacing between each AvatarCard element
 */
export const getListItemLength = (props: IMAvatarCardConfig, space: number) => {
  const showLabel = props?.showLabel
  const labelGrowth = props?.labelGrowth
  const size = getSize(props?.avatar?.size, props?.avatar?.buttonSize)
  const buttonSize = getButtonSize(props?.avatar?.size, props?.avatar?.buttonSize)
  const shape = props?.avatar?.shape

  const baseLength = getItemLength(size, buttonSize, showLabel, shape)
  return baseLength + space + labelGrowth
}

export const loadWidgetClass = (widgetId: string): Promise<React.ComponentType<WidgetProps>> => {
  if (!widgetId) return
  const isClassLoaded = getAppStore().getState().widgetsRuntimeInfo?.[widgetId]?.isClassLoaded
  if (!isClassLoaded) {
    return WidgetManager.getInstance().loadWidgetClass(widgetId)
  } else {
    return Promise.resolve(WidgetManager.getInstance().getWidgetClass(widgetId))
  }
}
