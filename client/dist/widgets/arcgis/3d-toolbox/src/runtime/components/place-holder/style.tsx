import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    &.hide-msg {
      .message-wrapper {
        display: none;
      }
    }
    &.in-controller {
      .thumbnail-wrapper {
        min-height: 42px;
        min-width: 170px;
      }
    }
  `
}
