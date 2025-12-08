import { type IMThemeVariables, css, type SerializedStyles, getAppStore, polished } from 'jimu-core'

export function getTimeSpanStyles (theme: IMThemeVariables): SerializedStyles {
  const isRTL = getAppStore().getState().appContext.isRTL
  return css`
    .layer-lines{
      position: relative;

      .range-shadow {
        margin-left: ${isRTL ? 'unset' : '30px'};
        margin-right: ${isRTL ? '30px' : 'unset'};
        position: absolute;
        top: 0;
        z-index: -1;
        background: linear-gradient(0deg, #010101 0%, rgba(1, 1, 1, 0) 100%);
      }
      .layer-line-container {
        margin-bottom: 0.25rem;
        .layer-icon {
          margin-right: ${polished.rem(14)};
        }
        .layer-line, .extent-line {
          height: 2px;
        }
        .layer-line {
          background: ${theme.ref.palette.neutral[900]};
          .jimu-btn {
            margin-left: 1rem;
          }
        }
      }
      .extent-line {
        background: ${theme.ref.palette.neutral[700]};
        .resize-handlers {
          background: ${theme.sys.color.primary.light};
          height: 2px;
          display: flex;
          justify-content: space-between;
          .resize-handler {
            min-width: 10px;
            width: 10px;
            height: 10px;
            border-radius: 10px;
            overflow: visible;
            margin-top: -5px;
            padding: 0;
            border: none;
            background: ${theme.ref.palette.neutral[500]};
            border: 2px solid ${theme.sys.color.primary.light};
          }
        }
      }
    }
  `
}
