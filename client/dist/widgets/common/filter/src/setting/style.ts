import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyleForFI (theme: IMThemeVariables): SerializedStyles {
  return css`
    .filter-item-panel{
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)} ${polished.rem(16)}
      }

      .setting-title {
        font-size: ${polished.rem(16)};
        .filter-item-label{
          color: ${theme.ref.palette.neutral[1000]};
        }
      }

      .setting-container {
        .title-desc{
          color: ${theme.ref.palette.neutral[800]};
        }
      }
    }
  `
}

export function getStyleForWidget (theme: IMThemeVariables): SerializedStyles {
  return css`
    .and-or-group .max-width-50{
      max-width: 50%;
    }
    .filter-item {
      display: flex;
      flex: 1;
      padding: 0.375rem 0.25rem;
      cursor: pointer;

      .filter-item-icon{
        width: 14px;
        margin-right: 0.5rem;
      }
      .filter-item-name{
        /* word-break: break-word; */
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        word-break: break-word;
        -webkit-line-clamp: 2;
        line-height: 1.3;
      }
    }

    .empty-placeholder {
      display: flex;
      flex-flow: column;
      justify-content: center;
      height: calc(100vh - 500px);
      overflow: hidden;
      .empty-placeholder-inner {
        padding: 0px 16px;
        flex-direction: column;
        align-items: center;
        display: flex;

        .empty-placeholder-text {
          color: ${theme.ref.palette.neutral[1000]};
          font-size: ${polished.rem(14)};
          margin-top: 16px;
          text-align: center;
        }
        .empty-placeholder-icon {
          color: ${theme.ref.palette.neutral[800]};
        }
      }
    }

    .arrange-style-container{

      .arrange_container, .trigger_container{
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        .jimu-btn {
          padding: 0;
          background: ${theme.ref.palette.neutral[300]};
          &.active{
            border: 2px solid ${theme.sys.color.primary.light};
          }
        }
      }
      .trigger_container{
        justify-content: flex-start;
        .jimu-btn:last-of-type{
          margin-left: 0.5rem;
        }
      }

      .omit-label{
        color: ${theme.ref.palette.neutral[900]};
      }
    }

    .options-container {
      .use-wrap{
        .jimu-widget-setting--row-label{
          margin-right: 5px;
        }
      }
    }
  `
}
