import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    /*min-width: 300px;*/
    .tool-header {
      color: var(--sys-color-surface-overlay-text);

      .label {
        font-weight: 600;
        font-size: 1rem;
      }
    }

    .api-loader {
      position: absolute;
      height: 50%;
      left: 50%;
      z-index: 1;
    }

    .tool-content {
      min-width: 270px;
      min-height: 36px;
      overflow: auto;
      height: calc(100% - 30px);

      .esri-widget__heading {
        display: none;
      }

      /* min-height of widgets, for popper placement ,#13159 */
      .daylight-container {
        min-height: 200px;
      }
      .weather-container {
        min-height: 124px;
      }
      .shadowcast-container {
        min-height: 341px;
      }
      .lineofsight-container {
        min-height: 56px;
      }
      .slice-container {
        min-height: 56px;
      }

      .tool-footer {
        button {
          /*color: var(--sys-color-action);
          border: 1px solid var(--sys-color-action);*/
        }
      }

      /* 3D Toolbox: replace widget runtime color variables with the new theme system variables ,#28085 */
      .esri-widget.esri-daylight,
      .esri-widget.esri-weather,
      .esri-widget.esri-shadow-cast {
        /* usually */
        background-color: var(--sys-color-surface-overlay);
        color: var(--sys-color-surface-overlay-text);
        --calcite-label-text-color: var(--sys-color-surface-overlay-text);

        --calcite-ui-brand: var(--sys-color-primary-main);
        /*--calcite-ui-text-inverse: var(--sys-color-action-text);*/
        --calcite-ui-text-inverse: var(--sys-color-surface-overlay);
        --calcite-internal-button-text-color: var(--sys-color-primary-text);

        /* hover */
        --calcite-ui-brand-hover: var(--sys-color-primary-main);

        /* selected */
        --calcite-color-brand: var(--sys-color-action-selected);
        --calcite-color-text-inverse: var(--sys-color-action-selected-text);

        /* slider */
        .esri-slider,
        .esri-shadow-cast__time-range {
          background-color: var(--sys-color-surface-overlay);
          color: var(--sys-color-surface-overlay-text);

          /* timezone-picker */
          .esri-timezone-picker {
            --calcite-color-text-1: var(--sys-color-surface-overlay-text);
          }

          .esri-slider__thumb {
            background-color: var(--sys-color-primary-text);
            border-color: var(--sys-color-primary-main);

            &:hover {
              background-color: var(--sys-color-primary-text) !important;
              border-color: var(--sys-color-primary-main) !important;
            }
          }

          .esri-slider__anchor:focus .esri-slider__thumb {
            outline: var(--sys-color-primary-main);
          }

          .esri-slider__segment--interactive,
          .esri-slider__segment-1 {
            background: var(--sys-color-primary-main);
          }
        }

        /* date-picker */
        --calcite-input-text-text-color: var(--sys-color-action-text);
        --calcite-input-text-text-color-focus: var(--sys-color-action-text);

        /* primary btn */
        /* https://www.figma.com/file/8EJ9ktTFkIZU3KmaMAz2lb/Design-System-ExB?node-id=287%3A5239&t=9kFu8ZNQiWmozlje-0 */
        .esri-button--primary.esri-button {
          color: var(--sys-color-primary-text) !important;

          background: var(--sys-color-primary-main);
          border-color: var(--sys-color-primary-main);

          &:hover {
            background: var(--sys-color-primary-main);
          }
        }
      }

      /* esri-shadow-cast's text-1 color CAN NOT be overwrite ,#29903 */
      .esri-widget.esri-daylight,
      .esri-widget.esri-weather {
        /* unselected */
        --calcite-color-text-1: var(--sys-color-action);
      }
      .esri-widget.esri-weather {
        --calcite-color-text-1: --sys-color-surface-overlay-text;
      }

      /* Line-of-sight & Slice */
      .esri-widget.esri-line-of-sight,
      .esri-widget.esri-slice {
        /* usually */
        background-color: var(--sys-color-surface-overlay);
        color: var(--sys-color-surface-overlay-text);
        --calcite-label-text-color: var(--sys-color-surface-overlay-text);

        --calcite-color-foreground-2: ${polished.rgba('#000', 0.2) + ' !important'};
      }
      /* Slice */
      .esri-widget.esri-slice {
        /* unselected */
        --calcite-color-text-1: var(--sys-color-action-text);

        --calcite-color-text-3: var(--sys-color-action-text);
        --calcite-list-label-text-color: var(--sys-color-action-text);
      }

      /* Daylight */
      .esri-widget.esri-daylight {
        --calcite-ui-icon-color: var(--sys-color-surface-paper);

        /* enhanced UI for calcite popper, extensions#20437 */
        --calcite-icon-color: var(--sys-color-primary-text);
        --calcite-color-brand: ${polished.rgba(theme.sys.color.primary.main, 0.95) + ' !important'};
        --calcite-color-brand-hover: ${polished.rgba(theme.sys.color.primary.main, 0.85) + ' !important'};

        .esri-daylight__container__tick {
          border-color: transparent !important
        }
      }
    }
  `
}
