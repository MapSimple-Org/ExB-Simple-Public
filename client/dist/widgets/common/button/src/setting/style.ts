import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .widget-setting-link {
      overflow-y: auto;
      font-size: 13px;
      font-weight: lighter;
      .collapse-label{
        color: ${theme.ref.palette.neutral[900]};
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
    }
    .tab-label{
      font-weight: 500 !important;
    }

  `
}
