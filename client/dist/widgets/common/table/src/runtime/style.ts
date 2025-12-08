import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'
import { getAppThemeVariables, colorUtils } from 'jimu-theme'

export function getStyle (theme: IMThemeVariables, mobileFlag: boolean, searchOn: boolean, showPlaceholder: boolean, partProps): SerializedStyles {
  const { id, isHeightAuto, isWidthAuto, headerFontSetting, widgetWidth, isMultiPage } = partProps
  // TODO: some css is invalid, the invalid css needs to be cleared

  return css`
    ${'&.table-widget-' + id} {
      ${showPlaceholder && ' display: none;'};
      .table-indent{
        width: calc(100% - 32px);
        height: ${isMultiPage ? 'calc(100% - 18px);' : 'calc(100% - 26px);'}
        margin: 10px 16px ${isMultiPage ? '8px;' : '16px;'}
        display: inline-block;
        ${isHeightAuto && 'min-height: 190px;'};
        ${isWidthAuto && 'min-width: 360px;'};
        .horizontal-action-dropdown{
          button{
            width: 32px;
            height: 32px;
          }
        }
        .tool-dividing-line{
          height: 16px;
          width: 1px;
          display: inline-flex;
          background-color: ${theme.sys.color.divider.secondary};
          margin: 8px 4px;
        }
        .data-action-btn{
          position: relative;
        }
      }
      .tab-title{
        user-select: none;
        margin: auto;
      }
      .tab-flex{
        width: 100%;
        overflow-x: auto;
        .closeable{
          height: 31px;
        }
      }
      .top-drop{
        width: 30%;
        min-width: 150px;
        button{
          line-height: 1.5;
        }
      }
      .nav-underline{
        height: 32px;
        border-bottom: 1px solid ${theme.sys.color.divider.secondary};
        .nav-item{
          height: 31px;
          max-width: calc(${widgetWidth / 2}px - ${mobileFlag ? '40px' : '120px'});
        }
      }
      .nav-item + .nav-item{
        margin-left: 0;
      }
      .csv-dropdown-con{
        button{
          border-radius: 13px;
        }
      }
      .vertical-tab-select{
        width: 20%;
        display: inline-block;
        .tagBtn{
          width: 100%;
        }
      }
      .horizontal-tab-select{
        .tagBtn{
          width: 150px;
        }
        .tab-content{
          height: 8px;
        }
      }
      .vertical-tab-select,
      .horizontal-tab-select{
        margin-bottom: 4px;
        .activeBtn{
          color: #fff;
          background-color: #076fe5;
        }
      }
      .dropdown-tab-select{
        height: 40px;
        margin-bottom: 4px;
        .dropdown-button{
          height: 32px;
        }
      }
      .vertical-render-con{
        width: 80%;
        position: absolute;
        left: 20%;
        height: 100%;
        top: 0;
      }
      .dropdown-render-con,
      .horizontal-render-con{
        width: 100%;
        height: calc(100% - 45px);
      }
      .mobile-map-button{
        display: inline-flex;
        button{
          width: 32px;
          height: 32px;
        }
      }
      .table-header{
        height: ${searchOn ? '40px' : '0'};
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .table-con{
        width: 100%;
        height: ${searchOn ? 'calc(100% - 40px);' : '100%'};
        // Attachment
        .esri-feature-table__attachments-view__list {
          --calcite-color-text-2: ${theme.sys.color.divider.secondary};
          calcite-list-item {
            --calcite-list-background-color: ${theme.sys.color.surface.paper};
            --calcite-list-background-color-hover: color-mix(in srgb, ${theme.sys.color.surface.paper} 80%, transparent);
            --calcite-color-text-1: ${theme.sys.color.surface.paperText};
            calcite-action {
              --calcite-action-text-color: ${theme.sys.color.surface.paperText};
              --calcite-action-text-color-press: color-mix(in srgb, ${theme.sys.color.surface.paperText} 80%, transparent);
            }
          }
        }
        // Attachment navigation
        .esri-feature-table__table-navigation {
          --calcite-color-foreground-1: ${theme.sys.color.surface.paper};
          --calcite-action-background-color: ${theme.sys.color.surface.paper};
          --calcite-action-text-color: ${theme.sys.color.surface.paperText};
          --calcite-action-text-color-press: color-mix(in srgb, ${theme.sys.color.surface.paperText} 80%, transparent);
          // related records switch
          --calcite-switch-handle-background-color: ${theme.sys.color.action.inputField.text};
          --calcite-switch-background-color-hover: ${theme.sys.color.action.hover};
          --calcite-switch-background-color: ${theme.sys.color.action.inputField.default};
          calcite-switch[checked] {
            --calcite-switch-handle-background-color: ${theme.sys.color.action.selected.text};
            --calcite-switch-background-color: ${theme.sys.color.action.selected.default};
          }
        }
        // Attachment empty
        .esri-feature-table__attachments-view {
          calcite-button {
            --calcite-button-border-color: transparent;
            --calcite-button-background-color: ${theme.sys.color.action.default};
            --calcite-internal-button-background-color: ${theme.sys.color.action.hover};
            --calcite-button-text-color: ${theme.sys.color.action.text};
            --calcite-color-transparent: ${theme.sys.color.action.default};
            --calcite-color-transparent-hover: ${theme.sys.color.action.hover};
            button:hover {
              --calcite-button-background-color: ${theme.sys.color.action.hover};
            }
          }
        }
        // Attachment selected count
        .esri-feature-table__table-navigation {
          calcite-chip {
            --calcite-internal-chip-background-color: ${theme.sys.color.action.selected.default};
            --calcite-chip-text-color: ${theme.sys.color.action.selected.text};
            --calcite-chip-close-icon-color: ${theme.sys.color.action.selected.text};
            --calcite-color-inverse-hover: ${theme.sys.color.action.hover};
            // --calcite-chip-close-icon-color: ${theme.sys.color.action.text};
          }
        }
        .esri-widget {
          background-color: transparent;
          vaadin-grid-cell-content:has(.esri-column__header-content) {
            ${headerFontSetting?.backgroundColor && `background-color: ${headerFontSetting.backgroundColor};`}
            ${headerFontSetting?.fontSize && `font-size: ${headerFontSetting.fontSize}px;`}
            ${headerFontSetting?.bold && 'font-weight: bold;'}
            ${headerFontSetting?.color && `color: ${headerFontSetting.color};`}
            ${overrideTableHeaderStyle(headerFontSetting, theme)}
            .esri-column__header-content {
              ${headerFontSetting?.bold && 'font-weight: bold;'}
            }
          }
          vaadin-grid {
            --_lumo-grid-border-color: ${theme.sys.color.divider.secondary};
          }
          vaadin-grid::part(header-cell direction) {
            --calcite-color-foreground-1: color-mix(in srgb, ${theme.sys.color.surface.paper} 80%, white);
          }
          vaadin-grid-cell-content {
            --calcite-button-text-color: ${theme.sys.color.surface.paperText};
            &:focus, &:focus-visible {
              outline-color: var(--sys-color-success-main);
            }
            :hover {
              > a {
                color: ${theme.sys.color.action.selected.text};
              }
            }
            > a {
              color: ${theme.sys.color.surface.paperText};
            }
          }
          vaadin-grid-cell-content {
            ${overrideTableCellStyle(theme)}
          }
          vaadin-grid::part(body-cell) {
            --lumo-base-color: color-mix(in srgb, ${theme.sys.color.surface.paper} 80%, white);
            --_lumo-grid-selected-row-color: ${theme.sys.color.action.selected.default};
          }
          vaadin-grid::part(body-cell):hover {
            --calcite-color-foreground-2: color-mix(in srgb, ${theme.sys.color.action.selected.default} 80%, white);
            color: ${theme.sys.color.action.selected.text};
          }
          vaadin-grid::part(selected-row-cell) {
            color: ${theme.sys.color.action.selected.text};
            > a {
              color: ${theme.sys.color.surface.paperText};
            }
          }
          vaadin-grid::part(row) {
            --sys-color-surface-paper: white;
            background-color: white;
          }
          .esri-grid__no-data-message {
            color: ${theme.sys.color.surface.paperText};
          }
          calcite-pagination {
            ${overrideTableAPIStyle(theme)}
          }
        }
        .esri-grid .esri-column__sorter{
          overflow-x: auto;
          overflow-y: hidden;
        }
        .esri-field-column__header-content{
          width: calc(100% - 26px);
          overflow: unset;
        }
        .esri-feature-table__loader-container{
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -16px;
          margin-top: -20px;
          z-index: 2;
        }
        .esri-feature-table__content{
          min-height: 145px;
        }
        .esri-feature-table vaadin-grid::part(body-cell) {
          font-size: var(--calcite-font-size--1);
        }
      }
      .table-bottom-info {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .adv-select-con{
        width: 200px;
        visibility: hidden;
        position: absolute;
        right: 17px;
        top: 56px;
      }
      .ds-container{
        position: absolute;
        display: none;
      }
      .dropdown-button-content{
        .table-action-option-close{
          display: none;
        }
      }
    }
  `
}

export function getSuggestionStyle (suggestionWidth?: number): SerializedStyles {
  return css`
    & {
      max-height: ${polished.rem(300)};
      min-width: ${polished.rem(200)};
      overflow: auto;
    }
    button {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      border-radius: 0;
      color: var(--sys-color-surface-overlay-text);
    }
    button:hover {
      border: none;
    }
  `
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function darkenHexColor (hexColor, depth: number = 80) {
  let useHexColor = hexColor
  if (!useHexColor.startsWith('#')) {
    useHexColor = colorUtils.parseThemeVariable(hexColor, getAppThemeVariables())
  }
  // turn hex to RGB
  let r = parseInt(useHexColor.substring(1, 3), 16)
  let g = parseInt(useHexColor.substring(3, 5), 16)
  let b = parseInt(useHexColor.substring(5, 7), 16)
  // darken color
  r = Math.max(0, Math.min(255, r - depth))
  g = Math.max(0, Math.min(255, g - depth))
  b = Math.max(0, Math.min(255, b - depth))
  // back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function overrideTableHeaderStyle (headerFontSetting, theme: IMThemeVariables) {
  const styles: string[] = []
  if (headerFontSetting) {
    // override background color
    if (headerFontSetting.backgroundColor) {
      styles.push(`--calcite-color-foreground-1: ${headerFontSetting.backgroundColor};`)
      styles.push('--calcite-color-foreground-2: #0000000a;')
      styles.push('--calcite-color-foreground-3: #0000000a;')
    }
    // override title color
    if (headerFontSetting.color) {
      styles.push(`--calcite-color-text-3: ${headerFontSetting.color};`)
      styles.push(`--calcite-color-text-1: ${headerFontSetting.color};`)
    }
    // override font
    if (headerFontSetting.fontSize) styles.push(`--calcite-font-size--2: ${headerFontSetting.fontSize};`)
    if (headerFontSetting.bold) styles.push('--calcite-ui-text-3: bold;')
  }
  styles.push(`--calcite-action-text-color: ${theme.sys.color.surface.paperText};`)
  styles.push(`--calcite-internal-action-text-color: ${theme.sys.color.surface.paperText};`)
  return styles.join(' ')
}

function overrideTableCellStyle (theme: IMThemeVariables) {
  const styles: string[] = []
  styles.push(`--calcite-color-text-1: ${theme.sys.color.surface.paperText};`)
  styles.push(`--lumo-tertiary-text-color: ${theme.sys.color.action.text};`)
  styles.push(`--lumo-primary-color-50pct: ${theme.sys.color.action.text};`)
  // row selected
  // styles.push(`--lumo-primary-color-10pct: ${theme.sys.color.action.selected.default};`)
  return styles.join(' ')
}


function overrideTableAPIStyle (theme: IMThemeVariables) {
  const styles: string[] = []
  styles.push(`--calcite-color-brand: ${theme.sys.color.action.selected.default};`)
  // arrow and page number
  styles.push(`--calcite-color-text-3: ${theme.sys.color.surface.paperHint};`)
  // selected
  styles.push(`--calcite-color-text-1: ${theme.sys.color.surface.paperText};`)
  return styles.join(' ')
}
