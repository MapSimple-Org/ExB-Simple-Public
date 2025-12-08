import { Immutable, type IMThemeVariables } from 'jimu-core'
import { getThemeModule, mapping } from 'jimu-theme'
import type { IMCardBackgroundStyle } from '../../config'
export function initBackgroundStyle (cardBackgroundStyle: IMCardBackgroundStyle, theme: IMThemeVariables) {
  const newCardBackgroundStyle = cardBackgroundStyle?.setIn(['boxShadow', 'color'], 'transparent').asMutable({ deep: true })
  const border = newCardBackgroundStyle?.border || {}
  let cardStyle = cardBackgroundStyle
  if ((border as any)?.color || !newCardBackgroundStyle?.border) {
    cardStyle = cardBackgroundStyle
  } else {
    delete newCardBackgroundStyle?.border
    cardStyle = Immutable({
      ...newCardBackgroundStyle,
      ...border
    }) as any
  }
  if (!cardStyle?.textColor) {
    cardStyle = cardStyle.set('textColor', 'var(--sys-color-surface-paper-text)')
  }
  if (!cardStyle?.borderRadius) {
    const defaultBorderRadius = getDefaultBorderRadius(theme)
    cardStyle = cardStyle.set('borderRadius', defaultBorderRadius)
  }
  return cardStyle
}

export function getDefaultBorderRadius(theme: IMThemeVariables) {
  const themeModule = getThemeModule(theme?.uri)
  const isNewTheme = mapping.whetherIsNewTheme(themeModule)
  const shape2 = theme.sys.shape?.shape2
  const shape2Size = isNewTheme ? shape2?.split('px')[0] : 0
  return {number: [shape2Size, shape2Size, shape2Size, shape2Size], unit: 'px'}
}

export function getBorderRadius(cardBackgroundStyle: IMCardBackgroundStyle, theme: IMThemeVariables) {
  const defaultBorderRadius = getDefaultBorderRadius(theme)
  return cardBackgroundStyle?.borderRadius || defaultBorderRadius
}
