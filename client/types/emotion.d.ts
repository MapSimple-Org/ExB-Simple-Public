import { IMThemeVariables } from 'jimu-core'
import '@emotion/react'

declare module '@emotion/react' {
  export interface Theme extends IMThemeVariables {}
}