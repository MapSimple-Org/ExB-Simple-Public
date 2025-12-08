import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .widget-setting-featureInfo{
      font-weight: lighter;
      font-size: 13px;

      .second-header {
        color: ${theme.ref.palette.neutral[1000]};
      }

      .no-data-message {
        margin-top: 25px;
      }

      .webmap-thumbnail{
        cursor: auto;
        width: 100%;
        height: 120px;
        overflow: hidden;
        padding: 1px;
        border: ${polished.rem(2)} solid initial;
        img, div{
          width: 100%;
          height: 100%;
        }
      }

      .featureInfo-options-part{
        background-color: ${theme.ref.palette.neutral[300]};
        padding: 0.5rem;
      }

      .featureInfo-options{
        .featureInfo-options-item{
          display: flex;
          justify-content: space-between;
          /* margin-bottom: 8px; */
        }
      }

      .data-source-list {
        .jimu-tree-item {
          cursor: pointer;
        }
      }
    }
  `
}
