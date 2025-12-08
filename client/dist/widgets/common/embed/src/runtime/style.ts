import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables, iframeParams): SerializedStyles {
  const { width: iframeWidth, height: iframeHeight } = iframeParams
  return css`
    &.widget-embed {
      width: 100%;
      height: 100%;
      position: relative;
      ${iframeWidth && 'overflow-x: auto'};
      ${iframeHeight && 'overflow-y: auto'};
      .embed-iframe {
        border: 0;
        border-radius: inherit;
      }
      .load-err-mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: ${theme.ref.palette.white};
        .mask-content{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .truncate-two {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-all;
        }
      }
      .bottom-alert {
        position: absolute;
        bottom: 0;
      }
    }
  `
}
