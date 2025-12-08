import { type IMThemeVariables, css } from 'jimu-core'
export const getStyle = (theme: IMThemeVariables, reference, isClassicTheme: boolean) => {
  return css`
    & {
      padding-top: 0;
      padding-bottom: 0;
      box-sizing: border-box;
      /* visibility: unset !important; */
    }
    &.hide-popper {
      border: none;
      outline: none;
      box-shadow: none;
      width: 0;
    }
    button {
      width: 100%;
      border: none;
      text-align: left;
      min-height: 32px;
      border-radius: 0;
      padding: ${theme.sys.spacing(1, 4)};
      background: transparent;
    }
    .result-list-content {
      position: relative;
      overflow: auto;
    }
    &.suggestion-list-con, .result-list-content {
      max-height: 300px;
    }
    &.suggestion-list-con {
      overflow: auto;
    }
    &.result-list-con button {
      text-overflow: ellipsis;
      white-space: pre-wrap;
      color: inherit;
    }
    &.result-list-con :disabled, &.result-list-con button:disabled:hover {
      color: ${theme.sys.color.action.disabled.text};
      background-color: ${theme.sys.color.action.disabled.default};
    }
    &.result-list-con button:hover, &.result-list-con button:focus-visible , &.result-list-con .show-result-button:hover, &.result-list-con .show-result-button:focus-visible{
      color: inherit;
      background: rgba(0, 0, 0, 0.2);
    }
    &.result-list-con .jimu-dropdown-item-divider {
      margin-left: 0;
      margin-right: 0;
    }
    button.active, &.result-list-con button.active {
      background: ${theme.sys.color.action.selected.default};
      color: ${theme.sys.color.action.selected.text};
    }
    .show-result-button:active {
      background-color: ${theme.sys.color.action.default};
    }
    .dropdown-menu--inner {
      max-height: none;
    }
    .jimu-dropdown-item {
      min-height: 32px;
    }
    .clear-recent-search-con {
      color: ${theme.sys.color.primary.main} !important;
      height: 40px;
      margin-top: -4px;
    }
    .jimu-dropdown-item-divider {
      min-height: 0;
    }
    .item-p-l {
      padding-left: 42px !important;
    }
    .source-label-con {
      color: ${!isClassicTheme ? 'var(--sys-color-surface-header-text)' : 'inherit'} !important;
      font-weight: bold !important;
      pointer-events: none;
    }
    .show-result-button-style2 {
      & {
        padding: 0;
        height: 11px;
        min-height: 11px;
        justify-content: center;
        align-items: center;
      }
      svg {
        margin-right: 0;
      }
    }
    &.result-list-con-compact-close {
      & {
        width: 32px;
        border-top: 0;
        justify-content: center;
      }
      .show-result-button {
        & {
          border-radius: 0 0 var(--sys-shape-2) var(--sys-shape-2) !important;
          padding: 0;
          height: 8px;
          min-height: 8px;
          justify-content: center;
          align-items: center;
        }
        svg {
          margin-right: 0;
          height: 8px;
        }
      }
    }
    &.result-list-con-compact-open {
      .show-result-button-style2-con {
        position: -webkit-sticky;
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
        background: ${theme.sys.color.action.default};
      }
    }
  `
}

export const dropdownStyle = () => {
  return css`
    .search-dropdown-button {
      position: absolute;
      top: 0;
      bottom: 0;
      height: auto;
      z-index: -1;
    }
    & {
      position: initial;
    }
  `
}
