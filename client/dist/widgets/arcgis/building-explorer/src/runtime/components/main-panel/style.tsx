import { type IMThemeVariables, css, type SerializedStyles/*, polished*/ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .status-tips {
      min-width: 200px;
      min-height: 200px;
    }

    .layer-selector {

      .single-mode-selector,
      .jimu-multi-select {
        .jimu-dropdown-button {
          padding-left: 6px;
          justify-content: flex-start;
        }

        .jimu-dropdown-button,
        .jimu-dropdown-button:hover {
          color: var(--sys-color-surface-paper-text);
          background-color: transparent;
          border: none;

          .dropdown-button-content {
            flex: none;
            max-width: 100%;
          }
        }
      }

      .jimu-multi-select .dropdown >.dropdown-button {
        padding-left: 6px;
        padding-right: 6px;
      }
      .jimu-multi-select .dropdown >.dropdown-button:hover {
        border: none;
      }
    }

    .widget-container.esri-building-explorer {
      max-height: calc(100%);
      background: transparent;
    }
    .widget-container {
      overflow-y: hidden;
      background-color: var(--sys-color-surface-paper);

      // For layer title label
      --calcite-label-text-color: var(--sys-color-surface-paper-text);
      .esri-building-disciplines-tree-node__label {
        font-family: ${theme.sys.typography.body.fontFamily};
      }

      .esri-building-level-picker {
        background: transparent;
        .esri-building-level-picker__label-container {
          --calcite-color-foreground-1: var(--sys-color-action);

          // Select level msg
          .esri-building-level-picker-label--empty {
            color: var(--sys-color-surface-paper-text);
          }

          // For the clear button
          --calcite-color-text-1: var(--sys-color-action-text);
          calcite-fab {
            --calcite-color-foreground-2: var(--sys-color-action-hover);
          }

          calcite-action {
            --calcite-icon-color: var(--sys-color-surface-paper-text);
            background-color: transparent;
          }
        }
      }

      .esri-building-phase-picker {
        // For level clear button
        --calcite-icon-color: var(--sys-color-action-text);
        background-color: transparent;
        --calcite-icon-color: var(--sys-color-surface-paper-text);
        // Level up/down button
        calcite-action, calcite-button {
          --calcite-internal-action-text-color: var(--sys-color-surface-paper-text);
        }
      }

      // Level arrow button, bg
      --calcite-action-background-color: transparent;

      // Level header, phase picker
      .esri-widget__heading, .esri-building-phase-picker__phase {
        color: var(--sys-color-surface-paper-text);
        font-family: ${theme.sys.typography.body.fontFamily};
        font-size: ${theme.sys.typography.body.fontSize};
      }

      .esri-building-phase-picker__phase.esri-building-phase-picker__phase--active {
        color: var(--sys-color-action-text);
        background-color: var(--sys-color-action);
      }
      .esri-building-phase-picker__phase.esri-building-phase-picker__phase--active.esri-building-phase-picker__phase--current {
        color: var(--sys-color-action-selected-text);
        background-color: var(--sys-color-action-selected);
      }

      // Floor number
      .esri-building-level-picker-label {
        color: var(--sys-color-action-selected);
        font-size: var(--calcite-font-size-5);
      }

      .esri-building-level-picker-label.esri-building-level-picker-label--active,
      .esri-building-level-picker-label--empty.esri-building-level-picker-label--active {
        color: var(--sys-color-surface-paper-text);
      }

      // For normal buttons
      .esri-building-level-picker-item .esri-building-level-picker-item__base .rect{
        --calcite-color-foreground-1: var(--sys-color-action);
        border-color: var(--sys-color-divider-secondary);
      }

      // For the selected button
      .esri-building-level-picker-item--active .esri-building-level-picker-item__base .rect{
        border-color: var(--sys-color-action-selected);
        background-color: var(--sys-color-action-selected);
      }

      // For hovering on the buttons
      .esri-building-level-picker-item--hover{
        .esri-building-level-picker-item__base{
          .rect{
            --calcite-color-foreground-1: var(--sys-color-action-selected);
            border-color: var(--sys-color-action-selected);
            box-shadow: 0 0 2px 1px 'var(--sys-color-action-selected)';
          }
        }
      }

      // Layer list
      .esri-building-explorer__section.esri-building-explorer__disciplines {
        // Expand button
        --calcite-color-text-3: var(--sys-color-surface-paper-text);
        // Unchecked bg
        --calcite-color-foreground-1: transparent;
        --calcite-checkbox-border-color: var(--sys-color-action-selected);
        // Checked bg
        --calcite-color-brand: var(--sys-color-action-selected);
      }

      .esri-building-phase-picker__phase:focus:focus-visible, .esri-building-level-picker__label-container:focus:focus-visible {
        --calcite-color-brand: var(--sys-color-action-focus);
      }
    }
  `
}
