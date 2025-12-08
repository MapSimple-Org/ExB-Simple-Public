import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
  .widget-featureReport{
    // min-width: min-content;
    width: 100%;
    height: 100%;
    overflow: auto;
    feature-report{
      height: 100%;
    }
  }
  `
}
