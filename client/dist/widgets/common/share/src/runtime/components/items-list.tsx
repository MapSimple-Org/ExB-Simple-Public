/** @jsx jsx */
import { React, jsx, css, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { type IMConfig, type Item, UiMode, InlineDirection, ItemsName, type ErrorInfo } from '../../config'
// items
import { ShownMode, type ExpandType } from './items/base-item'
import { ShareLink } from './items/sharelink'
import { QRCode } from './items/qr-code'
import { Facebook } from './items/facebook'
import { Twitter } from './items/twitter'
import { Email } from './items/email'
import { Embed } from './items/embed'
import { Pinterest } from './items/pinterest'
import { Linkedin } from './items/linkedin'
import { FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'

interface Props {
  sharedUrl: string

  uiMode: UiMode
  isFetchingShortLink: boolean

  isShowInModal: boolean

  onShortUrlChange: (shortUrl: string) => void
  updateUrls: (options?: { enableShortUrl?: boolean, urlExcludedUrlParams?: string }) => void
  getAppTitle: () => string

  errorInfo: ErrorInfo
  handleError: (type?: string) => void

  onItemClick: (name: ItemsName, ref: React.RefObject<any>, type: ExpandType, isUpdateUrl?: boolean) => void

  theme: IMThemeVariables
  intl: IntlShape
  config: IMConfig

  a11yFocusElement?: any
}

export class ItemsList extends React.PureComponent<Props> {
  isShowItem (itemList: Item[], itemName: ItemsName) {
    return itemList.find(item => item.id === itemName)
  }

  showElementByItemId = (itemList: Item[]) => {
    itemList = itemList.filter(item => item.enable) // disable filter

    const {
      sharedUrl, uiMode, theme, intl, config, isShowInModal, errorInfo, isFetchingShortLink,
      onItemClick, updateUrls, onShortUrlChange, getAppTitle, handleError
    } = this.props

    const shownMode = ShownMode.Btn

    return (
      itemList.map((item, idx) => {
        const itemId = item.id
        return <div key={idx} className={'item-wrapper ' + FOCUSABLE_CONTAINER_CLASS}>
        {(itemId === ItemsName.Embed) &&
          <Embed
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.QRcode) &&
          <QRCode
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}
            // error
            errorInfo={errorInfo}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Sharelink) &&
          <ShareLink
            sharedUrl={sharedUrl}

            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            onShortUrlChange={onShortUrlChange}
            updateUrls={updateUrls}
            getAppTitle={getAppTitle}
            // error
            errorInfo={errorInfo}
            handleError={handleError}
            // loading
            isFetchingShortLink={isFetchingShortLink}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Email) &&
          <Email
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Facebook) &&
          <Facebook
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Twitter) &&
          <Twitter
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Pinterest) &&
          <Pinterest
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
        {(itemId === ItemsName.Linkedin) &&
          <Linkedin
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal={isShowInModal}
            config={config} theme={theme} intl={intl}

            onItemClick={onItemClick}
            getAppTitle={getAppTitle}

            a11yFocusElement={this.props.a11yFocusElement}

            isShowing={true}
          />
        }
      </div>
      })
    )
  }

  _getDirClassName = (dir: string, isPopup: boolean) => {
    if (isPopup) {
      dir = InlineDirection.Horizontal
    }

    if (dir) {
      let styles = 'dir-' + dir.toLowerCase()

      if (isPopup) {
        styles = styles + ' in-popup-mode '
      }

      return styles
    } else {
      return ''
    }
  }

  getStyle = () => {
    const theme = this.props.theme
    return css`
      .dir-horizontal{
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
      }

      .dir-vertical{
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
      }

      .item-wrapper {
        margin-top: 8px;
        margin-bottom: 8px;
        max-width: 100px;
      }

      /* fix the gaps between the icons to make them aligned well ,#24263 */
      .in-popup-mode .item-wrapper {
        margin-right: 2px;
        margin-left: 2px;
      }

      .share-item {
        /*flex-basis: max-content;
        flex-basis: 130px;*/
      }

      .label-in-btn{
        color: inherit;
      }
      .label-out-of-btn{
        width: 100%;
        max-width: 100px;
        margin: 0.25rem;
        font-size: 0.8rem;
        color: ${theme.sys.color.surface.backgroundText};
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        font-weight: ${(theme.sys.typography.title3.fontWeight)};

        min-width: 60px;
        margin-left: 0.2rem;
        margin-right: 0.2rem;
      }
    `
  }

  render () {
    const { config, uiMode } = this.props
    const isPopup = (uiMode === UiMode.Popup)
    const itemListImmutable = isPopup ? config.popup.items : config.inline.items
    const itemList = itemListImmutable.asMutable()

    const dir = config.inline.design.direction
    const dirClass = this._getDirClassName(dir, isPopup)

    return (
      <div css={this.getStyle()}>
        <div className={dirClass}>{
          this.showElementByItemId(itemList)
        }
        </div>
      </div>
    )
  }
}
