import {
  css,
  polished,
  type SerializedStyles,
  AppMode,
  utils,
  type IMThemeVariables
} from 'jimu-core'
import {
  DirectionType,
  LIST_CARD_PADDING,
  PageStyle,
  DS_TOOL_BOTTOM_PADDING,
  DS_TOOL_H,
  BOTTOM_TOOL_TOP_PADDING,
  BOTTOM_TOOL_H,
  type ElementSize,
  ListLayoutType,
  type ListProps
} from '../../config'

interface LisStyleOption {
  pageStyle: PageStyle
  scrollBarOpen: boolean
  direction: DirectionType
  appMode: AppMode
  theme: IMThemeVariables
  isHeightAuto: boolean
  isWidthAuto: boolean
  listTemplateDefaultCardSize: ElementSize
  showTopTools: boolean
  bottomToolH: number
  mexSize: MaxSize
  layoutType: ListLayoutType
  listLeftPadding: number
}

interface MaxSize {
  maxWidth: number
  maxHeight: number | string
  maxSizeIsBodySize?: boolean
}

export const listStyle = utils.memoize(function (
  options: LisStyleOption
): SerializedStyles {
  const {
    showTopTools,
    bottomToolH,
    pageStyle,
    scrollBarOpen,
    appMode,
    theme,
    isHeightAuto,
    isWidthAuto,
    listTemplateDefaultCardSize,
    layoutType,
    listLeftPadding
  } = options
  const topToolsH = showTopTools ? DS_TOOL_H : 0
  const direction = layoutType === ListLayoutType.Column ? DirectionType.Horizon : DirectionType.Vertical
  const isHorizon = layoutType === ListLayoutType.Column
  const flexDirection = layoutType === ListLayoutType.Column ? 'column' : 'row'
  return css`
    &.list-container {
      /* position: ${isHeightAuto ? 'absolute' : 'relative'}; */
      position: relative;
      z-index: 0;
      overflow: hidden;
      .bottom-boundary {
        height: 2px;
        width: 2px;
        position: absolute;
        bottom: 0;
        right: 0;
        opacity: 0;
      }
      ${
        direction === DirectionType.Horizon
          ? `
          margin-left: ${LIST_CARD_PADDING + 'px'};
          height: ${isHeightAuto ? 'auto' : 'calc(100% - 1px)'};
          width: ${
            isWidthAuto ? 'auto' : `calc(100% - ${LIST_CARD_PADDING + 'px'})`
          };
        `
          : `
          margin-top: ${LIST_CARD_PADDING + 'px'};
          width: ${isWidthAuto ? 'auto' : 'calc(100% - 1px)'};
          height: ${
            isHeightAuto ? 'auto' : `calc(100% - ${LIST_CARD_PADDING + 'px'})`
          };
        `
      }
      .empty-con {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        z-index: 10;
        transform: translateY(-50%);
        padding-top: ${topToolsH}px;
        .jimu-icon {
          color: ${theme.sys.color.warning.dark};
        }
        .discribtion {
          margin: ${polished.rem(9)} 0 ${polished.rem(8)} 0;
          font-size: ${polished.rem(14)};
          color: ${theme.sys.color.surface.paperText}
        }
        .clear-message-action-button {
          width: ${polished.rem(65)};
        }
      }

      .bottom-tools {
        position: relative;
        padding-top: ${polished.rem(BOTTOM_TOOL_TOP_PADDING)};
        min-height: ${polished.rem(BOTTOM_TOOL_H)};
        .scroll-navigator {
          .btn {
            border-radius: 50%;
          }
        }
      }
      .widget-list-link-con {
        height: ${
          isHeightAuto
            ? 'auto'
            : `calc(100% - ${topToolsH}px - ${bottomToolH}px)`
        } !important;
        width: ${isWidthAuto ? 'auto' : '100%'} !important;
        ${getListMaxStyle(pageStyle, isHorizon, options.mexSize, topToolsH, bottomToolH)}
      }
      .widget-list-list:focus {
        outline: none;
      }
      .widget-list-list {
        & {
          padding: 0;
          position: relative;
          padding-left: ${`${listLeftPadding}px`};
          display: flex;
          width: ${isWidthAuto ? 'auto' : '100%'} !important;
          height: ${isHeightAuto ? 'auto' : '100%'} !important;
        }
        &>div {
          position: relative;
          flex: 1;
          box-sizing: content-box;
        }
        /* box-sizing: border-box; */
        ${
          !window.jimuConfig.isInBuilder || appMode !== AppMode.Design
            ? `overflow-${isHorizon ? 'y' : 'x'}: hidden !important;`
            : 'overflow: hidden !important;'
        }

        ${`flex-direction: ${flexDirection}`};
        ${isHeightAuto && `min-height: ${listTemplateDefaultCardSize.height}px;`};
        ${isWidthAuto && `min-width: ${listTemplateDefaultCardSize.width}px;`};
        ${isHeightAuto && getListMaxStyle(pageStyle, isHorizon, options.mexSize, topToolsH, bottomToolH)}
      }
      .hide-list {
        overflow: hidden !important;
      }
      .hide-will-change {
        will-change: auto !important;
      }
      ${
        pageStyle === PageStyle.Scroll && !scrollBarOpen
          ? `
          .widget-list-list::-webkit-scrollbar {
            display: none; //Safari and Chrome
          }
          .widget-list-list {
              -ms-overflow-style: none; //IE 10+
              overflow: -moz-scrollbars-none; //Firefox
              scrollbar-width: none; /* Firefox */
          }
        `
          : ''
      }
      .placeholder-alert-con {
        position: absolute;
        bottom: ${polished.rem(8)};
        right: ${polished.rem(8)};
        z-index: 11;
      }
    }
  `
})

function getListMaxStyle (pageStyle: PageStyle, isHorizon: boolean, maxSize: MaxSize, topToolsH: number, bottomToolH: number) {
  if (pageStyle === PageStyle.MultiPage) {
    return null
  } else {
    return isHorizon ? `max-width: ${maxSize.maxWidth};` : `max-height: calc(${maxSize.maxHeight} - ${topToolsH}px - ${bottomToolH}px);`
  }
}

export function getStyle (
  props: ListProps,
  isEditing: boolean,
  showBottomTool: boolean
): SerializedStyles {
  const { config, id, appMode, isHeightAuto, isWidthAuto, theme } = props
  return css`
    ${'&.list-widget-' + id} {
      overflow: visible;
      background-color: transparent;
      height: ${isHeightAuto ? 'auto' : '100%'};
      width: ${isWidthAuto ? 'auto' : '100%'};
      .list-auto-refresh-button {
        color: inherit;
        padding: 0;
        svg {
          margin: 0;
        }
      }
      .list-with-mask {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0);
        z-index: 1;
      }
      .list-toggle-button {
        background: none;
      }
      .list-loading-con {
        min-height: ${polished.rem(120)};
        min-width: ${polished.rem(160)};
      }
      .list-error-con {
        .alert-panel-of-list {
          border-radius: 0;
          text-align: left;
          left: ${polished.rem(4)};
          right: ${polished.rem(4)};
          bottom: ${polished.rem(4)};
          width: auto;
        }
      }
      .refresh-loading-con {
        right: 0;
        bottom:${showBottomTool ? polished.rem(BOTTOM_TOOL_H) : 0};
        align-items: center;
        height: ${polished.rem(18)};
        .auto-refresh-loading {
          background: ${theme.sys.color.surface.overlay};
          color: ${theme.sys.color.surface.overlayText};
          font-size: ${polished.rem(12)};
          line-height: ${polished.rem(18)};
          padding: 0 var(--sys-spacing-1);
          .auto-refresh-string-con {
            padding: 0 ${polished.rem(2)};
          }
        }
        .auto-refresh-loading-with-icon {
          padding: 2px;
        }
        &.horizon-loading {
          bottom:${
            showBottomTool ? polished.rem(BOTTOM_TOOL_H + 6) : polished.rem(6)
          };
        }
        &.vertical-loading {
          right: ${polished.rem(6)};
        }
      }
      .loading-con {
        @keyframes loading {
          0% {transform: rotate(0deg); };
          100% {transform: rotate(360deg)};
        }
        width: ${polished.rem(16)};
        height: ${polished.rem(16)};
        border: 1px solid var(--sys-color-divider-secondary);
        border-radius: 50%;
        border-top: 1px solid var(--sys-color-divider-secondary);
        box-sizing: border-box;
        animation:loading 2s infinite linear;
        margin-right: ${polished.rem(4)};
      }
      .widget-list {
        overflow: ${
          window.jimuConfig.isInBuilder && appMode === AppMode.Design
            ? 'hidden'
            : 'auto'
        };
        height: ${isHeightAuto ? 'auto' : '100%'};
        width: ${isWidthAuto ? 'auto' : '100%'};
        /* align-items: ${config.alignType};
        justify-content: ${config.alignType}; */
        ${
          config.direction === DirectionType.Horizon
            ? `
            overflow-y: hidden;
          `
            : `
            overflow-x: hidden;
          `
        }
      }
      .data-count {
        left: 0;
        bottom: 0;
        background: ${theme.sys.color.surface.overlay};
        color: ${theme.sys.color.surface.overlayText};
        font-size: ${polished.rem(12)};
        line-height: ${polished.rem(18)};
        padding: 0 ${polished.rem(5)};
      }
    }

  `
}

export function getToolsPopperStyle (theme): SerializedStyles {
  return css`
    & {
      padding: ${polished.rem(6)} ${polished.rem(11)};
      height: ${polished.rem(40)};
    }
    .list-toggle-button {
      background: none;
    }
    .list-sort-con, .list-search-icon {
      margin-right: ${polished.rem(4)};
    }
    .ds-tools-line {
      width: 100%;
      height: 1px;
      background-color: var(--sys-color-divider-secondary);
    }
    .ds-tools-line-blue {
      background-color: ${theme.sys.color.primary.main};
    }
    .close-search {
      margin-top: ${polished.rem(-6)};
    }
    .list-search-div {
      svg {
        color: var(--sys-color-action-text) !important;
      }
    }
    div.list-sort-con {
      margin-left: 0;
    }
    .color-inherit {
      color: inherit !important;
    }
    .color-inherit.jimu-disabled {
      color: ${theme.sys.color.action.disabled.text} !important;
    }
  `
}

export function getSearchToolStyle (theme): SerializedStyles {
  return css`
    .search-box-content {
      flex-direction: column;
      align-items: flex-start;
    }
    .color-inherit {
      color: inherit !important;
    }
    .color-inherit.jimu-disabled {
      color: ${theme.sys.color.action.disabled.text} !important;
    }
  `
}

export function getTopToolStyle (showTopTools: boolean, theme, topRightToolW: number, showDataAction= false): SerializedStyles {
  return css`
    .list-data-action {
      & {
        padding-left: ${polished.rem(4)};
      }
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: ${polished.rem(16)};
        border-left: 1px solid ${showTopTools ? 'var(--sys-color-divider-secondary)' : 'transparent'}
      }
    }
    .top-right-tools-size-0 .list-sort-con{
      max-width: 90px;
    }
    .m-left {
      margin-left: ${polished.rem(4)};
    }
    &.datasource-tools {
      position: relative;
      height: ${polished.rem(DS_TOOL_H)};
      padding: ${polished.rem(4)} ${polished.rem(4)} ${polished.rem(DS_TOOL_BOTTOM_PADDING)} ${polished.rem(4)};
      .list-sort-con {
        margin-right: ${polished.rem(4)};
      }
      .sort-fields-input {
        width: 200px;
        margin-left: 8px;
        margin-right: 16px;
      }

      .tool-row {
        height: ${DS_TOOL_H - DS_TOOL_BOTTOM_PADDING}px;
      }
      .tools-con-max-size {
        width: ${showDataAction ? 'calc(100% - 40px)' : '100%'};
      }
      .ds-tools-line {
        width: 100%;
        height: 1px;
        margin-top: ${polished.rem(3)};
        background-color: ${theme.sys.color.divider.secondary};
      }
      .ds-tools-line-blue {
        background-color: ${theme.sys.color.info.main};
      }
      .list-search-div {
        width: calc(100% - ${topRightToolW}px);
        .list-search {
          margin-bottom: -4px;
          width: 100%;
        }
      }
      .top-right-tools-size-3 {
        max-width: 73%;
      }
      .top-right-tools-size-2 {
        max-width: 65%;
      }
      .top-right-tools-size-1 {
        max-width: 55%;
      }
      .top-right-tools-size-0 {
        max-width: 85%;
      }
    }
    .tools-menu {
      color: var(--sys-color-action-text);
      margin-top: 1px;
    }
    .tools-menu:hover {
      color: ${theme.sys.color.action.text};
    }
    .color-inherit {
      color: inherit !important;
    }
    .color-inherit.jimu-disabled {
      color: ${theme.sys.color.action.disabled.text} !important;
    }
  `
}
