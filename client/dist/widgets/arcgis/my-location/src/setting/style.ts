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

        .ui-mode-card-wapper {
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
            font-weight: ${theme.ref.typeface.fontWeightBold}!important;
            color: var(--ref-palette-neutral-1000);
            max-width: ${polished.rem(160)};
          }
        }

      }
      /* labels */

      .setting-label{
        font-weight: ${theme.ref.typeface.fontWeightRegular};
        color:${theme.ref.palette.neutral[1100]};
        letter-spacing: 4px;
      }

      /* zoom scale */
      .zoom-scale-input{
        max-width:40%;
        height: 26px!important;
        .jimu-numeric-input-input{
          height: 26px!important;
          line-height: 26px!important;
        }
      }
      .highlight-info-section{
        margin-top: 16px;
        margin-bottom: 16px;
        .bold-font-label{
          font-weight:${theme.ref.typeface.fontWeightMedium}!important ;
          color: ${labelColor} !important;
        }
        .streaming-section{
          display: flex;
          justify-content: space-between;
          align-items: center;
          .streaming-input{
            height: 26px!important;
            margin:0 0.5rem;
            .jimu-numeric-input-input{
              height: 26px!important;
              line-height: 26px!important;
            }
          }
          .streaming-type-select{
            width: 6rem;
          }
          .streaming-unit-select{
            width: 4rem;
          }
        }
      }
      .selected-fields-con{
            margin-top: 0;
            .selected-fields-list {
              flex: 1;
              max-height: 265px;
              overflow-y: auto;
            }
            .jimu-tree-item{
              background: ${theme.ref.palette.neutral[300]};
              border-bottom: 1px solid ${theme.ref.palette.neutral[400]};
              .jimu-tree-item__content{
                div:first-of-type{
                  padding-left: 2px;
                }
                .jimu-tree-item__body{
                  background: ${theme.ref.palette.neutral[300]};
                }
              }
            }
      }
  `
}
