import { css, type SerializedStyles, type IMThemeVariables } from 'jimu-core'
import { DirectionType, ItemSizeType } from '../../../config'
import { BOOKMARK_TITLE_HEIGHT, GALLERY_MARGIN_HORIZON_TOTAL, GALLERY_MARGIN_VERTICAL_TOTAL, OLD_GALLERY_TEMPLATE_WIDTH } from '../../../constants'

export function getGalleryStyle (options: { theme: IMThemeVariables, direction: DirectionType, galleryItemWidth: number, galleryItemHeight: number, galleryItemSpace: number, cardBackground: string, displayName: boolean, isWebMap: boolean, itemSizeType: ItemSizeType, widgetRect }): SerializedStyles {
  const { theme, direction, galleryItemWidth, galleryItemHeight, galleryItemSpace, cardBackground, displayName, isWebMap, itemSizeType, widgetRect } = options
  const directionIsHorizon = direction === DirectionType.Horizon
  const isOldHorizonTemplate = directionIsHorizon && galleryItemWidth === undefined
  const cardBackgroundStyle = cardBackground ? `background-color: ${cardBackground} !important;` : ''
  const isHonorMapSize = itemSizeType === ItemSizeType.HonorMap

  //Check issue https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/21838 for the calculation logic.
  const getWidth = (isHonorMapSize, directionIsHorizon, galleryItemWidth, displayName, isWebMap, widgetHeight) => {
    if (directionIsHorizon) {
      if (isHonorMapSize) {
        let itemHeight: number
        if (isWebMap) {
          itemHeight = widgetHeight - GALLERY_MARGIN_HORIZON_TOTAL
          return (displayName ? (itemHeight - BOOKMARK_TITLE_HEIGHT) : itemHeight) + 'px'
        } else {
          itemHeight = widgetHeight - GALLERY_MARGIN_HORIZON_TOTAL - 2
          return (displayName ? (itemHeight - BOOKMARK_TITLE_HEIGHT) : itemHeight) / 31 * 57 + 2 + 'px'
        }
      } else {
        return `${galleryItemWidth || OLD_GALLERY_TEMPLATE_WIDTH}px !important`
      }
    }
  }

  const getHeight = (directionIsHorizon, isOldHorizonTemplate, isHonorMapSize, isWebMap, displayName, widgetWidth) => {
    if (directionIsHorizon) {
      if (isOldHorizonTemplate) {
        return '187.5px !important'
      } else {
        return 'auto'
      }
    } else {
      if (isHonorMapSize) {
        let itemWidth: number
        if (isWebMap) {
          itemWidth = widgetWidth - GALLERY_MARGIN_VERTICAL_TOTAL
          return (displayName ? (itemWidth + BOOKMARK_TITLE_HEIGHT) : itemWidth) + 'px'
        } else {
          itemWidth = widgetWidth - GALLERY_MARGIN_VERTICAL_TOTAL - 2
          return (displayName ? ((itemWidth / 57 * 31) + BOOKMARK_TITLE_HEIGHT + 2) : (itemWidth / 57 * 31 + 2)) + 'px'
        }
      } else {
        return `${galleryItemHeight}px !important`
      }
    }
  }

  return css`
    &.gallery-card {
      width: ${getWidth(isHonorMapSize, directionIsHorizon, galleryItemWidth, displayName, isWebMap, widgetRect?.height)};
      min-width: ${getWidth(isHonorMapSize, directionIsHorizon, galleryItemWidth, displayName, isWebMap, widgetRect?.height)};
      height: ${getHeight(directionIsHorizon, isOldHorizonTemplate, isHonorMapSize, isWebMap, displayName, widgetRect?.width)};
      position: relative;
      margin: ${directionIsHorizon
        ? 'var(--sys-spacing-3) 0'
        : '0 var(--sys-spacing-4)'
      };
      ${!directionIsHorizon &&
        `margin-top: ${galleryItemSpace}px`};
      ${directionIsHorizon &&
        `margin-left: ${galleryItemSpace}px`};
      &:first-of-type {
        margin-top: ${
          directionIsHorizon
            ? 'var(--sys-spacing-3)'
            : 'var(--sys-spacing-4)'
        };
        margin-left: ${
          directionIsHorizon
            ? 'var(--sys-spacing-3)'
            : 'var(--sys-spacing-4)'
        };
      };
      .gallery-card-inner {
        transition: all 0.5s;
        ${cardBackgroundStyle}
        &:hover {
          transform: scale(1.05);
        }
      }
      .gallery-card-operation {
        display: none;
      }
      &:hover, &:focus, &:focus-within {
        .gallery-card-operation {
          display: block;
          position: absolute;
          top: var(--sys-spacing-1);
          right: var(--sys-spacing-1);
        }
      }
      .gallery-img, .gallery-img-vertical {
        width: 100%;
        height: ${
          displayName
            ? 'calc(100% - 35px)'
            : '100%'
        };
      }
    }
    &.gallery-card-add {
      cursor: pointer;
      width: ${getWidth(isHonorMapSize, directionIsHorizon, galleryItemWidth, displayName, isWebMap, widgetRect?.height)};
      min-width: ${getWidth(isHonorMapSize, directionIsHorizon, galleryItemWidth, displayName, isWebMap, widgetRect?.height)};
      height: ${getHeight(directionIsHorizon, isOldHorizonTemplate, isHonorMapSize, isWebMap, displayName, widgetRect?.width)};
      display: grid;
      border: 1px solid ${theme.sys.color.divider.tertiary};
      background: ${theme.sys.color.action.default};
      margin: ${directionIsHorizon
            ? 'var(--sys-spacing-3) 0'
            : '0 var(--sys-spacing-4)'
        };
      ${!directionIsHorizon &&
        `margin-top: ${galleryItemSpace}px`};
      ${directionIsHorizon &&
        `margin-left: ${galleryItemSpace}px`};
    }
  `
}
