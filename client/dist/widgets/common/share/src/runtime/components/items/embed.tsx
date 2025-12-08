/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreDefaultMessages } from 'jimu-core'
import { defaultMessages as jimuUIDefaultMessages, Label, NumericInput, TextArea, Select, FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import { CopyButton } from 'jimu-ui/basic/copy-button'
import nls from '../../translations/default'
import BaseItem, { ShownMode, ExpandType, type BaseItemConstraint } from './base-item'
import { ItemsName } from '../../../config'
import { ItemBtn, type IconImages } from './subcomps/item-btn'
import { stopPropagation, replaceAttr } from './utils'

const IconImage: IconImages = {
  default: require('./assets/icons/default/embed.svg'),
  white: require('./assets/icons/white/embed.svg'),
  black: require('./assets/icons/black/embed.svg')
}

interface EmbedProps extends BaseItemConstraint {
  embedSize?: string
}
interface State {
  // copied?: false;
  text?: string
  embedSize: string

  w?: number
  h?: number
}

export class Embed extends BaseItem<EmbedProps, State> {
  name: string
  defaultBgColor: string
  W_H_MAP: any
  ref: React.RefObject<any>

  constructor (props) {
    super(props)
    // this.init(ItemsName.Embed, '#35465C', ExpandType.ShowInPopup);
    this.W_H_MAP = {
      small: { w: 300, h: 200 },
      medium: { w: 800, h: 600 },
      large: { w: 1080, h: 720 }
    }

    const size = this.props.embedSize || 'medium'
    this.state = {
      //url: this.props.sharedUrl || '',
      text: '',

      embedSize: size,
      w: this.W_H_MAP[size].w || this.W_H_MAP.medium.w,
      h: this.W_H_MAP[size].h || this.W_H_MAP.medium.h
    }
  }

  componentDidMount () {
    this._setEmbedCode()
  }

  componentDidUpdate (prevProps: EmbedProps, prevState: State) {
    if (prevState.w !== this.state.w || prevState.h !== this.state.h || prevProps.sharedUrl !== this.props.sharedUrl) {
      this._setEmbedCode()
    }
  }

  onClickCopy = (/* { target: { innerHTML } } */) => {
    // console.log(`==> onClickCopy Clicked on '${innerHTML}'!`);
  }

  onCopy = () => {
    // console.log('==> onCopy');
  }

  onClick = (ref) => {
    this.props.onItemClick(ItemsName.Embed, ref, ExpandType.ShowInPopup)
  }

  _setEmbedCode = () => {
    const iframeTagStart = '<iframe'
    const iframeTagEnd = '></iframe>'
    const widthAttr = ' width="' + this.state.w + '"'
    const heightAttr = ' height="' + this.state.h + '"'
    const iframeProps = ' frameborder="0" allowfullscreen'
    const srcAttr = ' src="' + this.props.sharedUrl + '"'

    let text = this.state.text
    if (!text) {
      text = iframeTagStart + widthAttr + heightAttr + iframeProps + srcAttr + iframeTagEnd
    } else {
      text = replaceAttr(text, 'width', this.state.w)
      text = replaceAttr(text, 'height', this.state.h)
      text = replaceAttr(text, 'src', this.props.sharedUrl)
    }

    this.setState({ text: text })
  }

  onSizeChange = (e) => {
    const val = e.target.value
    this.setState({ embedSize: val })

    const wh = this.W_H_MAP[val]
    if (wh && wh.w && wh.h) {
      this.setState({ w: wh.w, h: wh.h })
    }
  }

  onWChange = (num: number) => {
    const val = num ?? 0
    this.setState({ w: val })

    this.setState({ embedSize: 'custom' })
  }

  onHChange = (num: number) => {
    const val = num ?? 0
    this.setState({ h: val })

    this.setState({ embedSize: 'custom' })
  }

  getStyle = () => {
    return css`
      .share-embed-input {

        .form-control {
          height: 90px;
          resize: none;
        }
      }
      .embed-options-label {
        font-size: var(--sys-typography-title2-font-size);
      }
      .embed-options-wrapper {
        width: 80%;

        .embed-option-size .jimu-dropdown-button {
          width: 120px;
        }

        .embed-option {
          width: 80px;
        }
        .embed-option-w {
          margin-right: 0.5rem;
        }
        .embed-option-h {
          margin-left: 0.5rem;
        }
      }
    `
  }

  render () {
    let content = null
    const { shownMode } = this.props

    const embedNls = this.props.intl.formatMessage({ id: ItemsName.Embed, defaultMessage: jimuUIDefaultMessages.embed })
    const embedOptionsNls = this.props.intl.formatMessage({ id: 'embedOptions', defaultMessage: nls.embedOptions })
    const smallNls = this.props.intl.formatMessage({ id: 'small', defaultMessage: jimuCoreDefaultMessages.small })
    const mediumNls = this.props.intl.formatMessage({ id: 'medium', defaultMessage: jimuCoreDefaultMessages.medium })
    const largeNls = this.props.intl.formatMessage({ id: 'large', defaultMessage: jimuCoreDefaultMessages.large })
    const customNls = this.props.intl.formatMessage({ id: 'custom', defaultMessage: jimuUIDefaultMessages.custom })

    const widthNls = this.props.intl.formatMessage({ id: 'width', defaultMessage: jimuUIDefaultMessages.width })
    const heightNls = this.props.intl.formatMessage({ id: 'height', defaultMessage: jimuUIDefaultMessages.height })

    if (shownMode !== ShownMode.Btn) {
      content = (
        <div css={this.getCommonStyle()} className={this.props.isShowing ? FOCUSABLE_CONTAINER_CLASS : 'd-none'}>
          <div css={this.getStyle()}>
            <div className='share-inputs-wrapper'>
              <TextArea name='text' className='share-embed-input' value={this.state.text} onChange={(evt) => {
                this.setState({ text: evt.target.value })
              }} />
              <div className='embed-copy-btn-wrapper d-flex'>
                <CopyButton text={this.state.text} onCopy={this.onCopy} />
              </div>
            </div>

            <div className='separator-line' style={{ border: 'none' }}></div>

            <div role='group' aria-label={embedOptionsNls}>
              <Label className='embed-options-label'>{embedOptionsNls}</Label>
              <div className='d-flex align-items-center embed-options-wrapper justify-content-between w-100'>
                <Select value={this.state.embedSize} onChange={this.onSizeChange} className='flex-fill embed-option-size' onClick={stopPropagation}>
                  <option value='small'>{smallNls}</option>
                  <option value='medium'>{mediumNls}</option>
                  <option value='large'>{largeNls}</option>
                  <option value='custom'>{customNls}</option>
                </Select>

                <div className='d-flex align-items-center'>
                  <NumericInput value={this.state.w} aria-label={widthNls} className='flex-fill embed-option embed-option-w'
                    min={0} onChange={this.onWChange} />
                  X
                  <NumericInput value={this.state.h} aria-label={heightNls} className='flex-fill embed-option embed-option-h'
                    min={0} onChange={this.onHChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      content = (
        <ItemBtn
          name={ItemsName.Embed}
          intl={this.props.intl}
          nls={embedNls}
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
