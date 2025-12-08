import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
      font-size: 13px;
      font-weight: lighter;

      .jimu-widget-setting--section {
        padding: 18px 16px;
      }

      .placeholder-container{
        height: calc(100% - 180px);

        .placeholder-icon{
          color: var(--ref-palette-neutral-800);
        }
        .placeholder-hint{
          font-size: ${polished.rem(14)};
          font-weight: 500;
          color: var(--ref-palette-neutral-1000);
          max-width: ${polished.rem(160)};
        }
      }
  `
}
