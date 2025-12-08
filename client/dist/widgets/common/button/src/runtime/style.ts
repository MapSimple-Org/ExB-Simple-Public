import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables, isNewTheme: boolean): SerializedStyles {
  return css`
    &>a {
      display: flex !important;
      justify-content: center;
      ${!isNewTheme && css`
        &.jimu-link-link {
          text-decoration: underline;
        }
      `}
    }

    .auto-size-icon {
      line-height: 1;
    }
    .widget-button-text{
        width: 100%;
        height: 100%;
    }
  `
}
export function getPoperStyle (): SerializedStyles {
  return css`
      white-space: nowrap;
      z-index: 12;
      background-color: var(--sys-color-info-dark);
      font-size: 12px;
      font-weight: 400;
      border: none;
      box-shadow: none;
      color: var(--sys-color-info-text);
  `
}