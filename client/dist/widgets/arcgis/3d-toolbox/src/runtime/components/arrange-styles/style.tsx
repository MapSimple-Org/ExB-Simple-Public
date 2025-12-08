import { type IMThemeVariables, css, type SerializedStyles/*, polished*/ } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    /* List mode */
    .list-item-container {
      background-color: ${theme.sys.color.surface.paper};
      overflow: auto;

      .main-list {

      }

      .hide {
        display: none !important;
      }

      .list-item {
        height: 38px;
        min-width: 240px;
        color: var(--sys-color-surface-paper-text); /* item color */

        &:hover {
          background-color: ${theme.sys.color.action.hover};

          .list-item-name {
            ${theme.sys.color.surface.paperText};
          }
        }

        .list-item-icon {

        }
        .list-item-name {

        }
      }
    }

    /* Icon mode */
    .icon-item-container {
      background-color: var(--sys-color-surface-paper);

      .icon-item {
        color: var(--sys-color-surface-paper-text); /* item color */
        width: 32px;
        height: 32px;
      }

      .jimu-button.active {
        color: var(--sys-color-action-selected-text);
        background-color: var(--sys-color-action-selected);
      }
    }
  `
}

export function getPopperStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    .popper-header {
      .popper-title {
        margin-bottom: 0;
        font-weight: 600;
        font-size: 16px;
      }
    }
    .popper-content {
      width: 350px;
    }
  `
}
