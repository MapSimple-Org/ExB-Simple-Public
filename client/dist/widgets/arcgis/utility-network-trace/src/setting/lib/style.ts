import {
  type IMThemeVariables,
  css,
  type SerializedStyles,
  polished
} from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .widget-setting-utility-trace {
      .map-selector-section .component-map-selector .form-control {
        width: 100%;
      }

      .warningMsg {
        padding: 0.25rem !important;
        margin-top: -7px;
      }

      .warningMsg .left-part {
        margin-right: 0 !important;
      }

      .color-label {
        color: ${theme.sys.color.surface.overlayHint};
      }
    }
  `
}

export function getStyleForLI (theme: IMThemeVariables): SerializedStyles {
  return css`
    .layer-item-panel {
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)}
          ${polished.rem(16)};
      }
      .setting-title {
        font-size: ${polished.rem(16)};
        .layer-item-label {
          color: ${theme.sys.color.surface.paperHint};
        }
      }
      .setting-container {
        height: calc(100% - ${polished.rem(50)});
        overflow: auto;

        .title-desc {
          color: ${theme.sys.color.action.inputField.placeholder};
        }
      }
    }
  `
}

export function traceResultAreaStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .cursor-pointer {
      cursor: pointer;
    }

    .shapeTypeWidth {
      width: calc(100% - 16px);
    }
  `
}
