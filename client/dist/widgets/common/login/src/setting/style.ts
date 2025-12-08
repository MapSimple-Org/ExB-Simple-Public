import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .login-widget-setting {
      overflow-y: auto;
      font-size: 13px;
      font-weight: lighter;
      .second-header {
      }
      .collapse-label{
      }
      .option-item {
        cursor: pointer;
      }
      .font-size-container{
        width: ${polished.rem(82)};
      }
      .advance-style-setting{
        padding: 0 ${polished.rem(4)};
      }
      .px-14{
        padding-left: ${polished.rem(14)} !important;
        padding-right: ${polished.rem(14)} !important;
      }
      .advance-collapse {
        height: 25px;
      }
      .dropdown-menu-label {
        margin-top: 20px;
        label {
        }
      }
    }
    .tab-label{
      font-weight: 500 !important;
    }

  `
}
