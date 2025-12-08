import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'
import { styleUtils } from 'jimu-ui'
import type { Style } from '../../config'

export function getStyle (theme: IMThemeVariables, style: Style): SerializedStyles {
  const fillStyleCss = styleUtils.toCSSStyle({ background: style.background }) as any
  delete fillStyleCss.backgroundColor
  const fontColor = style.fontColor || theme.sys.color.surface.paperText
  const root = style.background?.color || 'transparent'
  const cardRoot = theme.sys.color.surface.paper

  return css`
    ${style.background?.color ? 'background: transparent;' : '' }
    overflow: auto;
    .widget-legend {
      width: 100%;
      height: 100%;
      min-height: 32px;
      background-color: ${root};
      position: relative;
      ${fillStyleCss}
      --calcite-color-text-2: ${fontColor};

      .esri-legend {
        background-color: transparent;
        color: ${fontColor};
        height: 100%;
        .esri-legend--card {
          .esri-legend--card__carousel {

            // For card style pagination
            --calcite-internal-carousel-pagination-icon-color: var(--sys-color-surface-paper-text);
            --calcite-internal-carousel-pagination-icon-color-selected: var(--sys-color-action-selected);
            // Arrow color
            --calcite-carousel-control-icon-color: var(--sys-color-surface-paper-text);
            // Arrow hover color
            --calcite-internal-carousel-control-icon-color-hover: var(--sys-color-surface-paper-text);
            // Arrow hover bg color
            --calcite-carousel-pagination-background-color-hover: rgba(0, 0, 0, 0.2);
            // Focus ring color
            --calcite-color-focus: var(--sys-color-action-focus);
            // Dot hover color
            --calcite-carousel-pagination-icon-color-hover: var(--sys-color-surface-paper-text);

            height: 100%;
            width: 100%;
            max-height: unset;
          }
        }

        .esri-legend--card__service {
          width: 100%;
        }

        h3.esri-widget__heading, .esri-legend__service, .esri-legend--card__layer-caption, .esri-legend--card__service {
          color: ${fontColor};
          font-family: ${theme.sys.typography.body.fontFamily};
          font-size: var(--calcite-font-size--1);
        }
      }

      .esri-legend.esri-widget.esri-widget--panel {
        .esri-legend__layer {
          overflow-x: hidden;
        }
      }

      .esri-legend--card {
        background-color: transparent;
        color: ${fontColor};
        height: 100%;
      }

      .esri-legend--card.esri-legend--stacked{
        flex-direction: column;
        justify-content: space-between;
      }

      .esri-legend--card__section {
        width: 100%;
        height: unset;
        margin-bottom: 32px;
      }

      .esri-legend--card__carousel-indicator-container {
        order: 1;
        color: ${fontColor};
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
      }

      .esri-legend--card__service-caption-container {
        color: ${fontColor};
        background: transparent;
      }

      .esri-legend--card.esri-widget{
        background-color: ${cardRoot};
      }

      .esri-legend__layer-table--size-ramp .esri-legend__layer-cell {
        font-family: ${theme.sys.typography.body.fontFamily};
        font-size: var(--calcite-font-size--2);
      }
    }
  `
}
