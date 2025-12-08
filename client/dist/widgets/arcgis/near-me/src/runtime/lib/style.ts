import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables, listMaxHeight: string, textStyle?, promptTextStyle?, headingLabelStyle?, hideMainRow?): SerializedStyles {
  const bgColor = theme.sys.color.surface.paper

  return css`
  background-color: ${bgColor};
    .widget-near-me {
      width: 100%;
      height: 100%;
      padding: ${hideMainRow ? '0' : '5px'};
      overflow: auto;
    }

    .layerContainer {
      max-height: ${listMaxHeight};
      overflow: auto;
      width: 100%;
      padding: 8px
    }

    .layer-Container {
      margin-bottom: 10px;
    }

    .shadow-none {
      box-shadow: none !important;
    }

    .card {
      width: 96% !important;
      margin: auto;
      margin-bottom: 0.4rem !important;
    }

    .applyTextStyle {
      font-family: ${textStyle.fontFamily};
      font-weight: ${textStyle.fontBold ? 'bold' : ''};
      font-style: ${textStyle.fontItalic ? 'italic' : ''};
      text-decoration: ${textStyle.fontUnderline ? 'underline' : ''};
      text-decoration: ${textStyle.fontStrike ? 'line-through' : ''};
      color: ${textStyle.fontColor};
      font-size: ${textStyle.fontSize};
      white-space: pre-wrap;
    }

    .applyPromptTextStyle {
      font-family: ${promptTextStyle.fontFamily};
      font-weight: ${promptTextStyle.fontBold ? 'bold' : ''};
      font-style: ${promptTextStyle.fontItalic ? 'italic' : ''};
      text-decoration: ${promptTextStyle.fontUnderline ? 'underline' : ''};
      text-decoration: ${promptTextStyle.fontStrike ? 'line-through' : ''};
      color: ${promptTextStyle.fontColor};
      font-size: ${promptTextStyle.fontSize};
      white-space: pre-wrap;
    }

    .headingLabelStyle {
      font-family: ${headingLabelStyle?.fontFamily};
      font-weight: ${headingLabelStyle?.fontBold ? 'bold' : ''};
      font-style: ${headingLabelStyle?.fontItalic ? 'italic' : ''};
      text-decoration: ${headingLabelStyle?.fontUnderline ? 'underline' : ''};
      text-decoration: ${headingLabelStyle?.fontStrike ? 'line-through' : ''};
      color: ${headingLabelStyle?.fontColor};
      font-size: ${headingLabelStyle?.fontSize};
      margin: 0 !important;
      white-space: pre-wrap;
    }

    .map-loading-text {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      text-align: center;
      transform: translate(-50%, 50%);
      font-size: ${theme.sys.typography.body.fontSize};
      color: ${theme.sys.color.surface.paperText};
    }

    .loading-text {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      z-index: 3000;
      text-align: center;
      transform: translate(-50%, 50%);
      font-size: ${theme.sys.typography.body.fontSize};
      color: ${theme.sys.color.surface.paperText};
    }

    .cancel-button-pos {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 40px);
    }

    .main-row {
      display: ${hideMainRow ? 'none' : ''}
    }
  `
}

//get the styles for locate incident component
export function getLocateIncidentStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .main-row {
      flex-wrap: wrap;
      display: flex;
    }

    .headingLabel {
      margin: 0 !important;
      font-weight: 500;
    }

    .icon-verticalLine {
      border-right: 1px solid rgba(110,110,110,.3);
    }

    .column-section {
      display: flex;
      align-items: center;
      margin: 3px 0;
    }

    .hidden {
      display: none;
    }

   .pointer {
    cursor: pointer;
   }
  `
}

//get the styles for aoi tool component
export function getAoiToolStyle (theme: IMThemeVariables, showSketchTools: boolean): SerializedStyles {
  return css`
    .main-row {
      flex-wrap: wrap;
      display: flex;
    }

    .closestAddressheadingLabel {
      margin: 0 !important;
      font-weight: 500;
    }

    .locate-incident {
      min-width: 140px;
      width: ${showSketchTools ? '50%' : '100%'};
    }

    .buffer-distance {
      min-width: 140px;
      width: ${showSketchTools ? '50%' : '100%'};
      align-items: center;
    }

    .hidden {
      display: none;
    }
  `
}

//get the styles for buffer UI
export function getBufferStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
  .headingLabel {
      margin: 0 !important;
      font-weight: 500;
    }

    .hidden {
      display: none;
    }

    .column-section {
      display: flex;
      align-items: center;
      margin: 6px 0;
    }
  `
}

//get the styles for layer accordion component
export function getLayerAccordionStyle (theme: IMThemeVariables, layerLabelWidth: string, canToggle: boolean): SerializedStyles {
  return css`
  .layer-title-Container {
    display: inline-flex;
    -webkit-box-align: baseline;
    align-items: center;
    width: 100%;
    cursor: ${canToggle ? 'pointer' : 'default'};
    justify-content: space-between;
  }

  .icon {
    margin-left: 10px;
    width: 20px;
  }

  .layer-title {
    width:  ${layerLabelWidth};
    padding: 10px 2px 10px 8px;
    font-weight: 500;
    margin-top: 2px;
  }

  .export-button .icon-btn-sizer{
    padding: 0 5px;
  }

  .count {
    width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: auto;
    text-align: center;
    cursor: ${canToggle ? 'pointer' : 'default'};
    font-weight: bold;
    padding-top: 3px;
  }

  .layer-title-label {
    width: 100%;
    margin: 0;
    cursor: ${canToggle ? 'pointer' : 'default'};
    padding-top: 1px;
  }

  .row {
    margin-left: 0px;
    margin-right: 0px;
  }

  .toggle-button {
    visibility: ${canToggle ? 'visible' : 'hidden'};
  }

  .show-more-button {
    display: grid;
  }

  .nm-border-top-color {
    border-top: 1px solid ${theme.sys.color.divider.secondary};
  }
  `
}

//get the styles for feature set component
export function getFeaturesSetStyles (theme: IMThemeVariables): SerializedStyles {
  return css`


  margin: 2px 0px;

  .feature-title-container {
    display: inline-flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    justify-content: space-between;
  }

  .pointer {
    cursor: pointer;
  }

  .record-container {
    border-left: 3px solid transparent;
    margin: 6px 12px 12px 12px !important;
  }

  .record-container .esri-features .esri-features__container {
    padding: 0 !important;
    overflow: hidden !important;
  }

  .record-selected {
    border-left: 3px solid ${theme?.sys.color?.primary.main ?? '#16eaf1'};
  }

  .feature-title {
    padding: 5px 2px 5px 10px;
  }

  .label-title {
    margin: 0;
    padding-top: 3px;
    word-break: break-word;
  }

  .expand-list-label-title {
    padding-left: 10px;
  }

  .approximateDist-container {
    display: inline-flex;
    align-items: center;
    width: 100%;
    padding: 5px 10px 5px 0;
  }

  .approximateDist-label{
    width: calc(100% - 60px);
    font-weight: bold;
    padding: 2px 0 0 10px;
  }

  .approximateDist{
    margin-bottom: 0px;
    width: 100px;
    text-align: end;
    padding-top: 3px;
  }

  .donutWidth {
    right: 26%;
  }

  .feature-title-map-symbol {
    margin-left: 10px;
    width: 20px;
  }

  .feature-widget-title-container {
    display: inline-flex;
    align-items: center;
    width: 100%;
    padding: 5px 0px 4px 0;
  }

  .feature-widget-title {
    width: calc(100% - 44px);
    font-weight: bold;
    font-size: 14px;
    word-break: break-word;
    word-wrap: break-word;
    margin-left: 10px;
  }

  .nm-border-bottom-color {
    border-bottom: 1px solid ${theme.sys.color.divider.secondary};
  }
  `
}

//get the styles for list cards
export function getCardStyle (theme: IMThemeVariables, layerLabelWidth: string): SerializedStyles {
  return css`

  .layer-title-Container {
    display: inline-flex;
    -webkit-box-align: baseline;
    align-items: center;
    cursor: pointer;
    padding: 5px 5px 5px 0;
  }

  .card {
    width: 90% !important;
    margin: auto;
  }

  .icon {
    margin-left: 10px;
    width: 20px;
  }

  .layer-title {
    width: ${layerLabelWidth};
    padding: 5px 2px 5px 10px;
    font-weight: 500;
    margin-top: 2px;
  }

  .count {
    width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: auto;
    text-align: center;
    cursor: pointer;
    font-weight: bold;
    padding-top: 3px;
  }

  .layer-title-label {
    width: 100%;
    margin: 0;
    cursor: pointer;
    padding-top: 1px;
  }

  .row {
    margin-left: 0px;
    margin-right: 0px;
  }

  .layer-title-map-symbol {
    margin-left: 10px;
    width: 25px;
  }

  .nm-border-top-color {
    border-top: 1px solid ${theme.sys.color.divider.secondary};
  }
  `
}

//get the styles for summary field card component
export function getSummaryCardStyle (theme: IMThemeVariables, bgColor: string, textColor: string, fieldLabelWidth): SerializedStyles {
  return css`

  .summaryCard {
    margin: auto;
    width: 96%;
    align-items: center;
    display: flex;
    flex-flow: row wrap;
  }

  .field {
    width: ${fieldLabelWidth};
    font-weight: 500;
  }

  .summary-value {
    font-size: large;
  }

  .summaryBgColor {
    background-color: ${bgColor};
  }

  .textColor {
    color: ${textColor};
  }`
}
