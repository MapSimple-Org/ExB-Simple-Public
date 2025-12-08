import { type IMThemeVariables, css, type SerializedStyles/*, polished */ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  const bgColor = theme.ref.palette.neutral[300]

  const borderWidth = 2
  return css`
    .ui-mode-card-chooser {

      .ui-mode-card-wrapper {
        margin-right: 10px;
        flex: 1;
      }
      .ui-mode-card-wrapper:last-child {
        margin-right: 0px;
      }

      .ui-mode-card {
        background: ${bgColor};
        border: ${borderWidth}px solid transparent;
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
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
      }
    }
  `
}
