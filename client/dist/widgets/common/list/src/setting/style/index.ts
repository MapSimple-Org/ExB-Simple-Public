import { css, polished, type SerializedStyles, type IMThemeVariables } from 'jimu-core'
export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    &.jimu-widget-list-setting {
      &.list-setting-con-with-template-scroll {
        height: calc(100% - 216px) !important;
        .start-con div {
          bottom: 218px !important;
        }
      }
      .no-bottom-border {
        border-bottom: 0;
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .list-layout-select-con {
        box-sizing: border-box;
        button, button:hover, button.active {
          background: ${theme?.ref.palette.neutral[300]};
        }
        button {
          flex: 1;
          padding: ${polished.rem(4)};
          border-width: ${polished.rem(2)};
          border-color: transparent;
        }
      }
      .style-setting--base-unit-input {
        .dropdown-button {
          border: none;
        }
      }
      .clear-padding {
        padding-left: 0;
        padding-right: 0;
      }
      .card-setting-con {
        padding-top: 0;
      }
      .clear-border {
        border: none;
      }
      .clear-padding-bottom {
        padding-bottom: 0;
      }
      .sort-container {
        margin-top: 12px;
        .sort-multi-select {
          width: 100%;
        }
      }
      .lock-item-ratio-label {
        margin-left: ${polished.rem(8)};
      }
      .search-container {
        margin-top: 12px;
        .search-multi-select {
          width: 100%;
        }
      }
      .lock-item-ratio {
        margin-top: ${polished.rem(3)};
      }

      .resetting-template {
        cursor: pointer;
        color: ${theme.sys.color.primary.light};
        vertical-align: middle;
        padding: 0;
        margin: 0;
        font-size: ${polished.rem(13)};
      }
      .resetting-template:hover {
        cursor: pointer;
        color: ${polished.rgba(theme.sys.color.primary.light, 0.8)};
      }
      .setting-next {
        width: auto;
        max-width: 50%;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        text-align: end;
        font-size: ${polished.rem(13)};
        padding: 0;
        &:focus {
          outline: ${polished.rem(2)} solid ${theme.sys.color.primary.light};
          outline-offset: ${polished.rem(2)};
        }
        svg {
          margin: 0;
        }
      }
      .card-setting-return {
        cursor: pointer;
        font-size: ${polished.rem(14)};
        padding: 0;
      }

      .search-placeholder {
        & {
          background: ${theme.ref.palette.neutral[300]};
          color: ${theme.ref.palette.black};
          border: none;
          outline: none;
          box-sizing: border-box;
          border-radius: 2px;
          font-size: ${polished.rem(14)};
        }
        &:focus {
          border: 1px solid ${theme.sys.color.primary.dark};
        }
      }
      .style-group {
        button {
          padding: 0;
        }
        .template-icon-margin-r {
          margin-right: ${polished.rem(10)};
        }
        .style-img {
          cursor: pointer;
          width: 100%;
          height: 70px;
          border: 1px solid ${theme.ref.palette.neutral[500]};
          background-color: ${theme.ref.palette.white};
          margin-right: 0;
          &.active {
            border: 2px solid ${theme.sys.color.primary.main};
          }
          &.style-img-h {
            width: 109px;
            height: 109px;
          }
          &.low {
            height: 48px;
          }
          &.empty {
            height: 40px;
            line-height: 40px;
            color: ${theme.ref.palette.neutral[800]};
          }
        }
        .style-img10 {
          height: 30px !important;
        }
        .style-img11 {
          height: 60px !important;
        }
        .style-img12 {
          height: 72px !important;
        }
      }
      .vertical-space {
        height: 10px;
      }
      .list-size-edit {
        width: ${polished.rem(120)};
      }
      .datasource-placeholder {
        & {
          color: ${theme.ref.palette.neutral[800]};
        }
        p {
          color: ${theme.ref.palette.neutral[1000]};
          font-size: ${polished.rem(14)};
          margin: ${polished.rem(16)} auto 0;
          line-height: ${polished.rem(19)};
          width: ${polished.rem(228)};
        }
      }
    }
  `
}