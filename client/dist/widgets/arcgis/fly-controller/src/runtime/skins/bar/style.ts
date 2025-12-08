import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'
export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    position: relative;
    overflow: hidden;

    .bar {
      display: flex;
      background-color: var(--sys-color-surface-paper);

      .btns, dropdowns{
        width: 32px;
        height: 32px;

        .caret-icon {
          margin-left: 0; /* overwrite dropdown's default style ,#22450 */
        }
      }
      .btns {
        margin: 5px;
        padding: 0;
      }

      .btns.active {
        color: var(--sys-color-action-selected-text);
      }
      .btns:not(.active):not(.jimu-disabled) {
        color: var(--sys-color-surface-paper-text); /* icon color = container.text */
      }

      .routes-dropdown {
        margin-left: 8px;
        margin-right: 8px;
      }

      .speed-controller{
        margin: 0 8px;
      }

      .progress-bar-wrapper {
        /*display: flex;*/
        position: absolute;
        width: 100%;
        bottom: 0px;
      }
      .items {
        display: flex;
        position: relative;
      }
      .items .item {
        display: flex;
        background: var(--sys-color-surface-paper);
      }
      /*.items .btn .jimu-icon{
        margin: 0;
      }*/
      .separator-line{
        width: 2px;
        margin: 4px 1px;
        border-right: 1px solid var(--sys-color-divider-tertiary);
      }
      .speed-wrapper{
        width: 214px;

        /*input[type="range"]::-webkit-slider-runnable-track {
          background-color: red;
        }*/
      }

      .one-fly-mode {
        .speed-wrapper{
          width: 168px;
        }
      }
    }
    .bar .hide,
    .bar .items.hide {
      display: none;
    }
    `
}

// Toggle speedController
export function getPlayPanelWrapperClass (isPlaying: boolean, isOnly1FlyModeInUse: boolean): string {
  let cssClasses = 'hide'
  if (isPlaying) {
    cssClasses = ''
  }

  if (isOnly1FlyModeInUse) {
    cssClasses = cssClasses + ' one-fly-mode'
  }

  return cssClasses
}
export function getSettingBtnsClass (isPlaying: boolean): string {
  let cssClasses = ''
  if (isPlaying) {
    cssClasses = 'hide'
  }
  return cssClasses
}
