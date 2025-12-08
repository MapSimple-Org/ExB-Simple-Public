import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  const playBtnSize = 48
  const commonBtnSize = 32
  const progressSize = 54
  const speedBtnW = 40
  const speedBtnH = 16

  const totalW = (commonBtnSize + 16) * 2 + playBtnSize
  const commonBtnHeightSpace = (commonBtnSize + 12)
  const totalH = commonBtnHeightSpace + playBtnSize
  // const isRTL = getAppStore().getState().appContext.isRTL;
  const front = 'left'// isRTL ? "right" : "left";
  const back = 'right'// isRTL ? "left" : "right";

  return css`
    .plan-route-mode {
      margin-top: ${0 - commonBtnHeightSpace}px;
    }

    .palette-wrapper {
      position: relative;
      width: ${totalW}px;
      height: ${totalH}px;

      .hide{
        display: none;
      }

      .btns,
      .dropdowns{
        position: absolute;
        width: ${commonBtnSize}px;
        height: ${commonBtnSize}px;
        border-radius: 50%;
        padding: 0;

        .icon-btn-sizer { /* fixed UI size for dot in dropdown-btn ,#10356 */
          min-width: 22px;
          min-height: 22px;

          .dropdown-button-content { /* supports off panel in controller ,#21681 */
            text-align: center;
          }
        }
      }

      /* 508 styles: jimu-outline-inside */
      .btns:focus,
      .btns:focus-visible,
      .dropdowns:focus,
      .dropdowns:focus-visible {
        outline-offset: -2px;
      }

      .btns:not([aria-expanded="true"]) {
        border: 1px solid var(--sys-color-divider-tertiary);
      }

      .btns.active {
        color: var(--sys-color-action-selected-text) !important;
      }
      .btns:not(.active):not(.jimu-disabled) {
        color: var(--sys-color-action-text) !important; /* icon color = container.text */
      }

      .btns:not(.active),
      .dropdowns {
        background-color: var(--sys-color-action); /* for btn style update ,#22451 */
      }

      .play-btn{
        width: ${playBtnSize}px;
        height: ${playBtnSize}px;
        bottom: 0;
        ${front}: ${totalW / 2 - playBtnSize / 2}px;
      }
      .draw-btn{
        ${front}: 16px;
        top: 16px;
      }
      .pick-btn{
        top: 0;
        ${front}: ${totalW / 2 - commonBtnSize / 2}px;
      }
      .clear-btn{
        ${back}: 16px;
        top: 16px;
      }

      .fly-style-btn{
        ${front}: 0;
        bottom: ${playBtnSize / 2 - commonBtnSize / 2}px;
      }
      .routes-dropdown,
      .liveview-btn{
        ${back}: 0;
        bottom: ${playBtnSize / 2 - commonBtnSize / 2}px;
      }

      .progress-bar-wrapper{
        position: absolute;
        width: ${progressSize}px;
        height: ${progressSize}px;
        ${front}: ${totalW / 2 - progressSize / 2}px;
        bottom: 20px;
      }

      .speed-controller-btn{
        position: absolute;
        width: ${speedBtnW}px;
        height: ${speedBtnH}px;
        bottom: 0;
        ${front}: 78px;
        border: 1px solid var(--sys-color-divider-tertiary);
        border-radius: 10px;
        background-color: var(--sys-color-action);
      }

      .speed-controller-text{
        font-size: 10px;
        padding: 0;

        .icon-btn-sizer{
          min-height: 0;
        }
      }

      {/* non-AroundMapCenterMode */}
      .only-1-fly-item {
        .draw-btn{
          ${front}: 0px;
          top: auto;
          bottom: ${playBtnSize / 2 - commonBtnSize / 2}px;
        }

        .pick-btn{
          top: 8px;
          ${front}: ${(totalW / 3 - commonBtnSize / 2) - 2}px;
        }
        .clear-btn{
          ${back}: ${(totalW / 3 - commonBtnSize / 2) - 2}px;
          top: 8px;
        }

        .routes-dropdown,
        .liveview-btn{
          ${back}: 0;
          bottom: ${playBtnSize / 2 - commonBtnSize / 2}px;
        }
      }
    }`
}

export function getPaletteDropdownStyle (): SerializedStyles {
  return css`
    min-width: 60px;
    padding: 0;

    .speed-popup-wrapper{
      font-size: 12px;

      .dropdown-item{
        padding-left: 0;
        padding-right: 0;
      }
    }`
}

// Toggle speedController
export function getPlayPanelWrapperClass (isPlaying: boolean): string {
  let cssClasses = ' hide '
  if (isPlaying) {
    cssClasses = ''
  }
  return cssClasses
}
export function getFunctionalBtnsClass (isPlaying: boolean): string {
  let cssClasses = ''
  if (isPlaying) {
    cssClasses = ' hide '
  }
  return cssClasses
}

export function getRouteModeClass (isRouteMode: boolean): string {
  let cssClasses = ''
  if (isRouteMode) {
    cssClasses = ' plan-route-mode '
  }
  return cssClasses
}
