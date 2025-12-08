import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'

export function getStyle (theme?: IMThemeVariables): SerializedStyles {
  return css`
    &.survey123{
      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px ${theme.ref.palette.white} inset;
        -webkit-text-fill-color: ${theme.ref.palette.black};
      }
      .survey123__section {
        .choose-survey-label {
          margin-bottom: 0;
        }
        input + span {
          // margin-left:5px;
        }
        .jimu-widget-setting--section-header.row >h6 {
          font-size: 0.875rem;
          color: ${theme.ref.palette.neutral[1000]};
        }

        .survey-list-msg {
          padding: 0 5px;
        }
        .survey-list-loading-outter {
          position: relative;
          top: -18px;
        }
        .survey123__section-createSurvey {
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

        .survey123__section-createSurvey, .select-survey-section {
          .error-message {
            color: ${theme.sys.color.error.main};
            word-break: break-word;
          }
          .no-survey-message {
            color: ${theme.ref.palette.neutral[900]};
          }
          .newSurvey-msg {
            color: ${theme.sys.color.error.main};
            marginTop: '10px';
            word-break: break-word;
          }
        }
        .select-survey-section {
          hr.split-line {
            display: none;
          }
        }
        .create-survey-container {
          .jimu-widget-setting--row.items {
            margin-top: 1.2rem;
            display: block;
            h6 {
              color: ${theme.ref.palette.neutral[1000]};
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

        .selection-behavior-item {
          margin-top: 0.5rem;
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
          margin-top: 0.25em;
        }
        .feature-layer-dropdown {
          width: 100%;
          margin: 0.5rem 0 0 0;
        }
        &-resetSurvey {
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
        .select-survey-label {
          padding: 0 8px;
        }

        &-surveyMenu {}

        &-selectExistingSurvey {}

        &-createSurvey {
          overflow-y: hidden;

          span.isRequired{
            position:relative;
            /* left:-180px; */
            color: ${theme.sys.color.error.main};
            top: 4px;
            left: 4px;
          }
        }

        &-surveySettings {

        }
      }
    }
  `
}

export function getModalStyle (theme?: IMThemeVariables): SerializedStyles {
  return css`
    &.survey123__desinger_modal {
      z-index: 100000;
      overflow: hidden;
      max-width: 100% !important;
      .modal-content{
        width: 100%;
        height: 100%;
        .survey123__desinger {
          width: 100%;
          height: 80px;
          padding: 23px 60px 23px 30px;
          color: ${theme?.sys.color.surface.headerText};
          background-color: ${theme?.sys.color.surface.header};

          >p {
            font-size: 24px;
            margin-bottom: 0;
            line-height: 33px;
          }
          >button {
            position: absolute;
            top: 28px;
            right: 30px;
            background-color: ${theme?.sys.color.surface.header};
            color: ${theme?.sys.color.surface.headerText};
            border: none;
            cursor: pointer;
            padding: 0;
          }
        }
        >iframe {
          height: calc(100% - 90px);
          width: 100%;
          border: none;
        }
      }
    }

  `
}
