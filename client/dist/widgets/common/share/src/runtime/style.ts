import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  // let theme = this.props.theme;
  return css`
    width: 100%;
    height: 100%;
    overflow: auto;

    .items {
      display: flex;
    }
    `
}

export function getPopupStyle (theme: IMThemeVariables): SerializedStyles {
  // let theme = this.props.theme;
  return css`
    padding: 16px;
    /*margin: 0.5rem;*/
    min-width: 360px;
    max-width: 380px;

    .popup-item-buttons-wrapper {
      margin: 16px -8px 0 -8px;
    }
    `
}
