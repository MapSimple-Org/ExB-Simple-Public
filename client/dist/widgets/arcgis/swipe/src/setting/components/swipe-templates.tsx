/** @jsx jsx */
import {
  jsx,
  css,
  React,
  polished,
  hooks,
  focusElementInKeyboardMode
} from 'jimu-core'
import {
  defaultMessages as jimuUIMessages,
  Button,
  Tooltip,
  Icon,
  CollapsablePanel
} from 'jimu-ui'
import {
  SettingRow,
  SettingSection
} from 'jimu-ui/advanced/setting-components'
import { SwipeStyle } from '../../config'
import defaultMessages from '../translations/default'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

const { useState } = React

interface SwipeTemplatesProps {
  onPropertyChange: (name: string[], value: any) => void
  swipeStyle: SwipeStyle
  folderUrl: string
  resetButtonRef: React.RefObject<HTMLButtonElement>
}

const STYLE = css`
    &.start-con {
      & {
        height: ${polished.rem(64)};
        margin-top: ${polished.rem(16)};
      }
      .position-absolute-con, .position-relative-con {
        margin-left: ${polished.rem(-16)};
      }
      div{
        padding: ${polished.rem(16)};
        background: var(--ref-palette-neutral-400);
        left: 1rem;
        bottom: 0;
        width:'100%'
      }
    }
  `
const simpleHorizontalImage = require('../assets/templates-simple-horizontal.svg')
const simpleVerticalImage = require('../assets/templates-simple-vertical.svg')
const advancedHorizontalImage = require('../assets/templates-advanced-horizontal.svg')
const advancedVerticalImage = require('../assets/templates-advanced-vertical.svg')
const SwipeTemplates = (props: SwipeTemplatesProps) => {
  const { onPropertyChange } = props
  const [showSimple, setShowSimple] = useState(true)
  const [showAdvance, setShowAdvance] = useState(true)
  const [templateTypeClick, setTemplateTypeClick] = useState(props.swipeStyle)
  const [showSimpleHorizontalGif, setShowSimpleHorizontalGif] = useState(false)
  const [showSimpleVerticalGif, setShowSimpleVerticalGif] = useState(false)
  const [showAdvancedHorizontalGif, setShowAdvancedHorizontalGif] = useState(false)
  const [showAdvancedVerticalGif, setShowAdvancedVerticalGif] = useState(false)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const simpleHorizontalGif = `${props.folderUrl}dist/setting/assets/templates-simple-horizontal.gif`
  const simpleVerticalGif = `${props.folderUrl}dist/setting/assets/templates-simple-vertical.gif`
  const advancedHorizontalGif = `${props.folderUrl}dist/setting/assets/templates-advanced-horizontal.gif`
  const advancedVerticalGif = `${props.folderUrl}dist/setting/assets/templates-advanced-vertical.gif`

  const handleShowSimpleClick = () => {
    setShowSimple(!showSimple)
  }
  const handleShowAdvanceClick = () => {
    setShowAdvance(!showAdvance)
  }
  const SimpleTemplateTip = (
    <div className='w-100 d-flex'>
      <div className='text-truncate p-1'>
        {translate('simple')}
      </div>
      <Tooltip title={ translate('simpleTemplateTip')} showArrow placement='left' describeChild>
        <Button icon type='tertiary' size='sm' className='ml-1' aria-label={translate('simple') + ': ' + translate('simpleTemplateTip')}>
          <InfoOutlined />
        </Button>
      </Tooltip>
    </div>
  )
  const AdvancedTemplateTip = (
    <div className='w-100 d-flex'>
      <div className='text-truncate p-1'>
        {translate('advance')}
      </div>
      <Tooltip title={translate('advancedTemplateTip')} showArrow placement='left' describeChild>
        <Button icon type='tertiary' size='sm' className='ml-1' aria-label={translate('advance') + ': ' + translate('advancedTemplateTip')}>
          <InfoOutlined />
        </Button>
      </Tooltip>
    </div>
  )

  const handleTemplateTypeImageClick = evt => {
    const style = evt.currentTarget.dataset.value
    if (templateTypeClick === style) return
    setTemplateTypeClick(style)
  }

  const handleStartClick = evt => {
    onPropertyChange(['swipeStyle'], templateTypeClick)
    setTimeout(() => {
      focusElementInKeyboardMode(props.resetButtonRef.current)
    }, 50)
  }

  return (
    <SettingSection role='group' aria-label={translate('chooseTemplateTip')} title={translate('chooseTemplateTip')}>
      <CollapsablePanel
          label={SimpleTemplateTip}
          isOpen={showSimple}
          onRequestOpen={handleShowSimpleClick}
          onRequestClose={handleShowSimpleClick}
          role='radiogroup'
          aria-label={translate('simple')}
      >
        <div className='template-group w-100'>
        <div className='vertical-space' />
          <div className='d-flex justify-content-between w-100'>
            <Button
              data-value={SwipeStyle.SimpleHorizontal}
              onClick={handleTemplateTypeImageClick}
              type='tertiary'
              role='radio'
              className='style-margin-r'
              title={translate('simpleHorizontal')}
              aria-label={translate('simpleHorizontal')}
              aria-checked={templateTypeClick === SwipeStyle.SimpleHorizontal}
              onMouseEnter={() => { setShowSimpleHorizontalGif(true) }}
              onMouseLeave={() => { setShowSimpleHorizontalGif(false) }}
              onFocus={() => { setShowSimpleHorizontalGif(true) }}
              onBlur={() => { setShowSimpleHorizontalGif(false) }}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h ${templateTypeClick === SwipeStyle.SimpleHorizontal && 'active'}`}
                icon={showSimpleHorizontalGif ? simpleHorizontalGif : simpleHorizontalImage}
              />
            </Button>
            <Button
              data-value={SwipeStyle.SimpleVertical}
              onClick={handleTemplateTypeImageClick}
              type='tertiary'
              role='radio'
              className='style-margin-r'
              title={translate('simpleVertical')}
              aria-label={translate('simpleVertical')}
              aria-checked={templateTypeClick === SwipeStyle.SimpleVertical}
              onMouseEnter={() => { setShowSimpleVerticalGif(true) }}
              onMouseLeave={() => { setShowSimpleVerticalGif(false) }}
              onFocus={() => { setShowSimpleVerticalGif(true) }}
              onBlur={() => { setShowSimpleVerticalGif(false) }}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h ${templateTypeClick === SwipeStyle.SimpleVertical && 'active'}`}
                icon={showSimpleVerticalGif ? simpleVerticalGif : simpleVerticalImage}
              />
            </Button>
          </div>
        </div>
      </CollapsablePanel>
      <CollapsablePanel
          label={AdvancedTemplateTip}
          isOpen={showAdvance}
          onRequestOpen={handleShowAdvanceClick}
          onRequestClose={handleShowAdvanceClick}
          role='radiogroup'
          aria-label={translate('advance')}
          className='mt-2 mb-2'
      >
        <div className='template-group w-100 mt-1'>
        <div className='vertical-space' />
          <div className='d-flex justify-content-between w-100'>
          <Button
              data-value={SwipeStyle.AdvancedHorizontal}
              onClick={handleTemplateTypeImageClick}
              type='tertiary'
              role='radio'
              className='style-margin-r'
              title={translate('advancedHorizontal')}
              aria-label={translate('advancedHorizontal')}
              aria-checked={templateTypeClick === SwipeStyle.AdvancedHorizontal}
              onMouseEnter={() => { setShowAdvancedHorizontalGif(true) }}
              onMouseLeave={() => { setShowAdvancedHorizontalGif(false) }}
              onFocus={() => { setShowAdvancedHorizontalGif(true) }}
              onBlur={() => { setShowAdvancedHorizontalGif(false) }}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h ${templateTypeClick === SwipeStyle.AdvancedHorizontal && 'active'}`}
                icon={showAdvancedHorizontalGif ? advancedHorizontalGif : advancedHorizontalImage}
              />
            </Button>
            <Button
              data-value={SwipeStyle.AdvancedVertical}
              onClick={handleTemplateTypeImageClick}
              type='tertiary'
              role='radio'
              className='style-margin-r'
              title={translate('advancedVertical')}
              aria-label={translate('advancedVertical')}
              aria-checked={templateTypeClick === SwipeStyle.AdvancedVertical}
              onMouseEnter={() => { setShowAdvancedVerticalGif(true) }}
              onMouseLeave={() => { setShowAdvancedVerticalGif(false) }}
              onFocus={() => { setShowAdvancedVerticalGif(true) }}
              onBlur={() => { setShowAdvancedVerticalGif(false) }}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h ${templateTypeClick === SwipeStyle.AdvancedVertical && 'active'}`}
                icon={showAdvancedVerticalGif ? advancedVerticalGif : advancedVerticalImage}
              />
            </Button>
          </div>
        </div>
      </CollapsablePanel>
      <div className='vertical-space' />
      <SettingRow>
        <div className='start-con w-100' css={STYLE}>
          <div className='position-relative-con'>
            <Button
              className='w-100'
              type='primary'
              title={translate('start')}
              onClick={handleStartClick}
            >
              {translate('start')}
            </Button>
          </div>
        </div>
      </SettingRow>
    </SettingSection>
  )
}

export default SwipeTemplates
