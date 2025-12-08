import { type IMThemeVariables, css, type SerializedStyles/*, polished */ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  const bgColor = theme.ref.palette.neutral[300]
  return css`
    .widget-setting-fly-controller{
      font-weight: lighter;
      font-size: 13px;

      .select-map-description {
        color: ${theme.ref.palette.neutral[1000]}
      }

      .fly-style-label {
        color: ${theme.ref.palette.neutral[900]}
      }

      .hide {
        display: none;
      }

      .radio-wrapper > span.jimu-radio {
        flex-shrink: 0;
      }

      .map-selector-section .component-map-selector .form-control{
        width: 100%;
      }

      /* ui-mode */
      .ui-mode-card-chooser{
        display: flex;
        align-items: start;

        .ui-mode-card-wrapper {
          flex: 1;
        }
        .ui-mode-card-separator {

        }
        .ui-mode-card {

          width: 100%;
          background: ${bgColor} !important;
          border: 2px solid ${bgColor} !important;
          margin: 0 0 0.5rem 0;
        }
        .ui-mode-card.active {
          border: 2px solid ${theme.sys.color?.primary.main} !important;
        }
        .ui-mode-label {
          overflow: hidden;
          text-align: center;
        }
      }

      /* item-mode */
      .item-detail-wrapper {
        width: 100%;
        padding-left: 0;
        padding-right: 0;
        padding-top: 0.8rem;
      }

      /* Rotate */
      .numeric-input {
        width: 80px;
      }

      /* Planned routes */
      .page-back-btn {
        padding-left: 0;
        padding-right: 0;
      }

      /* dnd-tree */
      .jimu-tree-main__item {
        .jimu-tree-item__body {
          padding: 1px 0;
        }
        .jimu-tree-item__main-line .jimu-tree-item__title >.jimu-tree-item__title-text {
          -webkit-line-clamp: 1;
        }
      }
    }
  `
}

export function getSettingSectionStyles (items, id: number, isCollapseUI: boolean): string {
  let needHidden = false
  if (items[id].isInUse === false) {
    needHidden = true
  }

  if (isCollapseUI) {
    needHidden = true
  } else {
    needHidden = false
  }

  let cssClasses = ''
  if (needHidden) {
    cssClasses = 'hide'
  }

  return cssClasses
}
