import { type IMThemeVariables, css, type SerializedStyles/*, polished */ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
      font-size: 13px;
      font-weight: lighter;

      .jimu-widget-setting--section {
        padding: 18px 16px;
      }

      .ui-mode-setting {
        display: flex;
      }

      .icon-tip {
        margin: 0;
        color: #c5c5c5;
        font-weight: 400;
      }
  `
}
