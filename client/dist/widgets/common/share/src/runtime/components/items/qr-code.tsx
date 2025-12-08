/** @jsx jsx */
import { jsx, css, type SerializedStyles } from 'jimu-core'
import { FOCUSABLE_CONTAINER_CLASS, defaultMessages } from 'jimu-ui'
import { QRCode as JimuQRCode } from 'jimu-ui/basic/qr-code'
import BaseItem, { ShownMode, ExpandType, type BaseItemConstraint } from './base-item'
import { ItemsName, type ErrorInfo } from '../../../config'
import { ItemBtn, type IconImages } from './subcomps/item-btn'
import { ErrorInfos } from './subcomps/error-infos'
import nls from '../../translations/default'

const IconImage: IconImages = {
  default: require('./assets/icons/default/qrcode.svg'),
  white: require('./assets/icons/white/qrcode.svg'),
  black: require('./assets/icons/black/qrcode.svg')
}

export interface QRCodeConstraint extends BaseItemConstraint {
  errorInfo: ErrorInfo
}

interface State {
  isError: boolean
}

export class QRCode extends BaseItem<QRCodeConstraint, State> {
  constructor (props) {
    super(props)
    // this.init(ItemsName.Sharelink, '#35465C', ExpandType.ShowInPopup);
    this.state = {
      isError: false
    }
  }

  onClick = (ref) => {
    this.props.onItemClick(ItemsName.QRcode, ref, ExpandType.ShowInPopup)
  }

  componentDidUpdate (prevProps: Readonly<BaseItemConstraint & QRCodeConstraint>, prevState: Readonly<unknown>): void {
    if (this.props.sharedUrl !== prevProps.sharedUrl) {
      this.setState({ isError: false })
    }
  }

  getStyle = (): SerializedStyles => {
    return css`
      width: 328px;
      height: 72px;
      margin-top: 68px;
      margin-bottom: 87px;

      .error-icon {
        margin-bottom: 12px;
      }

      .error-tip {
        text-align: center;
      }
    `
  }

  render () {
    let content = null
    const { shownMode, isShowing } = this.props
    const qrcodeNls = this.props.intl.formatMessage({ id: ItemsName.QRcode, defaultMessage: defaultMessages.qrcode })

    if (shownMode !== ShownMode.Btn) {
      content = (<div className={isShowing ? FOCUSABLE_CONTAINER_CLASS : 'd-none'}>
            {isShowing && !this.state.isError &&
              <JimuQRCode value={this.props.sharedUrl} level='L' size={156} downloadFileName='Exb_QRCode'
                onError={(error, errorInfo) => {
                  this.setState({ isError: true })
                }}/>
            }
            {isShowing && this.state.isError &&
              <div css={this.getStyle()}>
                <div className='error-icon'>
                  <ErrorInfos
                    errorInfo={this.props.errorInfo}
                    size={24}
                    isShowTips={true}
                  ></ErrorInfos>
                </div>
                <div className='error-tip'>
                  {this.props.intl.formatMessage({ id: 'qrCodeError', defaultMessage: nls.qrCodeError })}
                </div>
              </div>
            }
        </div>)
    } else {
      content = (
        <ItemBtn
          name={ItemsName.QRcode}
          intl={this.props.intl}
          nls={qrcodeNls}
          iconImages={IconImage}
          attr={this.props}

          onClick={this.onClick}

          a11yFocusElement={this.props.a11yFocusElement}
          a11yIsBtnHaspopup={true}
        />
      )
    }

    return content
  }
}
