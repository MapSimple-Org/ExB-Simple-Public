import { React } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import BaseItem, { ExpandType, type BaseItemConstraint } from './base-item'
import nls from '../../translations/default'
import { ItemsName } from '../../../config'
import { ItemBtn, type IconImages } from './subcomps/item-btn'

const IconImage: IconImages = {
  default: require('./assets/icons/default/email.svg'),
  white: require('./assets/icons/white/email.svg'),
  black: require('./assets/icons/black/email.svg')
}

export interface EmailConstraint extends BaseItemConstraint {
}

export class Email extends BaseItem<EmailConstraint> {
  hiddenLinkRef: React.RefObject<any>

  shareEmailSubject: string
  shareEmailTxt1: string
  shareEmailTxt2: string
  shareEmailTxt3: string

  constructor (props) {
    super(props)
    // this.init(ItemsName.Email, '#35465C', ExpandType.BtnRedirect);
    this.hiddenLinkRef = React.createRef()

    this.shareEmailSubject = this.props.intl.formatMessage({ id: 'emailSubject', defaultMessage: nls.emailSubject })
    this.shareEmailTxt1 = this.props.intl.formatMessage({ id: 'emailText1', defaultMessage: nls.emailText1 })
    this.shareEmailTxt2 = this.props.intl.formatMessage({ id: 'emailText2', defaultMessage: nls.emailText2 })
    this.shareEmailTxt3 = this.props.intl.formatMessage({ id: 'emailText3', defaultMessage: nls.emailText3 })
  }

  onClick = (ref: React.RefObject<any>) => {
    this.props.onItemClick(ItemsName.Email, ref, ExpandType.BtnRedirect)
    this._updateHref()
    this.clickANode()
  }

  clickANode = () => {
    this.hiddenLinkRef.current.click()
  }

  _updateHref = () => {
    const appTitle = this.props.getAppTitle()
    // const by = this.getMsgBy();
    const aNode = this.hiddenLinkRef.current
    if (aNode) {
      const body = this.getBody()

      let href = 'mailto:?subject=' + encodeURIComponent(this.shareEmailSubject + appTitle)
      href += '&body=' + body

      aNode.href = href
    }
  }

  getBody = () => {
    const urlEncodedNewLine = '%0D%0A'
    const urlEncodedDoubleNewLine = '%0D%0A%0D%0A'
    const appTitle = this.props.getAppTitle()
    const emailContent = this.props.config?.emailContent
    const encodedAppTitle = encodeURIComponent(appTitle)
    if (emailContent?.isCustomize) {
      const content = emailContent.content
      // replace \n with %0D%0A
      const body = content
        .replace(/\n/g, urlEncodedNewLine)
        .replace(/{appName}/g, encodedAppTitle)
        .replace(/{appURL}/g, encodeURIComponent(this.props.sharedUrl))
      return body
    } else {
      let body = encodeURIComponent(this.shareEmailTxt1) + urlEncodedDoubleNewLine + encodedAppTitle
      body += urlEncodedNewLine + encodeURIComponent(this.props.sharedUrl)
      body += urlEncodedDoubleNewLine + encodeURIComponent(this.shareEmailTxt2)
      body += urlEncodedDoubleNewLine + encodeURIComponent(this.shareEmailTxt3)
      return body
    }
  }

  render() {
    const emailNls = this.props.intl.formatMessage({ id: ItemsName.Email, defaultMessage: defaultMessages.email })
    const emailA11yLabel = this.props.intl.formatMessage({ id: 'emailA11yLabel',defaultMessage: nls.emailA11yLabel })

    return (
      <>
        <ItemBtn
          name={ItemsName.Email}
          intl={this.props.intl}
          nls={emailNls}
          a11yLabel={emailA11yLabel}
          iconImages={IconImage}
          attr={this.props}
          isLink={true}
          onClick={this.onClick}
          a11yFocusElement={this.props.a11yFocusElement}
        />

        <div style={{ display: 'none' }}>
          <a href='' ref={this.hiddenLinkRef} />
        </div>
      </>
    )
  }
}
