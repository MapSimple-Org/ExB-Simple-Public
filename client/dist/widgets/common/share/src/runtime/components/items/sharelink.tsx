/** @jsx jsx */
import { jsx, css, type SerializedStyles } from 'jimu-core'
import { defaultMessages, Label, TextInput, Checkbox, Loading, LoadingType, FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import { CopyButton } from 'jimu-ui/basic/copy-button'
import BaseItem, { ShownMode, ExpandType, type BaseItemConstraint } from './base-item'
import nls from '../../translations/default'
import { ItemsName, UiMode, ErrorInfo } from '../../../config'
import { ItemBtn, type IconImages } from './subcomps/item-btn'
import { ErrorInfos } from './subcomps/error-infos'
import { getUrlWithoutLastSplash, sliceUrlForSharing } from './utils'

const IconImage: IconImages = {
  default: require('./assets/icons/default/sharelink.svg'),
  white: require('./assets/icons/white/sharelink.svg'),
  black: require('./assets/icons/black/sharelink.svg')
}

export interface ShareLinkConstraint extends BaseItemConstraint {
  sharedUrl: string

  onShortUrlChange: (shortUrl: string) => void
  updateUrls: (options?: { enableShortUrl?: boolean, urlExcludedUrlParams?: string }) => void
  // error
  errorInfo: ErrorInfo
  handleError: (type?: string) => void
  // loading
  isFetchingShortLink: boolean

  onCopy?: (text: string, result: boolean) => void
}
interface State {
  isShortLink: boolean
  isIncludeUrlParams: boolean
}

export class ShareLink extends BaseItem<ShareLinkConstraint, State> {
  _isDisableShortLinkByErrorFlag: boolean //clear error tips, when shortlink is successfully generated ,#17885

  constructor (props) {
    super(props)
    // this.init(ItemsName.Sharelink, '#35465C', ExpandType.ShowInPopup);
    this.state = {
      isShortLink: true, // true for reopen
      isIncludeUrlParams: true
    }

    this._isDisableShortLinkByErrorFlag = false
  }

  componentDidMount () {
    //this.props.updateUrls()
  }

  componentDidUpdate (prevProps: Readonly<BaseItemConstraint & ShareLinkConstraint>): void {
    // error
    if (this.props.errorInfo && ((this.props.errorInfo === ErrorInfo.UrlIsTooLong) || (this.props.errorInfo === ErrorInfo.NetworkFailed))) {
      if (this.state.isShortLink) {
        this._isDisableShortLinkByErrorFlag = true
      }
      this.setState({ isShortLink: false })
    }
    // restore ShortLink state, when no error
    if (!this.props.errorInfo && this._isDisableShortLinkByErrorFlag) {
      this._isDisableShortLinkByErrorFlag = false
      this.setState({ isShortLink: true })
    }
  }

  componentWillUnmount (): void {
    this.props.handleError('clear')
  }

  onCopy = (text, result) => {
    if (typeof this.props?.onCopy === 'function') {
      this.props.onCopy(text, result)
    }
  }

  onShortUrlChange = (e) => {
    const url = e.target.value
    this.props.onShortUrlChange(url)
  }

  onClick = (ref) => {
    this.props.onItemClick(ItemsName.Sharelink, ref, ExpandType.ShowInPopup, false)
  }

  toggleShortLink = (isShortLinkFlag: boolean) => {
    if (isShortLinkFlag !== this.state.isShortLink) {
      let _longUrl = sliceUrlForSharing(this.state.isIncludeUrlParams) // support remove url params
      _longUrl = getUrlWithoutLastSplash(_longUrl)// remove last splash
      this.props.updateUrls({ enableShortUrl: isShortLinkFlag, urlExcludedUrlParams: _longUrl })
    }

    this.setState({ isShortLink: isShortLinkFlag })
  }

  toggleIsIncludeUrlParams = (isIncludeUrlParamsFlag: boolean) => {
    if (isIncludeUrlParamsFlag !== this.state.isIncludeUrlParams) {
      let _longUrl = sliceUrlForSharing(isIncludeUrlParamsFlag) // support remove url params
      _longUrl = getUrlWithoutLastSplash(_longUrl)// remove last splash
      this.props.updateUrls({ enableShortUrl: this.state.isShortLink, urlExcludedUrlParams: _longUrl })
    }

    this.setState({ isIncludeUrlParams: isIncludeUrlParamsFlag })
  }

  getStyle = (): SerializedStyles => {
    return css`
      .short-link-wrapper {
        margin-bottom: 1rem;

        label {
          margin-bottom: 0;
        }
      }

      .share-link-group {
        margin: 10px 0 18px 0;
      }

      .short-link-label {
        margin: 0 0.5rem;
      }
    `
  }

  getTextInputStyle = (): SerializedStyles => {
    const suffixWidth = 28
    return css`
      .url-loading {
        .input-wrapper {
          padding-right: ${suffixWidth}px;
        }

        /* Donut Loading for TextInput */
        .url-loading-suffix {
          position: absolute;
          width: ${suffixWidth}px;
          top: 0;
          left: unset !important;
          right: 0;
          bottom: 0;
        }
      }
    `
  }

  getTextInputSuffix = () => {
    let suffixBtn = null
    // error
    if (this.props.errorInfo) {
      suffixBtn = <ErrorInfos errorInfo={this.props.errorInfo} isShowTips={true}></ErrorInfos>
    }
    // loading
    if (this.props.isFetchingShortLink) {
      suffixBtn = <Loading type={LoadingType.Donut} className='url-loading-suffix' width={16} height={16}/>
    }

    return suffixBtn
  }

  render () {
    let content = null
    const { shownMode, sharedUrl } = this.props

    const titleNls = this.props.intl.formatMessage({ id: 'link'/*ItemsName.Sharelink*/, defaultMessage: defaultMessages.link/*defaultMessages.sharelink*/ })
    const shortLinkNls = this.props.intl.formatMessage({ id: 'shortLink', defaultMessage: nls.shortLink })
    const includeUrlParamsNls = this.props.intl.formatMessage({ id: 'includeUrlParams', defaultMessage: nls.includeUrlParams })

    if (shownMode !== ShownMode.Btn) {
      content = (
        <div css={this.getCommonStyle()} className={this.props.isShowing ? FOCUSABLE_CONTAINER_CLASS : 'd-none'}>
          <div css={this.getStyle()}>
            <div className='share-inputs-wrapper share-link-group d-flex justify-content-between align-items-center' css={this.getTextInputStyle()}>
              <TextInput name='text' className={'share-link-input d-flex w-100 ' + (this.props.isFetchingShortLink ? 'url-loading ' : '')}
                value={sharedUrl} onChange={this.onShortUrlChange}
                suffix={this.getTextInputSuffix()}
              //readOnly={true}
              />
              <CopyButton text={sharedUrl} onCopy={this.onCopy} />
            </div>

            <div className='d-flex short-link-wrapper'>
              <Label className='d-flex align-items-center'>
                <Checkbox checked={this.state.isShortLink} onChange={evt => { this.toggleShortLink(evt.target.checked) }}
                  disabled={this.props.isFetchingShortLink}
                />
                <span className='mx-2'>{shortLinkNls}</span>
              </Label>
            </div>
            <div className='d-flex justify-content-between short-link-wrapper'>
              <Label className='d-flex align-items-center'>
                <Checkbox checked={this.state.isIncludeUrlParams} onChange={evt => { this.toggleIsIncludeUrlParams(evt.target.checked) }} ></Checkbox>
                <span className='mx-2'>{includeUrlParamsNls}</span>
              </Label>
            </div>

            {this.props.uiMode === UiMode.Popup &&
              <div className='separator-line'></div>
            }
          </div>
        </div>
      )
    } else {
      content = (
        <div css={this.getStyle()}>
          <ItemBtn
            name={ItemsName.Sharelink}
            intl={this.props.intl}
            nls={titleNls}
            iconImages={IconImage}
            attr={this.props}

            onClick={this.onClick}

            a11yFocusElement={this.props.a11yFocusElement}
            a11yIsBtnHaspopup={true}
          />
        </div>
      )
    }

    return content
  }
}
