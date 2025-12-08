import { type IMThemeVariables, css, type SerializedStyles/*, polished*/ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .side-popper-container{
      padding-top: 0;

      .side-popper {
        .numeric-input {
          width: 56px; /* ,#10453 */
        }

        .first-setting-section {
          padding-top: 0;
        }

        .jimu-widget-setting--section {
          padding-left: 0;
          padding-right: 0;
        }
      }

      /* Shadow cast */
      .shadow-cast-radios {
        color: ${theme.ref.palette.neutral[1100]}
      }
    }
  `
}
