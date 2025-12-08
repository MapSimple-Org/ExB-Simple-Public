import { type IMThemeVariables, css, polished, type SerializedStyles } from 'jimu-core'

export function getStyle (theme?: IMThemeVariables): SerializedStyles {
  return css`
    &.widget-setting-feature-report {
      .survey-selector-container {
        background:  ${theme.sys.color.divider.tertiary};
        flex-direction: column;
        padding: 0.625rem;
        .radio-item {
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: nowrap;
            &:first-of-type {
              margin-top: 0;
            }
        }
      }

      .option-setting-outter{
        .jimu-widget-setting--row {
          background:  ${theme.sys.color.divider.tertiary};  // #3d3d3d
          margin-top: 0.5rem;
          padding: 0.625rem;
        }

        .option-setting-item{
          height: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: nowrap;
          // margin-bottom: 8px;
        }
      }

      .not-supported-portal-outter {
        width: 100%;
        padding: 8px;
        border: 1px solid ${theme.sys.color.warning.main};
        background: ${theme.ref.palette.warning[100]};
      }

      .template-setting-outter {
        .add-templat-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            font-weight: 500;
            margin: 0 10px;
          }
        }
        .help-btn {
          max-width: 50%;
        }
      }

      .template-list-container {
        margin-top: 0.625rem;
      }

      .error-alert {
        position: fixed;
        right: 0;
        top: 139px;
        width: 260px;
        height: auto;
        z-index: 1;
      }

      .empty-placeholder {
        display: flex;
        flex-flow: column;
        justify-content: center;
        height: calc(100% - 200px);
        overflow: hidden;
        .empty-placeholder-inner {
          padding: 0px 20px;
          flex-direction: column;
          align-items: center;
          display: flex;

          .empty-placeholder-text {
            color: ${theme.sys.color.surface.paperText}; // #bdbdbd
            font-size: ${polished.rem(14)};
            margin-top: 16px;
            text-align: center;
          }
          .empty-placeholder-icon {
            color: ${theme.sys.color.divider.inputField};
          }
        }
      }

      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px ${theme.ref.palette.white} inset;
        -webkit-text-fill-color: ${theme.ref.palette.black};
      }
      .feature-report__section {
        .choose-report-label {
          margin-bottom: 0;
        }
        input + span {
          // margin-left:5px;
        }
        .jimu-widget-setting--section-header.row >h6 {
          font-size: 0.875rem;
          color: ${theme.sys.color.surface.paperText};
        }

        .report-list-msg {
          padding: 0 5px;
        }
        .report-list-loading-outter {
          position: relative;
          top: -18px;
        }
        .feature-report__section-createreport {
          >.container >.w-100.setting-header {
            padding-bottom: 1rem!important;
            >div:first-of-type {
              padding-bottom: 0.5rem;
            }
            >.jimu-input span.input-wrapper {
              height: 1.625rem;
            }
            .summary{
              height: auto;
              textarea {
                resize: none;
              }
            }
          }
        }

        .feature-report__section-createreport, .select-report-section {
          .error-message {
            color: ${theme.sys.color.error.main};
            word-break: break-word;
          }
          .no-report-message {
            color: ${theme.sys.color.surface.backgroundHint};
          }
          .newreport-msg {
            color: ${theme.sys.color.error.main};
            marginTop: '10px';
            word-break: break-word;
          }
        }
        .select-report-section {
          hr.split-line {
            display: none;
          }
        }

        .jimu-widget-setting--row.items {
          margin-top: 1.2rem;
          display: block;
          h6 {
            color: ${theme.sys.color.surface.paperText};
          }
          div.w-100 {
            font-size: 0.8125rem;
            line-height: 1.1875rem;
            margin-top: 0.3125rem;

          }
        }

        .jimu-widget-setting--row >label {
          font-size: 0.875rem;
          font-weight: 400;
          +p.w-100 {
            font-size: 0.8125rem;
            line-height: 1.1875rem;
            margin-top: 0.3125rem;
          }
        }

        .appearance, .section-title {
          display: flex;
          justify-content: space-between;
          width:100%;
          h6 {
            margin-bottom: 0;
          }
        }

        .select{
          select {
            width: 100%;
          }
        }

        .mapping-container {
          padding: 0.615em;
          background: ${theme.sys.color.secondary.main};
          border-radius: 2px;
          margin: 0.6em 0;
          position: relative;
          >select {
            height: 26px;
            vertical-align: middle;
            font-size: 1em;
            line-height: 26px;
            padding: 0 22px 0 6px;
            &:first-of-type {
              margin-bottom: 8px;
            }
          }
          .btn-group {
            width: 100%;
            overflow: hidden;
            .icon-remove-mapping {
              padding: 0 0.25em;
              margin-left: 0;
              margin-right: 0;
              cursor: pointer;
              .remove-mapping {
                margin-right: 0;
                margin-left: 0;
              }
            }
            button {
              margin: 8px 0 8px 8px;
              height: 26px;
              line-height: 26px;
              padding: 0;
              padding: 0px 14px;
            }
          }
          >.link-info {
            > p {
              margin-bottom: 0;
              line-height: 2em;
            }
            > div.center-line {
              width: 96%;
              height: 1px;
              background: ${theme.sys.color.secondary.dark};
              text-align: center;
              margin: 0.5em 2% 0.5em 2%;
              >.connect {
                display: inline-block;
                width: 26px;
                height: 20px;
                background: ${theme.sys.color.secondary.main};
                position: relative;
                top: -10px;
              }
            }
            > div.delete-connect {
              display: none;
              position: absolute;
              right: 0;
              top: 0;
              cursor: pointer;
              background: ${theme.sys.color.secondary.main};
              text-align: center;
              width: 24px;
              height: 24px;
            }
            &:hover > div.delete-connect {
              display: block;
            }
          }

        }

        .setting-row {
          margin: 0.5rem 0 0 0;
          display: flex;
          flex-flow: row wrap;
          align-items: center;
        }

        .section-title h5{
          display: inline-block;
          font-weight: 500;
        }

        .section-title h6{
          word-break: break-word;
        }

        .fea-layer-outter {
          flex-wrap:wrap;
          >div {
            width: 100%;
          }
        }

        .use-feature-layer-setting {
          width: 100%;
          margin-top: 0.92em;
        }
        .feature-layer-dropdown {
          width: 100%;
          margin: 0.5rem 0 0 0;
        }
        &-resetreport {
          position:relative;
          // top: -8px;
          height: 26px;
          float:right;
          line-height: 8px;

          svg {
            margin:0px !important;
          }
        }

        .cursor-pointer{
          &:hover{
            cursor:pointer;
          }
        }
        .select-report-label {
          padding: 0 8px;
        }

        &-reportMenu {}

        &-selectExistingreport {}

        &-createreport {
          overflow-y: hidden;

          span.isRequired{
            position:relative;
            /* left:-180px; */
            color: ${theme.sys.color.error.main};
            top: 4px;
            left: 4px;
          }
        }

        &-reportSettings {

        }
      }
    }

    .download-template {
      position: relative;
      a {
        position: absolute;
        display: block;
        width: 100%;
        left: 0;
        top: 0;
        bottom: 0;
      }
    }
    .setting-ui-template-list-exsiting {
      .jimu-tree-item_template {
        padding-top: 0.25rem;
      }
    }
    .setting-ui-template-list-new {
      margin-top: 0.375rem;
    }
  `
}

export function getModalStyle (theme?: IMThemeVariables): SerializedStyles {
  return css`
  .template-list {
    // padding: 0.75rem;
    padding: 0.5rem;
    // background: ${theme.ref.palette.neutral[300]}; //#181818;
    ul {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      li {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.5rem 0;
        gap: 0.5rem;
        background: ${theme.ref.palette.secondary[400]};
        >div {
          max-width: 100%; // calc(100% - 24px);
          display: flex;
          gap: 0.275rem;
          align-items: center;
          position:relative;
          p{
            margin:0;
          }
          span.template-label {
            margin: 0 -2px;
          }
          Button {
            min-width: 24px;
          }
        }
      }
    }
  }
  `
}
