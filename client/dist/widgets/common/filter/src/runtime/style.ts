import { type IMThemeVariables, css, type SerializedStyles, polished, getAppStore } from 'jimu-core'
import { type IMConfig, FilterArrangeType } from '../config'

export const FILTER_PANEL_WIDTH = 350

export function getPanelStyles (isOffPanel, isPlaceholder = false): SerializedStyles {
  if (isPlaceholder) {
    return css`
      ${isOffPanel && `
        width: ${FILTER_PANEL_WIDTH}px;
        height: 54px;
      `}
    `
  } else {
    if (isOffPanel) {
      return css`
        width: ${FILTER_PANEL_WIDTH}px;
        min-height: 54px;
        max-height: 300px;
        overflow-y: auto;
        padding: 0.5rem;
        background-color: var(--sys-color-surface-paper);
        .filter-item-custom .sql-expression-builder .sql-expression-container .sql-expression-list {
          max-height: unset;
        }
      `
    } else {
      return css`
        width: 100% !important;
        height: 100% !important;
        max-height: 100vh;
      `
    }
  }
}

export function getFilterItemsStyles (theme: IMThemeVariables, config?: IMConfig): SerializedStyles {
  const isRTL = getAppStore().getState().appContext.isRTL
  const inputMixWidth = '200px'
  const doubleInputMixWidth = '300px'
  const doubleDateInputMixWidth = '350px'
  const isHorizontalPillItems = config?.arrangeType === FilterArrangeType.Inline && config?.filterItems?.length >= 2
  return css`
    .filter-items-container, &.filter-items-container {
      overflow: auto;

      .filter-item {
        /* skip case: horizontal pill items */
        padding-bottom: ${isHorizontalPillItems ? 0 : '0.5rem'};

        &.filter-item-popper{
          margin: 0.5rem;
          min-width: ${doubleInputMixWidth};
          max-width: ${doubleDateInputMixWidth};
        }

        /** custom filter - start */
        &.filter-item-custom {
          &:has(.small-mode) {
            .filter-layer-select {
              width: 100%;
              min-width: 240px;
              .layer-select {
                margin-top: 4px;
              }
            }
          }
          &:has(.medium-mode), &:has(.large-mode) {
            .filter-layer-select {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-left: 6px;
              padding-right: 6px;
              .layer-label {
                width: 178px;
              }
              .layer-select {
                width: calc(100% - 186px);
              }
            }
          }
          .sql-expression-builder {
            .sql-expression-container {
              min-height: 110px;
              min-width: 240px;
              display: block !important;
              .sql-expression-list { /** not show scrolling bar for expr list inside widget */
                max-height: unset;
                height: unset;
                overflow-y: visible;
                .sql-expression-set {
                  display: block !important;
                }
              }
            }
          }
        }
        /** custom filter - end */

        .filter-item-inline {
          padding-bottom: 0.5rem;
          padding-top: 0.5rem;

          .filter-item-arrow{
            transform: rotate(${isRTL ? 90 : 270}deg);
          }
          .filter-item-icon{
            margin-right: 0.5rem;

            &.no-arrow{
              margin-left: 0.5rem;
            }
          }
          .filter-item-name{
            font-size: ${polished.rem(13)};
            word-break: break-word;
            &.no-icons{
              margin-left: 0.5rem;
            }
            &.toggle-name{
              white-space: nowrap;
              margin-right: 0.5rem;
            }
          }

          /* sql-expression-styles - start */
          .sql-expression-inline{
            align-items: center;

            &.sql-expression-wrap{
              display: block !important;

              .sql-expression-builder{
                overflow-x: hidden;
                .sql-expression-container{
                  flex-wrap: wrap;
                  align-content: flex-start;
                  .sql-expression-set{
                    flex-wrap: wrap;
                  }
                }
              }

            }

            .sql-expression-builder{
              overflow-x: auto;
              .sql-expression-container{
                display: flex;
                .sql-expression-single{
                  margin-right: 0.5rem;
                  &:last-of-type{
                    margin-right: 0;
                  }
                  /* .clause-inline{
                    min-width: ${inputMixWidth};
                  }
                  .clause-block{
                    .sql-expression-input{
                      min-width: ${inputMixWidth};
                    }
                  }
                  .sql-expression-display-label{
                    min-width: ${inputMixWidth};
                  } */
                }
                .sql-expression-set{
                  display: flex;
                }
              }
            }

          }
          /* sql-expression-styles - end */

        }
      }

      .filter-item:last-child{
        padding-bottom: 0 !important;
      }

      &.filter-items-inline{
        max-width: 100vw;
        display: flex;
        .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
          .jimu-button-group {
            flex-wrap: nowrap;
            .pill-btn{
              overflow: visible;
            }
          }
        }

        &.filter-items-wrap{
          flex-wrap: wrap;
          align-content: flex-start;

          .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
            .jimu-button-group {
              flex-wrap: wrap;
            }
          }
        }
        .filter-item{
          /* padding: 0; */
          &.filter-item-popper{
            min-width: 300px;
            padding-bottom: 0.5rem;
            .filter-item-inline {
              padding-bottom: 0.5rem;
              padding-top: 0.5rem;
            }
          }
          .filter-item-inline{
            padding: 0;
            /* height: 100%; */
            overflow-y: auto;
            background-color: unset !important;
            border: none !important;

            .filter-expanded-container{
              width: ${doubleInputMixWidth};
              padding-top: 0.5rem;
            }

            /* .filter-item-clause-pill{
              margin: 10px 5px;
              white-space: nowrap;
            } */

            /* .filter-popper-container{ */
              .filter-item-pill{
                margin: 10px 4px;
                white-space: nowrap;

                .sql-expression-single{
                  margin: 0;
                }

                &.filter-item-toggle-pill{
                  display: flex;
                  flex-direction: row;
                  height: 32px;
                  align-items: center;
                  padding: 0 0.5rem;
                }
              /* } */
              /* .pill-display-label{
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              } */
            }

            /*input editor width*/
            .sql-expression-builder{
              .sql-expression-container{
                .sql-expression-single{
                  .clause-inline{
                    .sql-expression-label{
                      margin-right: 0.5rem;
                      width: auto;
                      overflow: visible;
                    }
                    .sql-expression-input{
                      width: auto;
                    }

                  }
                  /* .clause-block{ */
                    .sql-expression-input{
                      min-width: ${inputMixWidth};
                      .double-number-picker{
                        min-width: ${doubleInputMixWidth};
                      }
                      .double-datetime-picker{
                        min-width: ${doubleDateInputMixWidth};
                      }
                    }
                  /* } */
                  .sql-expression-display-label{
                    white-space: nowrap;
                    padding-right: 0.5rem;
                    font-size: 13px;
                  }
                }
              }
            }

          }
        }
      }

      &.filter-items-popup{
        min-width: ${doubleInputMixWidth};
        max-width: ${doubleDateInputMixWidth};
      }

      .apply-cancel-group{
        white-space: nowrap;
        overflow: visible;
      }


    }

    .filter-reset-container{
      display: flex;
      &.bottom-reset {
        margin-top: 0.5rem;
        justify-content: flex-end;
      }
      &.right-reset {
        height: fit-content;
        margin-top: 10px;
        margin-left: 0.5rem;
        margin-right: 0.25rem;
      }
    }
  `
}
