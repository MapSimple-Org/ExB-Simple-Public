import { type IMThemeVariables, css, type SerializedStyles/*, polished */ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables, polished): SerializedStyles {
  const bgColor = theme.ref.palette.neutral[300]
  const labelColor = theme.ref.palette.neutral[1000]

  const borderWidth = 2
  const separatorWidth = 10
  return css`
      font-size: 13px;
      font-weight: lighter;

      .jimu-widget-setting--section {
        padding: 18px 16px;
      }

      .ui-mode-setting {
        display: flex;
      }

      /* ui-mode */
      .ui-mode-card-chooser{
        display: flex;
        align-items: start;

        .ui-mode-card-wrapper {
          width: calc((100% - ${separatorWidth}px - ${borderWidth * 4}px) / 2);
        }

        .ui-mode-card-separator {
          width: ${separatorWidth}px
        }
        .ui-mode-card {
          flex: 1;
          width: 100%;
          background: ${bgColor};
          border: ${borderWidth}px solid ${bgColor};
          margin: 0 0 0.5rem 0;

          .jimu-icon {
            margin: 0
          }
        }
        .ui-mode-card.active {
          border: ${borderWidth}px solid #00D8ED;
          background-color: ${bgColor} !important;
        }
        .ui-mode-label {
          overflow: hidden;
          text-align: center;
        }
      }

      .placeholder-container{
        height: calc(100% - 180px);

        .placeholder{
          flex-direction: column;

          .icon{
            color: var(--ref-palette-neutral-800);
          }
          .hint{
            font-size: ${polished.rem(14)};
            font-weight: 500;
            color: var(--ref-palette-neutral-1000);
            max-width: ${polished.rem(160)};
          }
        }

      }

      /* UI for #13051 */
      .bold-font-label {
        .jimu-widget-setting--row-label,
        .setting-row-text-level-1 {
          font-weight: 600 !important;
          color: ${labelColor} !important;
        }
      }

  `
}
