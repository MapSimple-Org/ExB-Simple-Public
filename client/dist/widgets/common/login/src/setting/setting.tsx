/** @jsx jsx */
import {
  React, jsx, Immutable, type ImmutableArray, type IMIconResult,
  type IMExpression, type UseDataSource, expressionUtils, defaultMessages as jimuCoreMessages,
  type IconResult, type IMLinkParam, uuidv1, OpenTypes, urlUtils, getAppStore
} from 'jimu-core'
import { type AllWidgetSettingProps, builderAppSync } from 'jimu-for-builder'
import { SettingSection, SettingRow, LinkSelector, SidePopper } from 'jimu-ui/advanced/setting-components'
import { IconPicker } from 'jimu-ui/advanced/resource-selector'
import { TextInput, UrlInput, Button, Select, Tabs, Tab, Switch, defaultMessages as jimuUIMessages, defaultMessages as jimuUiDefaultMessages, Radio, Label, CollapsablePanel } from 'jimu-ui'

import { type IMConfig, IconPosition, type IMAdvanceStyleSettings, type LinkInfo } from '../config'
import { getStyle } from './style'
import AdvanceStyleSetting from './components/advance-style-setting'
import defaultMessages from './translations/default'
import { getDefaultConfig } from '../utils'
import { PlusCircleOutlined } from 'jimu-icons/outlined/editor/plus-circle'
import { CloseCircleOutlined } from 'jimu-icons/outlined/editor/close-circle'

const MESSAGES = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages, jimuUiDefaultMessages)

interface State {
  showSidePanel: boolean
  currentLinkInfo: LinkInfo
  validLinkLabel: boolean
  validLinkUrl: boolean
}

const enum SettingTabs {
  hover = 'HOVER',
  regular = 'REGULAR'
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, State> {
  linkLabelInputRef = React.createRef<HTMLInputElement>()
  linkUrlInputRef = React.createRef<HTMLInputElement>()

  constructor (props) {
    super(props)

    this.state = {
      showSidePanel: false,
      currentLinkInfo: null,
      validLinkLabel: false,
      validLinkUrl: false
    }
  }

  static getFullConfig (config) {
    return getDefaultConfig().merge(config, { deep: true })
  }

  //componentDidUpdate (prevProps: AllWidgetSettingProps<IMConfig>) {
  //}

  componentWillUnmount () {
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'isConfiguringHover', value: false })
  }

  onSettingLinkConfirmForAfterLogin = (linkResult: IMLinkParam) => {
    if (!linkResult) { return }
    const config = {
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'afterLoginLinkParam'], linkResult)
    }

    this.props.onSettingChange(config)
  }

  onSettingLinkConfirmForAfterLogout = (linkResult: IMLinkParam) => {
    if (!linkResult) { return }
    const config = {
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'afterLogoutLinkParam'], linkResult)
    }

    this.props.onSettingChange(config)
  }

  onIconResultChange = (result: IMIconResult) => {
    let config
    if (result) {
      const position = this.props.savedConfig.getIn(['functionConfig', 'icon', 'position']) || IconPosition.Left
      config = this.props.savedConfig.setIn(['functionConfig', 'icon', 'data'], result)
        .setIn(['functionConfig', 'icon', 'position'], position)
    } else {
      config = this.props.savedConfig.set('functionConfig', this.props.savedConfig.functionConfig.without('icon'))
        .setIn(['styleConfig', 'customStyle', 'regular'], this.props.savedConfig.getIn(['styleConfig', 'customStyle', 'regular'], Immutable({}) as IMAdvanceStyleSettings).without('iconProps'))
        .setIn(['styleConfig', 'customStyle', 'hover'], this.props.savedConfig.getIn(['styleConfig', 'customStyle', 'hover'], Immutable({}) as IMAdvanceStyleSettings).without('iconProps'))
    }
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  getWhetherHaveCustomStyle = (isRegular: boolean): boolean => {
    const status = isRegular ? 'regular' : 'hover'
    let style = this.props.config.getIn(['styleConfig', 'customStyle', status])
    if (style && style.iconProps) { // iconProps is not custom style, user can select icon before opening advanced style
      style = style.without('iconProps')
    }
    return !!(style && Object.keys(style).length > 0)
  }

  onRegularStyleChange = (style: IMAdvanceStyleSettings) => {
    const config = this.props.savedConfig.setIn(['styleConfig', 'customStyle', 'regular'], style)
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  onHoverStyleChange = (style: IMAdvanceStyleSettings) => {
    const config = this.props.savedConfig.setIn(['styleConfig', 'customStyle', 'hover'], style)
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  onDropdownRegularStyleChange = (style: IMAdvanceStyleSettings) => {
    const config = this.props.savedConfig.setIn(['styleConfig', 'customStyle', 'dropdownRegular'], style)
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  onDropdownHoverStyleChange = (style: IMAdvanceStyleSettings) => {
    const config = this.props.savedConfig.setIn(['styleConfig', 'customStyle', 'dropdownHover'], style)
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  onIconPositionChange = e => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'icon', 'position'], e.target.value)
    })
  }

  onAdvanceTabSelect = id => {
    const isConfiguringHover = id === SettingTabs.hover

    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'isConfiguringHover', value: isConfiguringHover })
  }

  mergeUseDataSources = (textExpression: IMExpression, tipExpression: IMExpression, linkSettingExpression: IMExpression, useDataSources: ImmutableArray<UseDataSource>, clearFieldsInCurrentUseDss: boolean = true): ImmutableArray<UseDataSource> => {
    const textDss = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(textExpression && textExpression.parts, useDataSources)
    const tipDss = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(tipExpression && tipExpression.parts, useDataSources)
    const linkSettingDss = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(linkSettingExpression && linkSettingExpression.parts, useDataSources)
    return this.mergeUseDataSourcesByDss(textDss, tipDss, linkSettingDss, useDataSources, clearFieldsInCurrentUseDss)
  }

  mergeUseDataSourcesByDss = (textUseDss: ImmutableArray<UseDataSource>, tipUseDss: ImmutableArray<UseDataSource>, linkSettingUseDss: ImmutableArray<UseDataSource>, useDataSources: ImmutableArray<UseDataSource>, clearFieldsInCurrentUseDss: boolean = true): ImmutableArray<UseDataSource> => {
    const useDataSourcesWithoutFields = clearFieldsInCurrentUseDss ? expressionUtils.getUseDataSourcesWithoutFields(useDataSources) : useDataSources
    let mergedUseDss = expressionUtils.mergeUseDataSources(useDataSourcesWithoutFields, textUseDss)
    mergedUseDss = expressionUtils.mergeUseDataSources(mergedUseDss, tipUseDss)
    mergedUseDss = expressionUtils.mergeUseDataSources(mergedUseDss, linkSettingUseDss)
    return mergedUseDss
  }

  getIsDataSourceUsed = () => {
    return !!this.props.useDataSourcesEnabled
  }

  showIconSetting = (): boolean => {
    return !!this.props.config.getIn(['functionConfig', 'icon'])
  }

  toggleUseCustom = () => {
    let config = this.props.savedConfig
    config = config.setIn(['styleConfig', 'useCustom'], !config.getIn(['styleConfig', 'useCustom']))
    if (config.getIn(['styleConfig', 'useCustom'])) {
      config = config.setIn(['styleConfig', 'customStyle', 'hover'], {})
      config = config.setIn(['styleConfig', 'customStyle', 'regular'], {})
    } else {
      config = config.set('styleConfig', config.styleConfig.without('customStyle'))
    }
    this.props.onSettingChange({
      id: this.props.id,
      config
    })
  }

  i18nMessage = (id: string, defaultMessage?: string) => {
    const { intl } = this.props
    return intl ? intl.formatMessage({ id: id, defaultMessage: MESSAGES[id] || id }) : ''
  }

  onUsePopupLoginChange = (usePopupLogin) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'usePopupLogin', ], usePopupLogin)
    })
  }

  onLoginModeChange = (useAdvanceLogin) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'loginOptions', 'useAdvanceLogin'], useAdvanceLogin)
    })
  }

  onLoginOptionsChange = (name, value) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'loginOptions', name], value)
    })
  }

  getBasicContent = (): React.ReactElement => {
    const usePopupLogin = this.props.config.functionConfig.usePopupLogin
    return (
      <SettingSection title={this.i18nMessage('loginType')}>
        <SettingRow>
          <Radio id="usePopupLogin" style={{ cursor: 'pointer' }} name="source-option"
            onChange={(e) => { this.onUsePopupLoginChange(true) }} checked={usePopupLogin}
          />
          <Label style={{ cursor: 'pointer' }} for="usePopupLogin" className="ml-2" >
            {this.i18nMessage('loginTypePopup')}
          </Label>
        </SettingRow>
        <SettingRow>
          <Radio id="redirectLogin" style={{ cursor: 'pointer' }} name="source-option"
            onChange={(e) => { this.onUsePopupLoginChange(false) }} checked={!usePopupLogin}
          />
          <Label style={{ cursor: 'pointer' }} for="redirectLogin" className="ml-2" >
            {this.i18nMessage('loginTypeRedirect')}
          </Label>
        </SettingRow>
      </SettingSection>
    )
  }

  getIconPickerContent = (): React.ReactElement => {
    const icon = this.props.config.functionConfig.icon?.data as IconResult || null
    const customIcons = this.props.config.functionConfig?.customIcons as unknown as IconResult[] || null
    const isPositionOpen = false //isTextSettingOpen && isIconSettingOpen
    return (
      <div className="mt-4">
        <SettingRow className='mb-5' label={this.props.intl.formatMessage({ id: 'icon', defaultMessage: jimuCoreMessages.icon })}>
          <IconPicker icon={icon} customIcons={customIcons} configurableOption={'none'} onChange={this.onIconResultChange}
            aria-label={this.props.intl.formatMessage({ id: 'icon', defaultMessage: jimuCoreMessages.icon })} setButtonUseColor={false}
          />
        </SettingRow>
        {isPositionOpen &&
          <SettingRow label={this.props.intl.formatMessage({ id: 'position', defaultMessage: jimuUIMessages.position })}>
            <div>
              <Select onChange={this.onIconPositionChange} size='sm'
                value={this.props.config.functionConfig && this.props.config.functionConfig.icon && this.props.config.functionConfig.icon.position}
                aria-label={this.props.intl.formatMessage({ id: 'position', defaultMessage: jimuUIMessages.position })}
              >
                {
                  Object.keys(IconPosition).map(p => <option value={IconPosition[p]} key={p}>
                    {this.props.intl.formatMessage({ id: p.toLowerCase(), defaultMessage: jimuUIMessages[p.toLowerCase()] })}
                  </option>)
                }
              </Select>
            </div>
          </SettingRow>
        }
      </div>
    )
  }

  getAppearanceContent = (): React.ReactElement => {
    const customStyle = this.props.config.styleConfig && this.props.config.styleConfig.customStyle
    const isTextSettingOpen = true
    const isIconSettingOpen = this.showIconSetting()
    return (
      <SettingSection className='px-14' aria-label={this.i18nMessage('Appearance')}>
        <CollapsablePanel className='' level={1} type='default' label={this.i18nMessage('Appearance')} role='group' defaultIsOpen={false} >
          <Tabs className='mt-4' fill type='pills' onChange={this.onAdvanceTabSelect} defaultValue={SettingTabs.regular}>
            <Tab className='tab-label' id={SettingTabs.regular} title={this.props.intl.formatMessage({ id: 'default', defaultMessage: jimuUIMessages.default })}>
              <AdvanceStyleSetting intl={this.props.intl} appTheme={this.props.theme2}
                style={customStyle && customStyle.regular} onChange={this.onRegularStyleChange}
                isTextSettingOpen={isTextSettingOpen} isIconSettingOpen={isIconSettingOpen}
              />
              <SettingRow className='dropdown-menu-label' label={this.props.intl.formatMessage({ id: 'abc', defaultMessage: 'Dropdown menu' })} />
              <AdvanceStyleSetting intl={this.props.intl} appTheme={this.props.theme2} disableBorderRadius
                style={customStyle && customStyle.dropdownRegular} onChange={this.onDropdownRegularStyleChange}
                isTextSettingOpen={isTextSettingOpen} isIconSettingOpen={false}
              />
            </Tab>
            <Tab className='tab-label' id={SettingTabs.hover} title={this.props.intl.formatMessage({ id: 'hover', defaultMessage: jimuUIMessages.hover })}>
              <AdvanceStyleSetting intl={this.props.intl} appTheme={this.props.theme2}
                style={customStyle && customStyle.hover} onChange={this.onHoverStyleChange}
                isTextSettingOpen={isTextSettingOpen} isIconSettingOpen={isIconSettingOpen}
              />
              <SettingRow className='dropdown-menu-label' label={this.props.intl.formatMessage({ id: 'abc', defaultMessage: 'Dropdown menu' })} />
              <AdvanceStyleSetting intl={this.props.intl} appTheme={this.props.theme2} disableBorderRadius
                style={customStyle && customStyle.dropdownHover} onChange={this.onDropdownHoverStyleChange}
                isTextSettingOpen={isTextSettingOpen} isIconSettingOpen={false}
              />
            </Tab>
          </Tabs>
        </CollapsablePanel>
      </SettingSection>
    )
  }

  getSwitchOptionItem = (labelKey: string, key, checked): React.ReactElement => {
    return (
      <SettingRow className='option-item switch-item' key={key} tag='label' label={this.i18nMessage(labelKey)} >
        <Switch
          className='option-switch'
          checked={checked}
          data-key={key}
          onChange={(evt) => { this.onLoginOptionsChange(key, evt.target.checked) }}
        />
      </SettingRow>
    )
  }

  getLinkOptionItemContent = (): React.ReactElement => {
    const links = this.props.config.functionConfig.loginOptions.links
    return (
      <div className='link-option-content my-4'>
        {links.map(linkInfo => {
          return (
            <SettingRow className='option-item link-item' key={linkInfo.id} tag='label' label={linkInfo.label/*this.i18nMessage('username')*/} >
              <Button className='delete-link-button d-none' type='tertiary' size='sm' icon={false} onClick={() => { this.onShowSidePanel(linkInfo) }} >
                <CloseCircleOutlined />
              </Button>
              <Button className='delete-link-button' type='tertiary' size='sm' icon={false} onClick={() => { this.onDeleteLinkInfo(linkInfo.id) }} >
                <CloseCircleOutlined className='mx-0' />
              </Button>
            </SettingRow>
          )
        })}
      </div>
    )
  }

  //getFocusNodeForBackSidePopper = () => {
  //}

  onShowSidePanel = (currentLinkInfo?: LinkInfo) => {
    this.setState({
      showSidePanel: true,
      currentLinkInfo
    })
  }

  onCloseSidePanel = () => {
    this.setState({
      showSidePanel: false,
      validLinkLabel: false,
      validLinkUrl: false,
      currentLinkInfo: null
    })
  }

  checkLinkLabel = (text) => {
    if (text.trim()) {
      this.setState({validLinkLabel: true})
      if (this.state.currentLinkInfo?.url) {
        this.setState({validLinkUrl: true})
      }
      return {valid: true}
    } else {
      this.setState({validLinkLabel: false})
      return {valid: false}
    }
  }

  checkLinkUrl = (text) => {
    if (text) {
      this.setState({validLinkUrl: true})
      if (this.state.currentLinkInfo?.label) {
        this.setState({validLinkLabel: true})
      }
    } else {
      this.setState({validLinkUrl: false})
    }
    return {valid: true}
  }

  onAddLinkInfo = () => {
    const label = this.linkLabelInputRef.current.value
    const url = this.linkUrlInputRef.current.value
    const links = this.props.savedConfig.getIn(['functionConfig', 'loginOptions', 'links'])?.asMutable({deep: true}) || []
    let newLinks
    if (this.state.currentLinkInfo) {
      newLinks = links.map(linkInfo => {
        if (this.state.currentLinkInfo.id === linkInfo.id) {
          return {
            id: linkInfo.id,
            label,
            url
          }
        } else {
          return linkInfo
        }
      })
    } else {
      links.push({
        id: uuidv1(),
        label,
        url
      })
      newLinks = links
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'loginOptions', 'links'], newLinks)
    })
    this.onCloseSidePanel()
  }

  onDeleteLinkInfo = (linkInfoId: string) => {
    const links = this.props.savedConfig.getIn(['functionConfig', 'loginOptions', 'links'])?.asMutable({deep: true}) || []
    const newLinks = links.filter(linkInfo => linkInfo.id !== linkInfoId)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['functionConfig', 'loginOptions', 'links'], newLinks)
    })
  }

  getLinkOptionSideContent = () => {
    return (
      <SidePopper
        position='right'
        title={this.i18nMessage('setLink')}
        isOpen={this.state.showSidePanel}
        toggle={this.onCloseSidePanel}
        trigger={null}
        backToFocusNode={null/*this.getFocusNodeForBackSidePopper()*/}
      >
        <SettingSection>
          <label className='second-header'>{this.i18nMessage('label')}</label>
          <TextInput className="w-100 mb-4" placeholder={this.i18nMessage('label')} size='sm'
           aria-label={this.i18nMessage('label')}
           checkValidityOnAccept={this.checkLinkLabel}
           defaultValue={this.state.currentLinkInfo?.label}
           ref={this.linkLabelInputRef}/>

          <label className='second-header'>{this.i18nMessage('url')}</label>
          <UrlInput
            className='mb-4'
            schemes={['https']}
            height={80}
            placeholder={this.i18nMessage('url')}
            checkValidityOnAccept={this.checkLinkUrl}
            aria-label={this.i18nMessage('url')}
            defaultValue={this.state.currentLinkInfo?.url}
            ref={this.linkUrlInputRef}/>
          <Button className='add-url-button w-100 mt-2' type='primary' size='sm' icon={false} disabled={!this.state.validLinkLabel || !this.state.validLinkUrl} onClick={this.onAddLinkInfo} >
            {this.i18nMessage('ok')}
          </Button>
        </SettingSection>
      </SidePopper>
    )
  }

  getLinkOptionContent = () => {
    return (
      <div>
        {this.getLinkOptionItemContent()}
        <SettingRow tag='div' >
          <Button className='add-link-button' type='tertiary' size='sm' icon={false} onClick={() => { this.onShowSidePanel() }} >
            <PlusCircleOutlined />
              {this.i18nMessage('addLinkOption')}
          </Button>
        </SettingRow>
        {this.getLinkOptionSideContent()}
      </div>
    )
  }

  getOptions = (): React.ReactElement => {
    return (<div className='mt-4'>
      {this.getSwitchOptionItem('userNameOption', 'username', this.props.config?.functionConfig.loginOptions.username)}
      {this.getSwitchOptionItem('userAccountAvatarOption', 'userAvatar', this.props.config?.functionConfig.loginOptions.userAvatar)}
      {this.getSwitchOptionItem('userProfileOption', 'userProfile', this.props.config?.functionConfig.loginOptions.userProfile)}
      {this.getSwitchOptionItem('userSettingOption', 'userSetting', this.props.config?.functionConfig.loginOptions.userSetting)}
      {/*this.getSwitchOptionItem('userExperiencesOption', 'userExperiences', this.props.config?.functionConfig.loginOptions.userExperiences)*/}
      {this.getSwitchOptionItem('resourceCredentialManagerOption', 'resourceCredentialList', this.props.config?.functionConfig.loginOptions.resourceCredentialList)}
      {this.getLinkOptionContent()}
      </div>)
  }

  getOptionsContent = (): React.ReactElement => {
    const useAdvanceLogin = this.props.config.functionConfig.loginOptions.useAdvanceLogin
    const afterLoginLinkParam = this.props.config.functionConfig.afterLoginLinkParam
    const redirectUrlAfterLogin = afterLoginLinkParam && urlUtils.getHrefFromLinkTo(afterLoginLinkParam, getAppStore().getState().queryObject)
    const afterLogoutLinkParam = this.props.config.functionConfig.afterLogoutLinkParam
    const redirectUrlAfterLogout = afterLogoutLinkParam && urlUtils.getHrefFromLinkTo(afterLogoutLinkParam, getAppStore().getState().queryObject)
    return (
      <SettingSection title={this.i18nMessage('postSignInSetting')}>
        <label className='second-header mt-4'>{this.i18nMessage('redirectAfterLogin')}</label>
        <SettingRow role='group' aria-label={this.props.intl.formatMessage({ id: 'setLink', defaultMessage: jimuUIMessages.setLink })} >
          <LinkSelector
            onSettingConfirm={this.onSettingLinkConfirmForAfterLogin}
            linkParam={afterLoginLinkParam}
            widgetId={this.props.id}
          />
        </SettingRow>
        {redirectUrlAfterLogin && <SettingRow className='redirect-url mt-1' label={`${window.location.origin}${redirectUrlAfterLogin}`} truncateLabel />}

        <label className='second-header mt-4'>{this.i18nMessage('redirectAfterLogout')}</label>
        <SettingRow role='group' aria-label={this.props.intl.formatMessage({ id: 'setLink', defaultMessage: jimuUIMessages.setLink })} >
          <LinkSelector
            onSettingConfirm={this.onSettingLinkConfirmForAfterLogout}
            openTypes={Immutable([OpenTypes.CurrentWindow])}
            linkParam={afterLogoutLinkParam}
            widgetId={this.props.id}
          />
        </SettingRow>
        {redirectUrlAfterLogout && <SettingRow className='redirect-url mt-1' label={`${window.location.origin}${redirectUrlAfterLogout}`} truncateLabel />}

        <SettingRow className='mt-6' label={this.i18nMessage('onSignInButtonClick')} truncateLabel />
          <SettingRow>
            <Radio id="simpleLogin" style={{ cursor: 'pointer' }} name="source-option"
              onChange={(e) => { this.onLoginModeChange(false) }} checked={!useAdvanceLogin}
            />
            <Label style={{ cursor: 'pointer' }} for="simpleLogin" className="ml-2" >
              {this.i18nMessage('afterLoginSimple')}
            </Label>
          </SettingRow>
          <SettingRow>
            <Radio id="advanceLogin" style={{ cursor: 'pointer' }} name="source-option"
              onChange={(e) => { this.onLoginModeChange(true) }} checked={useAdvanceLogin}
            />
            <Label style={{ cursor: 'pointer' }} for="advanceLogin" className="ml-2" >
              {this.i18nMessage('afterLoginAdvanced')}
            </Label>
          </SettingRow>
          {/*useAdvanceLogin && <CollapsablePanel className='mt-4' label={this.i18nMessage('customizeOptions')} aria-label={this.i18nMessage('customizeOptions')} role='group' defaultIsOpen={true}></CollapsablePanel>*/}
          {useAdvanceLogin && this.getOptions()}
      </SettingSection>
    )
  }

  render () {
    return (
      <div css={getStyle(this.props.theme)}>
        <div className="jimu-widget login-widget-setting">
          <div>
            {this.getBasicContent()}
            {this.getOptionsContent()}
            {this.getAppearanceContent()}
          </div>
        </div>
      </div>
    )
  }
}
