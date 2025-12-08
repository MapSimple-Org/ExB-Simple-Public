import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

    .widget-setting-coordinate-conversion {

      .cursor-pointer {
        cursor: pointer;
      }

      .map-selector-section .component-map-selector .form-control {
        width: 100%;
      }

      .selectOption {
        width: 227px;
      }
    }
  `
}

export function getTableStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

    .tableHeading {
      width: 100%;
      padding: 5px 0px 5px 0px;
      background-color: ${theme.ref.palette.neutral[500]};
    }

    .coordinateHeaderLabel {
      font-size: 14px;
      padding-left: 10px;
      font-weight: bold;
      flex: 0 0 35%;
    }

    .coordinateHeaderFormat {
      font-size: 14px;
      font-weight: bold;
      flex: 0 0 35%;
    }

    .coordinatesNotation {
      flex: 0 0 33%;
      max-width: 66px;
    }

    .coordinateFormat {
      flex: 0 0 55%;
      max-width: 110px;
    }

    .hidden {
      display: none;
    }

    .rowDimensions {
      width: calc(100% - 17px);
    }

    .alignBox {
      left: 10px;
    }

    .coordinate-converion-list-items {

      .jimu-tree-item [data-dndzone-droppable=true] {
        border: 1px solid transparent;
      }

      .jimu-tree-item.jimu-tree-item_dnd-true {
        height: auto;
        padding-top: 0rem;

        .jimu-tree-item__body {
          background-color: ${theme.ref.palette.neutral[300]};
          padding: 8px 0px 8px 0px;
        }

        .jimu-tree-item__body: hover {
          background-color: ${theme.ref.palette.neutral[200]};
        }
      }
    }
  `
}

export function getStyleForEditHeader (theme: IMThemeVariables): SerializedStyles {
  return css`
    .layer-item-panel {
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)} ${polished.rem(16)}
      }
      .setting-title {
        font-size: ${polished.rem(16)};
        .layer-item-label {
          color: ${theme.ref.palette.neutral[1000]};
        }
      }
      .setting-container {
        height: calc(100% - ${polished.rem(50)});
        overflow: auto;

        .title-desc {
          color: ${theme.ref.palette.neutral[800]};
        }
      }
    }
  `
}

export function getInputSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
  .formatLabel {
    width: 194px;
  }

  .hidden {
    display: none;
  }
  `
}

export function getOutputSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
  .add-conversion {
    height: ${polished.rem(40)};
    width: 100%;
    color: ${theme.sys.color.primary.light};
    font-size: ${polished.rem(14)};
    cursor: pointer;
    &:hover {
      .add-conversion-icon-container {
        background-color: ${polished.rgba(theme.sys.color.primary.light, 0.8)};
      }
      color: ${polished.rgba(theme.sys.color.primary.light, 0.8)};
    }
    .add-conversion-icon-container {
      width: 20px;
      height: 20px;
      background-color: ${theme.sys.color.primary.light};
      border-radius: 10px;
    }
    .add-conversion-icon {
      color: ${theme.ref.palette.neutral[400]};
    }
  }
  `
}

export function getAddressSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

  .locator-url {
    background-color: ${theme.ref.palette.neutral[800]};
    padding: 2px;
    margin-top: 0px !important;
  }

  .locator-url label {
    word-break: break-all;
  }

  .addrSettingNumericInput {
    width: 105px;
  }

  .defGeocode-tooltip {
    margin-right: 0.30rem!important;
  }

  .jimu-tree {
    margin-bottom: 0px !important
  }
  `
}

export function getGeneralSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

  .hint label {
    font-style: italic;
  }

  .zoomScaleInput {
    width: 105px;
  }

  .symbolItem {
    cursor: pointer;
  }
  `
}
