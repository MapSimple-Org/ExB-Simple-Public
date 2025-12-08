import { type IMThemeVariables, css, type SerializedStyles, AppMode, polished } from 'jimu-core'
import { DirectionType, type ElementSize, type IMConfig, ItemSizeType, PageStyle, TemplateType } from '../config'
import { getCardSizeNumberInConfig, getPaddingOfCardTemplate } from './utils/utils'
import { BOOKMARK_TITLE_HEIGHT, OLD_CARD_TEMPLATE_WIDTH, SCROLL_BAR_WIDTH, WEB_MAP_BOOKMARK_SIZE, WEB_SCENE_BOOKMARK_HEIGHT, WEB_SCENE_BOOKMARK_WIDTH } from '../constants'

export function getStyle (options: {theme: IMThemeVariables, config: IMConfig, id: string, appMode: AppMode, widgetRect: ElementSize, configBookmarkNum: number, runtimeBookmarkNum: number, isWebMap: boolean}): SerializedStyles {
  const { theme, config, id, appMode, widgetRect, configBookmarkNum, runtimeBookmarkNum, isWebMap } = options
  const customType = [TemplateType.Custom1, TemplateType.Custom2]
  const isCustom = customType.includes(config.templateType)
  const cardBackgroundStyle = config.cardBackground
    ? `background-color: ${config.cardBackground} !important;`
    : (isCustom ? `background-color: ${theme.sys.color.surface.paper} !important;` : '')
  const cardSize = getCardSizeNumberInConfig(config.cardItemWidth, config.cardItemHeight, config.keepAspectRatio, config.cardItemSizeRatio, widgetRect)
  const cardPadding = getPaddingOfCardTemplate(cardSize.width, widgetRect.width, configBookmarkNum, runtimeBookmarkNum)
  const isOldCardTemplate = config.cardItemWidth === undefined
  const isHonorMapSize = config.itemSizeType === ItemSizeType.HonorMap

  //Check issue https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/21838 for the calculation logic.
  const getCardWidth = (isHonorMapSize, isWebMap, isOldCardTemplate, cardSize) => {
    if (isHonorMapSize) {
      return isWebMap ? `${WEB_MAP_BOOKMARK_SIZE}px` : `${WEB_SCENE_BOOKMARK_WIDTH}px`
    }
    return isOldCardTemplate ? `${OLD_CARD_TEMPLATE_WIDTH}px` : `${cardSize.width}px`
  }
  const getCardHeight = (isHonorMapSize, isWebMap, displayName, cardSize) => {
    if (isHonorMapSize) {
      if (isWebMap) {
        return displayName ? `${WEB_MAP_BOOKMARK_SIZE + BOOKMARK_TITLE_HEIGHT}px` : `${WEB_MAP_BOOKMARK_SIZE}px`
      } else {
        return displayName ? `${WEB_SCENE_BOOKMARK_HEIGHT + BOOKMARK_TITLE_HEIGHT}px` : `${WEB_SCENE_BOOKMARK_HEIGHT}px`
      }
    }
    return `${cardSize.height}px`
  }

  const getBookmarkTitleStyle = (styleType) => {
    const fontStyles = styleType.fontStyles
    return `${fontStyles?.decoration ? fontStyles?.decoration : ''} ${fontStyles?.underline === 'underline' ? 'underline' : ''} ${fontStyles?.strike === 'line-through' ? 'line-through' : ''};`
  }

  return css`
    ${'&.bookmark-widget-' + id} {
      overflow: ${
        window.jimuConfig.isInBuilder && appMode === AppMode.Design
          ? 'hidden'
          : 'auto'
      };
      position: relative;
      height: 100%;
      width: 100%;
      .bookmark-btn-container {
        width: 32px;
        height: 32px;
      }
      .bookmark-btn {
        font-weight: bold;
        font-size: ${polished.rem(12)};
      }
      .bookmark-view-auto {
        overflow-y: ${
          window.jimuConfig.isInBuilder &&
          appMode === AppMode.Design &&
          !customType.includes(config.templateType)
            ? 'hidden'
            : 'auto'
        };
        align-content: flex-start;
      }
      .card-add {
        cursor: pointer;
        width: ${getCardWidth(isHonorMapSize, isWebMap, isOldCardTemplate, cardSize)};
        height: ${getCardHeight(isHonorMapSize, isWebMap, config.displayName, cardSize)};
        display: inline-flex;
        border: 1px solid ${theme.sys.color.divider.tertiary};
        background: ${theme.sys.color.action.default};
        margin: 5px;
        position: relative;
        .add-placeholder {
          height: ${
              config.displayName
                ? 'calc(100% - 35px)'
                : '100%'
            };
        }
      }
      .list-add {
        cursor: pointer;
        height: 37px;
        display: inline-flex;
        border: 1px solid ${theme.sys.color.divider.tertiary};
        background: ${theme.sys.color.action.default};
        width: calc(100% - 30px);
        margin: 0 15px 15px;
        position: relative;
      }
      .gallery-add-icon {
        position: relative;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin-top: -${polished.rem(10)};
        margin-left: -${polished.rem(10)};
      }
      .bookmark-runtimeSeparator {
        ${config.templateType === TemplateType.Card && 'margin: 5px 0'};
        ${config.templateType === TemplateType.List && 'margin: 10px 0 0'};
        border: 1px dashed ${theme.sys.color.secondary.main};
        width: 100%;
        height: 1px;
        &:last-of-type, &:first-of-type {
          display: none;
        }
      }
      .bookmark-container {
        ${config.templateType !== TemplateType.Card &&
          config.templateType !== TemplateType.List &&
          'height: 100%'};
        width: 100%;
        color: ${theme.sys.color.action.text};
        ${config.templateType === TemplateType.Card && !isOldCardTemplate && `padding: 5px ${cardPadding}px 5px ${cardPadding + SCROLL_BAR_WIDTH}px`};
        .bookmark-card-title, .bookmark-card-title input {
          padding: 0px;
          height: 35px;
          line-height: 35px;
          font-family: ${config.cardNameStyle.fontFamily};
          font-size: ${config.cardNameStyle.fontSize}px;
          font-weight: ${config.cardNameStyle.fontStyles?.weight};
          font-style: ${config.cardNameStyle.fontStyles?.style};
          text-decoration: ${getBookmarkTitleStyle(config.cardNameStyle)};
          color: ${config.cardNameStyle.fontColor};
        }
        .widget-card-image {
          border-radius: inherit;
          > div {
            border-top-left-radius: inherit;
            border-top-right-radius: inherit;
          }
        }
        .bookmark-card-col {
          width: ${getCardWidth(isHonorMapSize, isWebMap, isOldCardTemplate, cardSize)};
          margin: 5px;
          height: ${getCardHeight(isHonorMapSize, isWebMap, config.displayName, cardSize)};
          position: relative;
          .card-inner{
            width: 100%;
            transition: all 0.5s;
            ${cardBackgroundStyle}
            .widget-card-image {
              width: 100%;
              height: ${
                config.displayName
                  ? 'calc(100% - 35px)'
                  : '100%'
              };
              img {
                vertical-align: unset;
              }
            }
          }
        }
        .bookmark-list-col {
          height: 37.5px;
          align-items: center !important;
          margin: 8px 15px 0;
          border: 1px solid var(--sys-color-divider-secondary);
          background-color: ${theme.sys.color.surface.paper};
          ${cardBackgroundStyle}
          .bookmark-list-icon {
            flex: 0 0 20px;
            color: ${config.cardNameStyle.fontColor};
          }
        }
        .bookmark-list-title {
          flex: 1;
        }
        .bookmark-list-title, .bookmark-list-title-runtime input {
          font-family: ${config.cardNameStyle.fontFamily};
          font-size: ${config.cardNameStyle.fontSize}px;
          font-weight: ${config.cardNameStyle.fontStyles?.weight};
          font-style: ${config.cardNameStyle.fontStyles?.style};
          text-decoration: ${getBookmarkTitleStyle(config.cardNameStyle)};;
          color: ${config.cardNameStyle.fontColor};
        }
        .bookmark-custom-contents {
          ${cardBackgroundStyle}
        }
        .jimu-keyboard-nav & .bookmark-custom-contents:focus {
          padding: 2px 2px 0;
        }
        .bookmark-pointer {
          cursor: pointer;
        }
        .active-bookmark-item {
          border: 1px solid var(--sys-color-primary-main) !important;
        }
        .bookmark-custom-pointer {
          cursor: pointer;
          width: 100%;
          ${config.direction === DirectionType.Vertical &&
            'position: absolute;'}
          ${config.direction === DirectionType.Vertical &&
            `height: calc(100% - ${config.space}px) !important;`}
        }
        .layout-height{
          height: ${
            config.pageStyle === PageStyle.Paging
              ? 'calc(100% - 49px)'
              : '100%'
          } !important;
        }
        .border-none {
          border: none !important;
        }
        .runtime-bookmarkCard {
          .runtime-bookmark {
            ${cardBackgroundStyle}
          }
          .runtimeBookmarkCard-operation {
            display: none;
          }
          &:hover, &:focus, &:focus-within {
            .runtimeBookmarkCard-operation {
              display: block;
              position: absolute;
              top: var(--sys-spacing-1);
              right: var(--sys-spacing-1);
            }
          }
        }
        .runtime-bookmarkList {
          width: calc(100% - 30px);
          height: 37.5px;
          line-height: 37.5px;
          margin: 8px 15px 0;
          align-items: center !important;
          ${cardBackgroundStyle}
          .bookmark-list-title-runtime {
            width: 50%;
            display: flex;
            align-items: center;
            .input-wrapper {
              border: none;
              background-color: transparent;
            }
          }
          .bookmark-list-icon {
            color: ${config.cardNameStyle.fontColor};
          }
          .runtimeBookmarkList-operation {
            margin-right: 15px;
            display: none;
          }
          &:hover, &:focus, &:focus-within  {
            .runtimeBookmarkList-operation {
              display: block;
            }
          }
        }
        .runtime-title-con {
          height: 35px;
          line-height: 35px;
        }
        .runtime-title {
          width: auto;
          display: inline-block !important;
          height: 35px;
          .input-wrapper {
            border: none;
            background-color: transparent;
          }
        }
        .suspension-drop-btn{
          border-radius: 12px;
          border: 0;
        }
        .suspension-drop-placeholder{
          width: 32px;
        }
        .suspension-nav-placeholder1{
          height: 32px;
          width: 60px;
        }
        .suspension-nav-placeholder2{
          height: 24px;
          width: 100px;
        }
        .suspension-noborder-btn{
          border: 0;
          padding-left: ${polished.rem(7)};
        }
        .suspension-tools-top {
          position: absolute;
          top: 5px;
          left: 5px;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 2px;
          }
        }
        .suspension-top-number {
          position: absolute;
          top: 5px;
          right: 5px;
          background: ${theme.sys.color.action.default};
          border-radius: 10px;
          opacity: 0.8;
          width: 40px;
          text-align: center;
          z-index: 1;
        }
        .suspension-tools-middle {
          display: flex;
          width: 100%;
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          top: 50%;
          margin-top: ${
            config.direction === DirectionType.Horizon ? '-13px' : '-26px'
          };
          z-index: 1;
          .middle-nav-group button {
            background: ${theme.sys.color.action.default};
            opacity: 0.8;
            border-radius: 50%;
          }
        }
        .suspension-middle-play {
          position: absolute;
          right: 5px;
          bottom: 20px;
          z-index: 2;
        }
        .suspension-tools-text {
          display: flex;
          width: 100%;
          padding: var(--sys-spacing-2);
          position: absolute;
          border-top: 1px solid ${theme.sys.color.secondary.main};
          bottom: 0;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 2px;
          }
          .nav-btn-text {
            width: 100px;
          }
        }
        .suspension-tools-bottom {
          display: flex;
          width: 100%;
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          bottom: 5px;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 3px;
          }
          .scroll-navigator {
            .btn {
              border-radius: 50%;
            }
          }
          .nav-btn-bottom {
            width: ${config.autoPlayAllow ? '100px' : '60px'};
            border-radius: 16px;
            opacity: 0.8;
            background: ${theme.sys.color.action.default};
          }
          .number-count {
            border-radius: 10px;
            opacity: 0.8;
            background: ${theme.sys.color.action.default};
            width: 40px;
            text-align: center;
          }
        }
        .bookmark-slide {
          position: absolute;
          bottom: ${config.templateType === TemplateType.Slide3 ? '0px' : 'unset'};
          opacity: 0.8;
          background: ${theme.sys.color.surface.paper};
          ${cardBackgroundStyle}
          width: 100%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide-title {
            font-family: ${config.slidesNameStyle.fontFamily};
            font-size: ${config.slidesNameStyle.fontSize}px;
            font-weight: ${config.slidesNameStyle.fontStyles?.weight};
            font-style: ${config.slidesNameStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesNameStyle)};
            color: ${config.slidesNameStyle.fontColor};
          }
          .bookmark-slide-description {
            max-height: 80px;
            overflow-y: auto;
            font-family: ${config.slidesDescriptionStyle.fontFamily};
            font-size: ${config.slidesDescriptionStyle.fontSize}px;
            font-weight: ${config.slidesDescriptionStyle.fontStyles?.weight};
            font-style: ${config.slidesDescriptionStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesDescriptionStyle)};
            color: ${config.slidesDescriptionStyle.fontColor};
          }
        }
        .jimu-keyboard-nav & .bookmark-slide-outline:focus {
          .bookmark-slide {
            margin: 2px;
            width: calc(100% - 4px);
          }
        }
        .bookmark-slide-gallery {
          position: absolute;
          bottom: ${
            config.templateType === TemplateType.Slide3 ? 0 : 'unset'
          };
          opacity: 0.8;
          background: ${theme.sys.color.action.default};
          ${cardBackgroundStyle}
          width: 100%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide-title {
            font-family: ${config.slidesNameStyle.fontFamily};
            font-size: ${config.slidesNameStyle.fontSize}px;
            font-weight: ${config.slidesNameStyle.fontStyles?.weight};
            font-style: ${config.slidesNameStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesNameStyle)};
            color: ${config.slidesNameStyle.fontColor};
          }
          .bookmark-slide-description {
            max-height: 60px;
            overflow-y: auto;
            font-family: ${config.slidesDescriptionStyle.fontFamily};
            font-size: ${config.slidesDescriptionStyle.fontSize}px;
            font-weight: ${config.slidesDescriptionStyle.fontStyles?.weight};
            font-style: ${config.slidesDescriptionStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesDescriptionStyle)};
            color: ${config.slidesDescriptionStyle.fontColor};
          }
        }
        .bookmark-slide2 {
          background: ${theme.sys.color.surface.paper};
          ${cardBackgroundStyle}
          width: 100%;
          height: 60%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide2-title {
            font-family: ${config.slidesNameStyle.fontFamily};
            font-size: ${config.slidesNameStyle.fontSize}px;
            font-weight: ${config.slidesNameStyle.fontStyles?.weight};
            font-style: ${config.slidesNameStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesNameStyle)};
            color: ${config.slidesNameStyle.fontColor};
          }
          .bookmark-slide2-description {
            height: calc(100% - 75px);
            overflow-y: auto;
            font-family: ${config.slidesDescriptionStyle.fontFamily};
            font-size: ${config.slidesDescriptionStyle.fontSize}px;
            font-weight: ${config.slidesDescriptionStyle.fontStyles?.weight};
            font-style: ${config.slidesDescriptionStyle.fontStyles?.style};
            text-decoration: ${getBookmarkTitleStyle(config.slidesDescriptionStyle)};
            color: ${config.slidesDescriptionStyle.fontColor};
          }
        }
        .gallery-slide-card {
          ${config.direction === DirectionType.Horizon &&
            `width: ${config.itemWidth}px !important`};
          ${
            config.direction === DirectionType.Horizon
              ? `min-width: ${config.itemWidth}px !important`
              : `height: ${config.itemHeight}px !important`
          };
          height: calc(100% - ${polished.rem(32)});
          position: relative;
          margin: ${
            config.direction === DirectionType.Horizon
              ? 'var(--sys-spacing-4) 0'
              : '0 var(--sys-spacing-4)'
          };
          padding-top: ${
            config.direction === DirectionType.Horizon
              ? 'unset'
              : polished.rem(config.space)
          };
          ${config.direction === DirectionType.Horizon &&
            `margin-left: ${polished.rem(config.space)}`};
          &:first-of-type {
            margin-top: ${
              config.direction === DirectionType.Horizon
                ? 'var(--sys-spacing-4)'
                : '10px'
            };
            padding-top: ${
              config.direction === DirectionType.Horizon
                ? 'unset'
                : polished.rem(10)
            };
          }
          &:last-of-type {
            ${
              config.direction === DirectionType.Horizon
                ? 'padding-right: var(--sys-spacing-4)'
                : `margin-bottom: ${polished.rem(20)}`
            };
          }
          .gallery-slide-inner {
            transition: all 0.5s;
            &:hover {
              transform: scale(1.05);
              .bookmark-slide-gallery {
                width: 100%;
              }
            }
          }
        }
        .gallery-slide-lastItem {
          padding-right: 16px;
          margin-bottom: 16px;
        }
        .nav-bar {
          height: 48px;
          width: 280px;
          min-width: 280px;
          border: 1px solid ${theme.sys.color.secondary.main};
          ${cardBackgroundStyle}
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -24px;
          margin-left: -140px;
          .scroll-navigator {
            .btn {
              border-radius: 50%;
            }
          }
          .nav-btn {
            width: 100px;
          }
        }
        .example-tips {
          margin-top: -10px;
          top: 50%;
          position: relative;
          text-align: center;
        }
      }
      .bookmark-container::-webkit-scrollbar {
        display: none;
      }
      .gallery-container {
        display: inline-flex !important;
        overflow-x: ${
          window.jimuConfig.isInBuilder &&
          appMode === AppMode.Design &&
          !customType.includes(config.templateType)
            ? 'hidden'
            : 'auto'
        };
        scrollbar-width: none;
      }
      .gallery-container-ver {
        overflow-y: ${
          window.jimuConfig.isInBuilder &&
          appMode === AppMode.Design &&
          !customType.includes(config.templateType)
            ? 'hidden'
            : 'auto'
        };
        scrollbar-width: none;
      }
      .horizon-line {
        margin: 10px 15px;
        border-bottom: 1px solid ${theme.sys.color.secondary.main};
      }
      .vertical-line {
        margin: 10px 15px;
        border-right: 1px solid ${theme.sys.color.secondary.main};
      }
      .vertical-border {
        padding-right: var(--sys-spacing-4);
      }
      .default-img {
        width: 100%;
        height: 100%;
        background-color: var(--sys-color-action-disabled);
        .default-img-svg {
          width: 100%;
          height: 100%;
          background-color: var(--sys-color-action-disabled-text);
          mask-image: url(${require('./assets/defaultimg.svg')});
          mask-size: 50% 50%;
          mask-position: center center;
          mask-repeat: no-repeat;
        }
      }
      .edit-mask {
        height: calc(100% - 49px);
        z-index: 2;
      }
    }
  `
}
