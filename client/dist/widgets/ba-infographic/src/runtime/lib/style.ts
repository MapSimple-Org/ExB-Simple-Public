import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables, widgetId: string): SerializedStyles {
  return css`
  ${'&.ba-infographic-' + widgetId} {
    .overflow-hidden {
        overflow: hidden
    }

    [calcite-hydrated-hidden] {
        visibility: hidden;
        pointer-events: none
    }

    arcgis-infographic iframe {
      border: 0 !important;
      height: 100% !important;
      left: 0 !important;
      position: absolute !important;
      top: 0 !important;
      width: 100% !important;
    }
    .bufferInput {
      width: 20% !important;
    }
    .bufferUnits {
      width: 20% !important;
    }
    .stepContentContainerStyle {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: left
    }
    .stepContentStyle {
      padding: 2px 12px;
      width: 100%;
      height: 100%;
      display: flex;
      alignItems: self-start;
      justify-content: left
    }

    .selectedSearchResultRow {
      overflow: visible;
      flex: 1 1 auto;
      align-items: stretch;
      max-width: fit-content;
    }
    .selectedSearchResultRowWF {
      position:absolute;
      top:-8px;
      width:calc(100% + 4px);
      overflow: hidden;
      flex: 1 1 auto;
      align-items: stretch;
      max-width: calc(100% + 4px);
      background-color: ${theme.sys.color.surface.overlay};
      color: ${theme.sys.color.surface.overlayText};
      z-index:9;
    }
    .container{
      position:relative;
      padding:0px !important;
      height: inherit;
    }
    .selectedSearchResult {
      width: 100%;
      padding: 7px 10px;
      color: ${theme.sys.color.surface.paperText};

    }
    .selectedSearchResultWF {
      background-color: ${theme.sys.color.surface.overlay};
      width: 100%;
      padding: 7px 10px;
      color: ${theme.sys.color.surface.overlayText};
    }
    .calciteStepperStyle {
      position: absolute;
      top: 6px;
      left: 0;
      padding: 20px;
      height: calc(100% - 8px);
      overflow: hidden;
    }
    .navStyle {
      height: 48px;
      padding-right: 0px;
      text-align: right;
      flex: 0 0 auto;
    }
    .navDivStyle {
      justify-content: flex-end;
      position: relative;
      width: 100%;
      height: 100%;
      margin: 0px !important;
    }
    .navNextButtonStyle {
      display: block;
      padding: 0px 10px;
      margin: 10px 0px 10px 10px;
      border-radius: 2px;
    }
    .navRunInfographicStyle {
      display: block;
      padding: 0px 10px;
      margin: 10px 0px 10px 10px;
      border-radius: 2px;
    }
    .navPrevButtonStyle {
      display: block;
      padding: 0px 10px;
      margin: 10px 0px 10px 10px;
      border-radius: 2px;
    }
    .containerStyle {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .row {
      margin-left:0;
      margin-right:0;
    }
    arcgis-infographic {
      padding-top: 0px !important;
    }
    .contentStyle {
      flex: 1 0 auto;

      height: calc(100% - 32px);
      max-height: calc(100% - 32px);
    }
    .calcite-stepper-content {
      height: calc(100% - 39px) !important;
      overflow:auto;
    }
    .calciteStepperStyle{
      position: absolute;
      top: 6px;
      left: 0px;
      padding: 0 6px;
      height: calc(100% - 6px);
      overflow: hidden;
    }
    .stepContentContainerStyle{
      position: absolute;
      top: 50px;
      left: 0;
      height: calc(100% - 51px);
    }
    .esri-sketch__tool-section {
      border-right: none !important;
    }
    .additional-bts{
      display:none !important;
    }

    /*Hide clear button and border to its left*/
    calcite-action[data-testid="additional-bts-clearAll"],
    calcite-action[id="additional-bts-clearAll"] {
      display: none !important;
    }
    /*Hide border on the action group to the left of clear button*/
    calcite-action-group:first-of-type {
      border-inline-end-width: 0px !important;
    }
    /*Hack for hiding selection tool*/
    .esri-sketch__panel > div:first-of-type {
      display:none !important;
    }
    .toolbar.jimu-draw-layouts-container {
      margin: 10px 20px 0 20px;
    }

    /* Center the sign-in prompt vertically with side padding */
    .esri-directions__sign-in-content {
      box-sizing: border-box;
      min-height: 100%;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

  }

  /* Note: This rule remains global on purpose, because floating panels are rendered in a portal
   and not as descendants of the widget root. If it causes conflicts, consider targeting a more
   specific container or adding an id/class to the modal used by this widget and scoping here. */
  div[role="dialog"].floating-panel {
    z-index: 1001;
  }
  `
}