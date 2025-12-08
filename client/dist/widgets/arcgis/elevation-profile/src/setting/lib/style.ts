import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    &.widget-setting-elevation-profile {
      height: 100%;

      .map-selector-section .component-map-selector .form-control {
        width: 100%;
      }

      .hidden {
        display: none;
      }

      .jimu-tree {
        width: 100%;
      }

      .data-item {
        display: flex;
        flex: 1;
        padding: 0.5rem 0.6rem;
        line-height: 23px;
        cursor: pointer;

        .data-item-name {
          word-break: break-word;
        }
      }

      .warningMsg {
        padding: 0.25rem!important;
        margin-top: -7px;
      }

      .warningMsg .left-part {
        margin-right: 0 !important;
      }

      .color-label {
        color: ${theme.ref.palette.neutral[900]};
      }

      .ep-tooltip {
        margin-right: 0.30rem!important;
      }

      .ep-section-title {
        color: var(--ref-palette-neutral-1100);
      }

      .mapSettingsHint {
        color: var(--ref-palette-neutral-1000);
        font-size: ${polished.rem(13)};
      }

      .placeholder-container {
        height: calc(100vh - 468px);

        .placeholder {
          flex-direction: column;

          .icon {
            color: var(--ref-palette-neutral-800);
          }

          .hint {
            font-size: ${polished.rem(14)};
            font-weight: 500;
            color: var(--ref-palette-neutral-1000);
            max-width: ${polished.rem(160)};
          }
        }
      }

      .jimu-alert-panel {
        min-width: auto;
      }
    }
  `
}

export function getElevationLayersSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .selectOption {
      width: 114px;
    }

    .color-label {
      color: ${theme.ref.palette.neutral[900]};
    }

    .hidden {
      display: none;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .ep-tooltip {
      margin-right: 0.30rem!important;
    }

    .ep-divider-top {
      border-top: 1px solid var(--ref-palette-neutral-700)
    }

    .ep-layers-list {
      width: 100%;

      .layer-data-item {
        padding: 4px 2px 4px 2px;
      }

      .layer-data-item-name {
        font-size: ${polished.rem(14)};
        font-weight: 400;
        width: 145px;
      }

      .layer-type-name {
        font-size: ${polished.rem(13)};
        padding-top: 8px;
        width: 150px;
      }
    }
  `
}

export function getSelectableLayersSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
   .ep-divider-top {
      border-top: 1px solid var(--ref-palette-neutral-700)
    }
  `
}

export function getAdvanceSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .hidden {
      display: none;
    }

    .color-label {
      color: ${theme.ref.palette.neutral[900]};
    }

    .hint {
      font-style: italic;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .fieldSelectorWidth {
      max-width: 110px;
    }

    .fieldLabel {
      width: 93px;
    }

    .selectOption {
      width: 110px;
    }

    .warningMsg {
      width: auto;
    }

    .ep-label {
      max-width: 80%;
      display: inline-block;
      margin-bottom: 0;
      margin-right: 20px;
    }

    .jimu-widget-setting--row-label:not(.form-inline) {
      max-width: none;
    }

    .ep-layers-list {
      width: 100%;

      .layer-data-item {
        display: flex;
        flex: 1;
        padding: ${polished.rem(7)} 0.25rem;
        cursor: pointer;

        .layer-data-item-name {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          word-break: break-word;
          -webkit-line-clamp: 2;
          padding: 2px;
          line-height: 1.3;
        }
      }
    }

    .ep-data-source-selector {
      .ds-item {
        display: none;
      }
    }

    .tooltip-color {
      color: var(--ref-palette-neutral-1100);
    }

    .ep-divider-top {
      border-top: 1px solid var(--ref-palette-neutral-700)
    }
  `
}

export function getSidePanelStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 259px;
    height: 100%;
    padding-bottom: 1px;
    border-right: 1px solid ${theme.ref.palette.white};
    border-bottom: 1px solid ${theme.ref.palette.white};

    .setting-container {
      height: calc(100% - 52px);
      overflow: auto;
    }
`
}

export function getGeneralSettingsStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .hidden {
      display: none;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .ep-tooltip {
      margin-right: 0.30rem!important;
    }
  `
}

export function getStatisticsListStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .color-label {
      color: ${theme.ref.palette.neutral[900]};
    }

    .ep-statistics-list-items {
      flex: 1;

      .jimu-tree-item [data-dndzone-droppable=true] {
        border: 1px solid transparent;
      }

      .jimu-tree-item.jimu-tree-item_dnd-true {
        height: auto;
        padding-top: 0rem;

        .jimu-tree-item__body {
          padding: 8px 0px 8px 0px;
        }
      }
    }
  `
}
