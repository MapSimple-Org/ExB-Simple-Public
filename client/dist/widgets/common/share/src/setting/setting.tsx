/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx, Immutable, type ImmutableArray, defaultMessages, focusElementInKeyboardMode } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { SettingSection, SettingRow, DirectionSelector, SidePopper } from 'jimu-ui/advanced/setting-components'
import { Switch, TextInput, Select, defaultMessages as commonMessages } from 'jimu-ui'
import { type IMConfig, UiMode, type Item, InlineDirection, BtnIconSize, IconColorMode, type emailContent } from '../config'
import { getStyle } from './style'
import { ArrangementSelector } from './components/arrangement-selector'
import { ItemsSelector } from './components/items-selector'
import { IconSelector } from './components/icon-selector'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import nls from './translations/default'
import EmailContent from './components/email-content'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const [showEmailContent, setShowEmailContent] = React.useState(false)
  const emailSettingBtn = React.useRef<HTMLButtonElement>(null)
  const emailSettingTitle = props.intl.formatMessage({ id: 'email', defaultMessage: commonMessages.email })
  // 1
  const onUIModeChanged = (uiMode: UiMode) => {
    //triggerLayoutItemSizeChange({ mode: uiMode })
    props.onSettingChange({
      id: props.id,
      config: props.config.set('uiMode', uiMode)
    })

    getAppConfigAction().editWidgetProperty(props.id, 'offPanel', true).exec()
  }

  // 2.1. popup mode
  // onIconColorChange = (color) => {
  //   props.onSettingChange({
  //     id: props.id,
  //     config: props.config.setIn(['popup', 'icon', 'color'], color)
  //   });
  // }
  // onBtnIconSizeChange = (e) => {
  //   var val = e.target.value;
  //   let popup = Immutable(props.config.popup);
  //   popup = popup.setIn(['icon', 'size'], val);

  //   props.onSettingChange({
  //     id: props.id,
  //     config: props.config.set('popup', popup)
  //   });
  // }
  const onIconChange = (icon) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['popup', 'icon'], icon)
    })
  }

  const onPopupItemsChange = (items: ImmutableArray<Item>) => {
    let popupSetting = Immutable(props.config.popup)
    popupSetting = popupSetting.set('items', items)

    props.onSettingChange({
      id: props.id,
      config: props.config.set('popup', popupSetting)
    })
  }

  const onToolTipConfigChange = (e) => {
    const val = e.target.value
    let popupSetting = Immutable(props.config.popup)
    popupSetting = popupSetting.set('tooltip', val)

    props.onSettingChange({
      id: props.id,
      config: props.config.set('popup', popupSetting)
    })
  }
  // 2.1. popup mode

  // 2.2 inline mode
  const onInlineItemsChange = (items: ImmutableArray<Item>) => {
    let inlineSetting = Immutable(props.config.inline)
    inlineSetting = inlineSetting.set('items', items)

    props.onSettingChange({
      id: props.id,
      config: props.config.set('inline', inlineSetting)
    })
  }

  const onInlineDirChange = (isVertical: boolean) => {
    const dir = isVertical ? InlineDirection.Vertical : InlineDirection.Horizontal
    //triggerLayoutItemSizeChange({ dir: dir })

    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['inline', 'design', 'direction'], dir)
    })
  }

  // const onIconStyleChange = (radius) => {
  //   props.onSettingChange({
  //     id: props.id,
  //     config: props.config.setIn(['inline', 'design', 'btnRad'], radius)
  //   })
  // }

  const onHideLabelChange = (e) => {
    const isChecked = e.target.checked
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['inline', 'design', 'hideLabel'], !isChecked)
    })
  }

  const onLabelColorChange = (color: string) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['inline', 'design', 'labelColor'], color)
    })
  }

  // onInlineBtnColorChange = (color) => {
  //   props.onSettingChange({
  //     id: props.id,
  //     config: props.config.setIn(['inline', 'design', 'btnColor'], color)
  //   });
  // }
  // onInlineIconColorChange = (color) => {
  //   props.onSettingChange({
  //     id: props.id,
  //     config: props.config.setIn(['inline', 'design', 'iconColor'], color)
  //   });
  // }
  const onInlineIconColorChange = (e) => {
    const val = e.target.value
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['inline', 'design', 'iconColor'], val)
    })
  }

  const onInlineSizeChange = (e) => {
    const val = e.target.value
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['inline', 'design', 'size'], val)
    })
  }

  const handleEmailCustomizeChange = (email: emailContent) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['emailContent'], email)
    })
  }
  // 2.2 inline mode

  // for render
  // 2.1
  const renderPopupModeSetting = () => {
    let subSettingUI = null

    const { theme, intl } = props
    const items = props.config.popup.items

    const shareOption = props.intl.formatMessage({ id: 'shareOption', defaultMessage: nls.shareOption })
    const tooltip = props.intl.formatMessage({ id: 'tooltip', defaultMessage: commonMessages.tooltip })

    subSettingUI = (
      <React.Fragment>
        {/* in controller, hide Popup mode icon-selector ,#21682 */}
        {!props.controllerWidgetId && <SettingSection>
          <IconSelector
            popupIcon={props.config.popup.icon}
            onIconChange={onIconChange}
          ></IconSelector>
        </SettingSection>}

        <SettingSection title={shareOption} aria-label={shareOption} role='group'>
          <ItemsSelector
            items={items}
            theme={theme} intl={intl} title={shareOption}
            uiMode={props.config.uiMode} onItemsChange={onPopupItemsChange}
            onEmailContentClick={(target: EventTarget) => {
              setShowEmailContent(true)
              emailSettingBtn.current = target as HTMLButtonElement
            }}
          />
        </SettingSection>

        {/* in controller, hide Popup mode icon-selector ,#21682 */}
        {!props.controllerWidgetId && <SettingSection>
          {/* <SettingRow label={tooltip}>
            <TextInput value={props.config.popup.tooltip} onChange={onToolTipConfigChange} className="w-50"/>
          </SettingRow> */}
          <SettingRow label={tooltip} />
          <SettingRow>
            <TextInput className='w-100' aria-label={tooltip} size='sm'
              value={props.config.popup.tooltip} onChange={onToolTipConfigChange} />
          </SettingRow>
        </SettingSection>}
      </React.Fragment>
    )

    return subSettingUI
  }

  // 2.2
  const renderInlineModeSetting = () => {
    let subSettingUI = null
    const isVertical = (props.config.inline.design.direction === InlineDirection.Vertical)

    const { theme, intl } = props
    const items = props.config.inline.items

    const shareOption = props.intl.formatMessage({ id: 'shareOption', defaultMessage: nls.shareOption })
    const design = props.intl.formatMessage({ id: 'design', defaultMessage: nls.design })
    const direction = props.intl.formatMessage({ id: 'direction', defaultMessage: commonMessages.direction })

    const showMedia = props.intl.formatMessage({ id: 'showMedia', defaultMessage: nls.showMedia })
    const size = props.intl.formatMessage({ id: 'size', defaultMessage: nls.size })
    const small = props.intl.formatMessage({ id: 'small', defaultMessage: defaultMessages.small })
    const medium = props.intl.formatMessage({ id: 'medium', defaultMessage: defaultMessages.medium })
    const large = props.intl.formatMessage({ id: 'large', defaultMessage: defaultMessages.large })

    const iconColor = props.intl.formatMessage({ id: 'iconColor', defaultMessage: nls.iconColor })
    const defaultStr = props.intl.formatMessage({ id: 'default', defaultMessage: commonMessages.default })
    const white = props.intl.formatMessage({ id: 'white', defaultMessage: nls.white })
    const black = props.intl.formatMessage({ id: 'black', defaultMessage: nls.black })
    // var btnRad = props.config.inline.design.btnRad;
    // var rad0 = IconRadius.Rad00,
    //   rad1 = IconRadius.Rad20,
    //   rad2 = IconRadius.Rad50;
    const font = props.intl.formatMessage({ id: 'font', defaultMessage: commonMessages.font })

    subSettingUI = (
      <React.Fragment>
        <SettingSection title={shareOption} aria-label={shareOption} role='group'>
          <ItemsSelector
            items={items}
            theme={theme} intl={intl} title={shareOption}
            uiMode={props.config.uiMode} onItemsChange={onInlineItemsChange}
            onEmailContentClick={(target: EventTarget) => {
              setShowEmailContent(true)
              emailSettingBtn.current = target as HTMLButtonElement
            }}
          />
        </SettingSection>

        <SettingSection title={design} aria-label={design} role='group'>
          <SettingRow label={direction}>
            <DirectionSelector vertical={isVertical} onChange={onInlineDirChange} aria-label={direction}/>
          </SettingRow>

          <SettingRow label={iconColor}>
            <Select value={(props.config.inline.design.iconColor || IconColorMode.Default)} onChange={onInlineIconColorChange}
              size='sm' className='w-50' aria-label={iconColor}>
              <option value={IconColorMode.Default}>{defaultStr}</option>
              <option value={IconColorMode.White}>{white}</option>
              <option value={IconColorMode.Black}>{black}</option>
            </Select>
          </SettingRow>

          <SettingRow label={size}>
            <Select value={props.config.inline.design.size} onChange={onInlineSizeChange}
              size='sm' className='w-50' aria-label={size}>
              <option value={BtnIconSize.Small}>{small}</option>
              <option value={BtnIconSize.Medium}>{medium}</option>
              <option value={BtnIconSize.Large}>{large}</option>
            </Select>
          </SettingRow>
          {/*
        <SettingRow label={'Icon style'}>
          <RadiusSelector radius={rad0} btnRad={btnRad} themeVal={theme} onClick={() => onIconStyleChange(rad0)} className="pr-4"></RadiusSelector>
          <RadiusSelector radius={rad1} btnRad={btnRad} themeVal={theme} onClick={() => onIconStyleChange(rad1)} className="pr-4"></RadiusSelector>
          <RadiusSelector radius={rad2} btnRad={btnRad} themeVal={theme} onClick={() => onIconStyleChange(rad2)}></RadiusSelector>
        </SettingRow>
        */}
          <SettingRow tag='label' label={showMedia}>
            <Switch checked={!props.config.inline.design.hideLabel} onChange={onHideLabelChange} />
          </SettingRow>
          {!props.config.inline.design.hideLabel &&
            <SettingRow label={font}>
              <ThemeColorPicker className='box-color ml-auto' specificTheme={props.theme2} aria-label={font}
                value={props.config.inline.design.labelColor} onChange={onLabelColorChange} />
            </SettingRow>
          }
          {/*
        <SettingRow label={'Button color'}>
          <DefaultOrColorPicker className="d-flex" color={props.config.inline.design.btnColor} onColorChange={onInlineBtnColorChange} />
        </SettingRow>
        <SettingRow label={'Icon color'}>
          <DefaultOrColorPicker className="d-flex" color={props.config.inline.design.iconColor} onColorChange={onInlineIconColorChange} />
        </SettingRow>
        */}
        </SettingSection>
      </React.Fragment>
    )

    return subSettingUI
  }

  // 2.3
  // const renderSlideModeSetting = () => {
  //   let subSettingUI = null
  //   const { theme, intl } = props
  //   const items = props.config.popup.items
  //   const shareOption = props.intl.formatMessage({ id: 'shareOption', defaultMessage: nls.shareOption })

  //   subSettingUI = (
  //     <React.Fragment>
  //       <SettingSection title={shareOption}>
  //         <ItemsSelector
  //           items={items}
  //           theme={theme} intl={intl} title={shareOption}
  //           uiMode={props.config.uiMode} onItemsChange={onPopupItemsChange}
  //         />
  //       </SettingSection>
  //     </React.Fragment>
  //   )

  //   return subSettingUI
  // }

  const renderEmailContent = () => {
    let subSettingUI = null
    subSettingUI = (
      <React.Fragment>
        <EmailContent
          intl={props.intl}
          theme={props.theme}
          email={props.config.emailContent || {}}
          handleCustomizeChange={handleEmailCustomizeChange}
        >
        </EmailContent>
      </React.Fragment>
    )
    return subSettingUI
  }

  const handleCloseEmailSetting = () => {
    setShowEmailContent(false)
    focusElementInKeyboardMode(emailSettingBtn.current)
  }


  let subSettingUI = null
  const uiMode = props.config.uiMode
  if (uiMode === UiMode.Popup) {
    subSettingUI = renderPopupModeSetting()
  } else if (uiMode === UiMode.Inline) {
    subSettingUI = renderInlineModeSetting()
  } /* else if (uiMode === UiMode.Slide) {
      subSettingUI = renderSlideModeSetting();
    } */
  const emailContentUI = renderEmailContent()
  return (
    <div css={getStyle(props.theme)} className='widget-setting-menu jimu-widget-setting'>
      {/* 1. share type */}
      <ArrangementSelector
        uiMode={uiMode}
        onChanged={onUIModeChanged}
        id={props.id}
      ></ArrangementSelector>

      {/* 2. subSetting */}
      {subSettingUI}
      <SidePopper position='right' isOpen={showEmailContent} toggle={handleCloseEmailSetting} trigger={emailSettingBtn.current} title={emailSettingTitle} >
        {emailContentUI}
      </SidePopper>
    </div>
  )
}

export default Setting

/* for image selector
  <SettingRow>
    <div className="d-flex justify-content-between w-100 align-items-center">
      <label className="m-0">source</label>
      <div style={{ width: '70px' }} className="uploadFileName"
        title={fileName ? fileName : "noneSource"}>
        {fileName ? fileName : "noneSource"}
      </div>
      <div style={{ width: '60px' }}><ImageSelector className="text-dark d-flex justify-content-center btn-browse" color="secondary"
        widgetId={props.id} label="Set" size="sm"
        onChange={onImageResourceChange} imageParam={props.config.imageParam} />
      </div>
    </div>
  </SettingRow>
*/
// onImageResourceChange = (imageParam: ImageParam) => {
//   let tempImageParam: ImageParam = imageParam;
//   if (!tempImageParam) {
//     tempImageParam = {};
//   }

//   let config = Immutable(props.config);
//   if (config.imageParam && config.imageParam.cropParam) {
//     tempImageParam.cropParam = {
//       svgViewBox: config.imageParam.cropParam.svgViewBox,
//       svgPath: config.imageParam.cropParam.svgPath,
//       cropShape: config.imageParam.cropParam.cropShape,
//     }
//   }
//   //config = config.set('imageParam', tempImageParam);

//   props.onSettingChange({
//     //widgetId: props.id,
//     id: props.id,
//     config: props.config.set('imageParam', tempImageParam)
//   });
// }
