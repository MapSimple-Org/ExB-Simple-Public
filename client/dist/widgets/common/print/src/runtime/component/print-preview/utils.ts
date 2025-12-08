import { getAppThemeVariables, colorUtils } from 'jimu-theme'
export const MAX_PREVIEW_OPACITY = 0.6
export const DEFAULT_PREVIEW_OPACITY = 0.3

export const convertColorToRgbaArray = (value: string, defaultOpacity: number): string[] => {
  const MAX_PREVIEW_OPACITY = 0.6
  const DEFAULT_PREVIEW_OPACITY = 0.3
  defaultOpacity = defaultOpacity || DEFAULT_PREVIEW_OPACITY
  if (!value) {
    return null
  }
  let rgba
  if (value.includes('var(') || value.includes('#')) {
    const color = colorUtils.parseThemeVariable(value, getAppThemeVariables())
    rgba = colorUtils.rgba(color, defaultOpacity)
  }

  if (value.includes('rgba')) {
    const rgbaArr = value.split('(')[1].split(')')[0].split(',')
    const opacity = rgbaArr[rgbaArr.length - 1]
    if (Number(opacity) > MAX_PREVIEW_OPACITY) {
      rgba = colorUtils.rgba(value, defaultOpacity)
    } else {
      rgba = value
    }
  }
  return getRgbaArrFromRgbaString(rgba)
}
export const getRgbaArrFromRgbaString = (rgba: string): string[] => {
  if (!rgba || !rgba.startsWith('rgba')) return []
  const arr = rgba.split('(')[1].split(')')[0].split(',').map(s => s.trim())
  return arr
}