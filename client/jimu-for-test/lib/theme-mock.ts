import type { IMSharedThemeVariables } from 'jimu-core'
import { createMixedTheme } from 'jimu-theme'

const sharedThemeVariables = {
  header: {
    bg: '#6108a1',
    color: '#ffffff'
  },
  body: {
    bg: '#c2c2c2',
    color: '#1a1a1a',
    link: '#002673'
  },
  button: {
    bg: '#004da8',
    color: '#1a1a1a'
  }
} as IMSharedThemeVariables

let defaultTheme = createMixedTheme({ module: { uri: 'themes/test', manifest: null }, sharedThemeVariables })
defaultTheme = defaultTheme.setIn(['mixin', 'sharedTheme'], {
  header: { color: '#ffffff' },
  body: { bg: '#ebebeb', color: '#5c5c5c', link: '#a80000' },
  button: { bg: '#004da8', color: '#ffffff' }
})
export default defaultTheme
