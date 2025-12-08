import { type IMThemeVariables, css, type SerializedStyles, polished } from 'jimu-core'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`
    &.jimu-widget-bookmark-setting {
      &.bookmark-setting-con-with-template-scroll {
        height: calc(100% - 216px) !important;
        .next-con div {
          bottom: 218px !important;
        }
      }
      .resetting-template {
        cursor: pointer;
        color: ${theme.sys.color.primary.light};
        padding: 0 2px 1px 0;
        font-size: ${theme.sys.spacing(3)};
      }
      .resetting-template:hover {
        cursor: pointer;
        color: ${polished.rgba(theme.sys.color.primary.light, 0.8)};
      }
      .bookmark-setting {
        display: flex;
        flex-direction: column;
        height: 100%;
        .bookmark-setting-flex {
          flex: 1;
        }
        .card-size-edit {
          width: 120px;
        }
      }
      .tips-pos {
        margin-top: -2px;
      }
      .template-group {
        button {
          padding: 0;
        }
        .template-img {
          cursor: pointer;
          width: 100%;
          height: 70px;
          border: 1px solid ${theme.ref.palette.neutral[500]};
          background-color: ${theme.ref.palette.white};
          margin-right: 0;
          &.active {
            border: 2px solid ${theme.sys.color.primary.main};
          }
          &.template-img-h {
            width: 109px;
            height: 109px;
          }
          &.template-img-gallery {
            width: 227px;
            height: 69px;
          }
        }
        .vertical-space {
          height: 10px;
        }
      }
    }
  `
}

export function getNextButtonStyle (theme: IMThemeVariables, templateConWidth: number): SerializedStyles {
  return css`
    &.next-con {
      & {
        height: 48px;
      }
      .position-absolute-con, .position-relative-con {
        padding-top: ${theme.sys.spacing(2)};
        margin-left: -${theme.sys.spacing(4)};
      }
      div{
        padding: ${theme.sys.spacing(4)};
        background: ${theme.ref.palette.neutral[400]};
        left: ${theme.sys.spacing(4)};
        bottom: 0;
        width: ${templateConWidth}px
      }
    }
  `
}
