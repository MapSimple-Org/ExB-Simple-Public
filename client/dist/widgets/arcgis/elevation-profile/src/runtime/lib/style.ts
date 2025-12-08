import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  const bgColor = theme.sys.color.surface?.paper
  let height = '65px'
  let minHeight = '200px'
  let maxHeight = '250px'
  let maxWidth = '220px'
  if (theme.ref.typeface.htmlFontSize === '125%') {
    height = '95px'
    minHeight = '240px'
    maxHeight = '290px'
    maxWidth = '260px'
  } else if (theme.ref.typeface.htmlFontSize === '87.5%') {
    height = '60px'
    minHeight = '180px'
    maxHeight = '235px'
    maxWidth = '205px'
  } else if (theme.ref.typeface.htmlFontSize === '75%') {
    height = '55px'
    minHeight = '175px'
    maxHeight = '210px'
    maxWidth = '190px'
  }

  return css`
    overflow: auto;
    background-color: ${bgColor};
    .widget-elevation-profile {
      width: 100%;
      height: 100%;
      min-height: 200px;

      .userGuideInfo {
        font-weight: 400;
        overflow-y: auto;
        height: ${height};
      }

      .front-section {
        min-width: ${theme.ref.typeface.htmlFontSize === '75%' ? '180px' : '200px'};
        min-height: ${minHeight};
        max-height: ${maxHeight};
        max-width: ${maxWidth};
      }

      .front-cards {
        border-radius: 7px;
        background-color: var(--sys-color-surface-overlay);
      }

      .hidden {
        display: none;
      }

      .mainSection {
        padding: 20px;
      }

      .adjust-cards {
        gap: 2px 35px;
        width: 100%;
        max-height: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }

      .loading-text {
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
        transform: translate(-50%, 50%);
        font-size: var(--calcite-font-size--2);
        color: var(--calcite-color-text-1);
      }
  `
}

export function getExportOptionsStyle (theme: IMThemeVariables): SerializedStyles {
  let unitsLabelMargin = '3px 8px 2px 12px'
  if (theme.ref.typeface.htmlFontSize === '125%') {
    unitsLabelMargin = '0px 8px 2px 10px'
  } else if (theme.ref.typeface.htmlFontSize === '87.5%') {
    unitsLabelMargin = '4px 8px 2px 13px'
  } else if (theme.ref.typeface.htmlFontSize === '75%') {
    unitsLabelMargin = '5px 8px 2px 14px'
  }
  return css`
    .actionButton {
      margin: 2px 0px 2px 5px;
    }

    .exportHintStyle {
      font-style: italic;
    }

    .exportLabel {
      margin: 0 !important;
      font-weight: 500;
    }

    .showCustomizeEdit {
      display: block;
    }

    .hideCustomizeEdit {
      display: none;
    }

    .style-setting--unit-selector {
      width: 50px;
      margin-left: 0px;
      background: var(--sys-color-divider-secondary);
      color: var(--sys-color-surface-paper-text);
      height: 26px;
    }

    .unitsLabel {
      margin: ${unitsLabelMargin};
      border-radius: 0px;
      color: var(--sys-color-surface-paper-text);
    }

    .invalidRange {
      font-style: italic;
      color: ${theme.sys.color.error.main};
    }

    .invalidValue {
      height: 28px!important;
      border: 1px solid  ${theme.sys.color.error.main};
      box-shadow: 0 0 1px  ${theme.sys.color.error.main};
    }
  `
}

export function getContainerStyle (theme: IMThemeVariables): SerializedStyles {
  let bodyHeight = 'calc(100% - 83px)'
  if (theme.ref.typeface.htmlFontSize === '125%') {
    bodyHeight = 'calc(100% - 92px)'
  } else if (theme.ref.typeface.htmlFontSize === '87.5%') {
    bodyHeight = 'calc(100% - 78px)'
  } else if (theme.ref.typeface.htmlFontSize === '75%') {
    bodyHeight = 'calc(100% - 73px)'
  }
  return css`
    .ep-widget-header {
      .chart-actions {
        float: right;
        width: 32px;
        height: 32px;
        margin: 2px 5px 2px 5px;
      }
    }

    .ep-widget-bodyContainer {
      height: ${bodyHeight};

      .alignInfo {
        padding-right: 40px;
        padding-left: 40px;
      }

      .userInfo .left-part {
        font-weight: 400;
      }

      .cancel-button-pos {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 3000;
        transform: translate(-50%, 25px);
      }

      .loading-scrim {
        background-color: ${theme.sys.color.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
      }
    }

    .floatingInfoMsg {
      .alignDismissibleInfo {
        position: absolute;
        left: 53px;
        width: calc(100% - 109px);
        z-index: 1;
        bottom: 55px;
        margin: 0 auto;
      }

      .alignDismissibleInfo .left-part .text-left {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        font-weight: 400;
      }

      .showMessage {
        display: flex;
      }

      .hideMessage {
        display: none;
      }
    }

    .ep-widget-footer {
      line-height: 1.3;
      background-color: unset;
      border: 1px solid ${theme.sys.color.divider.secondary};
      width: calc(100% - 9px);
      margin-left: 4px;

      .hidden {
        display: none;
      }

      .footer-display {
        display: inline-block;
      }

      .actionButton {
        float: right;
      }
    }
  `
}

export function geSettingsOptionsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
  .settingsLabel {
    margin: 0 !important;
    font-weight: 500;
  }

  .selectLayerWarningMsg {
    padding: 1px !important;
    background-color: transparent !important;
    border: none !important;
    font-size: 11px;
  }

  .selectLayerWarningMsg .left-part {
    color: var(--sys-color-warning-dark) !important;
    margin-right: 0 !important;
  }

  .custom-multiselect .jimu-dropdown .jimu-btn .dropdown-button-content {
    padding-top: 3px;
    padding-bottom: 3px;
  }
  `
}

export function getChartStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .ep-shadow {
      box-shadow: 0 0 8px 3px rgba(0,0,0,0.2)!important;
    }

    .ep-legend {
      height: 100px;
      overflow-y: auto;
    }

    .ep-legend-section {
      border-radius: 2px;
      padding: 5px;
      margin-top: 10px;
      min-width: 120px;
    }

    .cursor-pointer {
      cursor: pointer
    }

    .legendLabel {
      margin-bottom: 0px;
      font-weight: bold;
      word-wrap: break-word;
    }

    .stat-content {
      display: block;
      padding: 12px 15px;
      padding-top: 0;
    }

    .profile-statistics {
      --max-width: 105px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--max-width), 1fr));
      gap: 2px 22px;
      width: 100%;
    }

    .statistic-info {
      display: block;
      text-align: start;
    }

    .statistic-label {
      font-weight: 500;
    }
  `
}
