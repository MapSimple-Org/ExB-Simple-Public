import { getStrokeStyle, getPointStyle, getDividerLineStyle } from '../../common/template-style'
import { Direction, PointStyle, type Config } from '../../config'
import type { IMThemeVariables } from 'jimu-core'
import { getAllDefaultStrokeColors } from '../../utils/util'
import { getThemeModule, mapping } from 'jimu-theme'

export const getNewDividerLineStyle = (config: Config, theme: IMThemeVariables) => {
  const { direction } = config
  const { size, type } = config.strokeStyle
  const color = getStrokeColor(config, theme)
  return getStrokeStyle(size, color, direction)[type]
}

export function getStrokeColor (config: Config, theme: IMThemeVariables): string {
  const themeModule = getThemeModule(theme?.uri)
  const isNewTheme = mapping.whetherIsNewTheme(themeModule)
  const { strokeStyle } = config
  const allDefaultStrokeColors = getAllDefaultStrokeColors(theme.sys.color.mode)
  const defaultColor = isNewTheme ? allDefaultStrokeColors.Default : ''
  const defaultStrokeColors = config?.template ? allDefaultStrokeColors[config.template] : defaultColor
  return strokeStyle?.color || defaultStrokeColors
}

export const getDividerLinePositionStyle = (config: Config) => {
  const { direction, pointEnd, pointStart, strokeStyle } = config
  const isHorizontal = direction === Direction.Horizontal
  const pointStartStyle = pointStart.pointStyle
  const pointStartSize =
    pointStart.pointSize * getSize(strokeStyle?.size)
  const pointEndStyle = pointEnd.pointStyle
  const pointEndSize = pointEnd.pointSize * getSize(strokeStyle?.size)
  const isPointStartEnable = pointStartStyle !== PointStyle.None
  const isPointEndEnable = pointEndStyle !== PointStyle.None
  return getDividerLineStyle(
    isHorizontal,
    isPointStartEnable,
    isPointEndEnable,
    pointStartSize,
    pointEndSize
  )
}

export const getNewPointStyle = (config, theme: IMThemeVariables, isPointStart = true) => {
  const { pointEnd, pointStart, strokeStyle, direction } = config
  const strokeSize = Number(getSize(strokeStyle.size))
  const size = `${
    isPointStart
      ? pointStart.pointSize * strokeSize
      : pointEnd.pointSize * strokeSize
  }px`
  const color = getStrokeColor(config, theme)
  const style = isPointStart ? pointStart.pointStyle : pointEnd.pointStyle
  const pointStyle = getPointStyle(size, color, direction, isPointStart)
  return pointStyle[style]
}

export const getSize = (size: string): number => {
  const sizeNumber = size.split('px')[0]
  return Number(sizeNumber)
}
