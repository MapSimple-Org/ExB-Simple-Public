import { type IMThemeVariables, css, type SerializedStyles, polished, getAppStore } from 'jimu-core'
import { colorUtils } from 'jimu-theme'

export function getTimelineStyles (theme: IMThemeVariables, marginForLR: number, foregroundColor, backgroundColor, sliderColor): SerializedStyles {
  const isRTL = getAppStore().getState().appContext.isRTL
  foregroundColor = colorUtils.parseThemeVariable(foregroundColor || theme.sys.color.surface.paperText, theme)
  backgroundColor = backgroundColor || theme.sys.color.surface.paper
  sliderColor = colorUtils.parseThemeVariable(sliderColor || theme.sys.color.primary.main, theme)

  return css`
    height: fit-content;
    color: ${foregroundColor};

    // Common style
    .timeline-header, .timeline-footer {
      height: 16px;
      display: flex;
      flex-direction: ${isRTL ? 'row-reverse' : 'row'};
      align-items: center;
      justify-content: space-between;
      .zoom-container {
        min-width: 36px;
        display: flex;
        flex-direction: ${isRTL ? 'row-reverse' : 'row'};
      }
      .range-label {
        display: flex;
        align-items: center;
        font-size: ${polished.rem(12)};
        font-weight: 500;
        line-height: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .range-label-badge {
          width: 8px;
          height: 8px;
          min-width: 8px;
          border-radius: 4px;
          margin-right: 0.25rem;
        }
      }
    }
    .timeline-content {
      overflow-x: hidden;

      .timeline-whole {
        .timeline-ticks {
          position: relative;
          .timeline-tick-container {
            position: absolute;
            user-select: none;
            .timeline-tick {
              width: 1px;
              background: ${colorUtils.colorMixOpacity(foregroundColor, 0.5)};
            }
            .timeline-tick_label {
              font-size: ${polished.rem(11)};
              font-weight: 400;
              line-height: 15px;
              width: max-content;
              transform: translate(${isRTL ? '50%' : '-50%'});
              color: foregroundColor;
              &.long-label {
                font-weight: 600;
              }
              &.medium-label {
                font-weight: 500;
              }
              &.short-label {
                font-weight: 400;
              }
              &.timeline-first_label {
                /* transform: ${`translate(-${marginForLR}px)`}; */
                transform: translate(0);
              }
            }
          }
        }
      }

      .timeline-range-container {
        height: 8px;
        /* width: ${`calc(100% - ${marginForLR * 2}px)`}; */
        width: 100%;
        border-radius: 4px;
        background-color: ${colorUtils.colorMixOpacity(foregroundColor, 0.2)};
        .resize-handlers {
          height: 100%;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          background-color: ${sliderColor};

          .resize-handler {
            width: 8px;
            height: 8px;
            padding: 0;
            overflow: visible;
            border-radius: 8px;
            background: ${sliderColor};
            border: 2px solid ${sliderColor};
            &.resize-instant {
              background: ${backgroundColor};
            }
          }

          &:hover {
            .resize-handler {
              background: ${backgroundColor};
            }
          }
        }
      }
      .timeline-arrow {
        position: absolute;
        &.left-arrow{
          transform: scaleX(-1);
        }
      }
    }
    .jimu-btn {
        color: ${foregroundColor};
        border-radius: 16px;
        &:hover:not(:disabled) {
          color: ${foregroundColor};
          background-color: ${colorUtils.colorMixOpacity(foregroundColor, 0.2)};
        }
        &.disabled {
          color: ${colorUtils.colorMixOpacity(foregroundColor, 0.2)};
          &:hover {
            color: ${colorUtils.colorMixOpacity(foregroundColor, 0.2)};
          }
        }
        .jimu-icon {
          margin: 0
        }

        .icon-btn-sizer {
          min-width: 0;
          min-height: 0;
        }
    }

    .jimu-dropdown-button {
      &:not(:disabled):not(.disabled):active,
      &[aria-expanded="true"]{
        border-color: transparent !important;
        color: unset !important;
      }
    }

    // Clasic style
    &.timeline-classic {
      padding: 1rem 1.5rem;
      .timeline-header .range-label {
        .range-label-badge {
          background-color: ${sliderColor};
        }
        .range-label-context {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .timeline-content {
        margin: 1rem 0.5rem;
        .timeline-whole {
          .timeline-ticks {
            padding-top: 0.75rem;
            .timeline-tick-container {
              .timeline-tick {
                &.long-tick {
                  height: 12px;
                  &.no-label {
                    margin-top: 19px;
                  }
                  &.has-label {
                    margin-top: 0;
                  }
                }
                &.medium-tick {
                  height: 8px;
                  &.no-label {
                    margin-top: 23px;
                  }
                  &.has-label {
                    margin-top: 8px;
                  }
                }
                &.short-tick {
                  height: 4px;
                  &.no-label {
                    margin-top: 27px;
                  }
                  &.has-label {
                    margin-top: 12px;
                  }
                }
              }
              .timeline-tick_label {
                margin-bottom: 4px;
              }
            }
          }
          .timeline-arrow {
            top: 78px;
            &.left-arrow{
              left: ${isRTL ? 'unset' : '20px'};
              right: ${isRTL ? '20px' : 'unset'};
            }
            &.right-arrow{
              left: ${isRTL ? '20px' : 'unset'};
              right: ${isRTL ? 'unset' : '20px'};
            }
          }
        }
        .timeline-range-container .resize-handlers .resize-handler {
          min-width: 8px;
          &:focus {
            background: ${backgroundColor};
            outline-offset: 0;
          }
        }
      }
      .timeline-footer {
        flex-direction: ${isRTL ? 'row-reverse' : 'row'};
        .play-container {
          min-width: 65px;
        }
      }
    }

    // Modern style
    &.timeline-modern {
      padding: 1rem 0.5rem;
      height: 156px;

      .timeline-header{
        padding-top: 0;
        padding-bottom: 0;
        padding: 0 36px;
        &.no-play-container {
          padding-left: ${isRTL ? '12px' : '36px'};
          padding-right: ${isRTL ? '36px' : '12px'};
        }
        .range-label {
          margin: 0 0.25rem;
          .range-label-badge {
            background-color: ${colorUtils.colorMixOpacity(sliderColor, 0.7)};
          }
        }
      }

      .timeline-content {
        display: flex;
        margin-top: 0.5rem;
          .timeline-left, .timeline-right {
            display: flex;
            height: 80px;
            .play-container {
              min-width: 17px; /* when play btn is hidden */
              display: flex;
              flex-direction: column;
              justify-content: center;
              .jimu-btn {
                margin: 0 0.5rem;
                &.next-btn {
                  margin-bottom: 0.5rem;
                }
                &.play-btn {
                  margin-top: 0.5rem;
                }
              }
            }
          }
        .timeline-middle {
          height: 115px;
          overflow-x: hidden;
          flex-grow: 1;
          .timeline-content-inside {
            border: 1px solid ${colorUtils.colorMixOpacity(foregroundColor, 0.5)};
            border-radius: 8px;
            .timeline-whole {
              display: flex;
              flex-direction: column;
              .timeline-ticks {
                .timeline-tick-container {
                  display: flex;
                  flex-direction: column-reverse;
                  .timeline-tick {
                    &.long-tick {
                      height: 32px;
                    }
                    &.medium-tick {
                      height: 16px;
                      margin-top: 16px;
                    }
                    &.short-tick {
                      height: 8px;
                      margin-top: 24px;
                    }
                  }
                  .timeline-tick_label {
                    margin-top: 0.5rem;
                  }
                }
              }
              .timeline-range-container {
                z-index: 1;
                width: 100%;
                background: transparent;
                .resize-handlers {
                  background-color: ${colorUtils.colorMixOpacity(sliderColor, 0.7)};
                  .resize-handler {
                    min-width: 4px;
                    width: 4px;
                    height: calc(100% - 10px);
                    margin: 5px 0;
                    background: transparent;
                    border: none;
                    &.show-bg { /** When handlers.w = 0 */
                      background-color: ${colorUtils.colorMixOpacity(sliderColor, 0.7)};
                      height: 100%;
                      margin: 0;
                      &:hover {
                        background-color: ${colorUtils.colorMixOpacity(sliderColor, 0.9)};
                      }
                    }
                  }
                  &:hover {
                    .resize-handler {
                      background: ${colorUtils.colorMixOpacity(sliderColor, 0.7)};

                    }
                  }
                }
              }
            }
          }
          .timeline-arrow {
            z-index: 2;
            top: 68px;
            &.left-arrow{
              left: 50px;
              left: ${isRTL ? 'unset' : '50px'};
              right: ${isRTL ? '50px' : 'unset'};
            }
            &.right-arrow{
              right: 50px;
              left: ${isRTL ? '50px' : 'unset'};
              right: ${isRTL ? 'unset' : '50px'};
              &.no-play-container {
                left: ${isRTL ? '25px' : 'unset'};
                right: ${isRTL ? 'unset' : '25px'};
              }
            }
          }
        }
      }
    }
  `
}
