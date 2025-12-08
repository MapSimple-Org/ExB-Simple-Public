import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

    overflow: auto;
    .widget-orientedimagery {
      width: 100%;
      height: 100%;


    .oi-widget-selectBtn {
      width: 40px;
      height: 40px;
      padding: 0px;
      color: ${theme.ref.palette.neutral[1000]};  // ${theme.ref.palette.white};
      background: transparent; // ${theme.sys.color.primary.main};
      border-color: transparent; // ${theme.sys.color.primary.main};
      position: absolute;
      left: 0px!important;
      z-index: 3;
      /* display: none; */
    }

    .oi-widget-selectBtnSelected {
      color: ${theme.ref.palette.neutral[1000]}; // ${theme.ref.palette.white};
      background: ${theme.ref.palette.neutral[500]}; // ${theme.sys.color.primary.main};
      border-color: ${theme.ref.palette.neutral[500]}; // ${theme.sys.color.primary.main};
    }

    .oi-widget-selectBtn.oi-btn-css-clear:hover:not(.oi-widget-selectBtnSelected) {
      color: ${theme.ref.palette.neutral[900]}; // ${theme.ref.palette.white};
      background: ${theme.ref.palette.neutral[400]}; // ${theme.sys.color.primary.main};
      border-color: ${theme.ref.palette.neutral[400]};
    }

    .svg-icon {
      fill: currentColor;
      pointer-events: none;
      display: inline-block;
      width: 1.2em;
      height: 1.2em;
      vertical-align: middle;
      padding-right: .15em;
    }

    .oi-label {
        margin: 10px;
        font-size: 13px;
        color: ${theme.ref.palette.white};
    }

    .hide {
      display: none;
    }

    .show {
      display: block;
    }

    /* .oic-click-btn {
        background: ${theme.sys.color.primary.main};
        border-radius: 3px;
        padding: 5px;
    } */
    }
    `
}
