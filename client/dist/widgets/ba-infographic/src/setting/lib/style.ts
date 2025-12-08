import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  const bgColor = theme.ref.palette.neutral[300]
  return css`

    .collapse-header {
      padding-left: unset !important;
      padding-right: unset !important;
    }

    .w-100 {
      width:100%;
    }

    .widget-setting-bao{
      font-weight: lighter;
      font-size: 13px;

      .bao-description{
        height: 100px;
        padding: 10px;
      }

      .bao-options-div{
        background-color: ${bgColor};
        padding: 0.5rem;
      }

    }

    .mode-group {
      button {
        padding: 0;
      }
      button:hover {
        color: ${theme.ref.palette.black};
        background-color: transparent;
      }
      .mode-img {
        cursor: pointer;
        width: 100%;
        height: 70px;
        border: 1px solid ${theme.ref.palette.neutral[500]};
        background-color: ${theme.ref.palette.white};
        margin-right: 0;
        &.active {
          border: 2px solid ${theme.sys.color.primary.light};
        }
        &.mode-img-h {
          width: 108px;
          height: 80px;
        }
      }
      .vertical-space {
        height: 10px;
      }
    }

    font-size: 13px;
      font-weight: lighter;
      color: rgb(168, 168, 168);

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
          width: 49%
        }
        .ui-mode-card-separator {
          width: 2%
        }
        .ui-mode-card {
          flex: 1;
          width: 100%;
          background: ${bgColor};
          border: 2px solid ${bgColor};
          margin: 0 0 0.5rem 0;
        }
        .ui-mode-card.active {
          border: 2px solid #00D8ED;
        }
        .ui-mode-label {
          overflow: hidden;
          text-align: center;
        }
      }

      .icon-tip {
        margin: 0;
        color: #c5c5c5;
        font-weight: 400;
      }

      .bufferWrapper {
        display: flex !important;
        width: 100% !important;
        -webkit-box-pack: justify !important;
        justify-content: space-between !important;
        -webkit-box-align: center !important;
        align-items: center !important;
      }

      .radio-wapper > span.jimu-radio {
        flex-shrink: 0;
      }

      .bufferInput {
        width: 20% !important;
      }
      .bufferUnits {
        width: 40% !important;
      }

      calcite-stepper div.calcite-stepper-content {
        position: relative;
        height: calc(100% + 10px);
        top: -36px;
        overflow:auto;
      }

      // .calcite-theme-dark {
      //   --calcite-ui-brand: red !important;
      //   --calcite-ui-brand-press: rgba(255,255,255,1) !important;
      //   --calcite-ui-foreground-1: rgba(24, 24, 24, 1) !important;
      //   --calcite-ui-text-3: rgba(255,255,255,1) !important;
      //   --calcite-ui-text-2: rgba(168,168,168,1) !important;
      //   --calcite-ui-text-1: rgba(0, 170, 187,1) !important;
      //   --calcite-ui-border-2: rgba(106, 106, 106, 1) !important;
      // }

    .primaryButton {
      width: 100%;
    }

    .jimu-widget-setting--row-label {
      max-width: 90% !important;
    }

    .selectedStateButton {
      width: 100%;
      padding: 5px !important;
      line-height: 1.3 !important;
      background-color: #444 !important;
      color:white;
      border: none !important;
      &, &:hover { background-color: #525252 !important; border: none !important; }
      &, &:focus { border: none !important; }
    }

    .unselectedStateButtonDashed {
      width: 100%;
      border: 1px dashed var(--ref-palette-neutral-800);
      &, &:hover { color: var(--sys-color-primary-light); }
      &:hover { border: 1px dashed var(--ref-palette-neutral-900); }
    }

    .drawnGraphicContainer {
      margin-top: 0.5rem;
    }
  `
}
