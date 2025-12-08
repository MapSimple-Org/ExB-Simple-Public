/** @jsx jsx */
import { React, jsx, SessionManager, SignInErrorCode, getAppStore, PermissionList, type IMThemeVariables, AppMode, Immutable } from 'jimu-core'
import { Popper, Icon, defaultMessages as jimuUiDefaultMessages, DropdownItem, type StyleState, Paper } from 'jimu-ui'
import { getStyle, getStyleState } from '../style'
import { styled } from 'jimu-theme'
import type { IMConfig, IMWidgetState} from '../../config'
import { type ExtraProps, signOut, switchAccount, getThumbnail } from '../../utils'
import type { IntlShape } from 'react-intl'
import defaultMessages from '../translations/default'

const IconAccount = require('../assets/default-user.svg')

export interface LoginDropDownProps extends ExtraProps {
  config: IMConfig
  widgetId: string
  intl: IntlShape
  theme: IMThemeVariables
  open: boolean
  buttonRef: HTMLButtonElement
}

const HeaderItem = ({config}): React.ReactElement => {
  const { useMemo } = React
  const session = SessionManager.getInstance().getMainSession()
  const user = getAppStore().getState().user
  const loginOptions = config.functionConfig.loginOptions
  const userThumbnail = getThumbnail()

  const getIconContent = useMemo(() => {
    if (userThumbnail) {
      return <img src={userThumbnail} width={50} height={50} style={{ borderRadius: '50%' }} className='d-block float-left header-login' />
    } else {
      return <Icon icon={IconAccount} width={50} height={50} className='d-block float-left header-login' />
    }
  }, [userThumbnail])

  return ( (loginOptions.userAvatar || loginOptions.username) &&
    <div>
      <DropdownItem className='login-dropdown-item header-item p-4' tag='div'>
        <div className='d-flex user-info-content'>
          {loginOptions.userAvatar && <div className='header-portrait'>
            {getIconContent}
          </div>}
          <div className='user-name-content flex-grow-1'>
            {loginOptions.username && session && <div className='user-name main-title' title={user?.firstName}>{user?.firstName}</div>}
            {loginOptions.username && session && <div className='user-name sub-title' title={user?.username}>{user?.username}</div>}
          </div>
        </div>
      </DropdownItem>
      <DropdownItem className='login-dropdown-item divider-item' divider tag='div' />
    </div>
  )
}

const FooterItem = ({ intl, config, appMode }): React.ReactElement => {
  const { useCallback } = React

  const onSwitchAccountClick = useCallback(() => {
    switchAccount()
  }, [])
  const onSignOutClick = useCallback(() => {
    signOut(config.functionConfig.afterLogoutLinkParam)
  }, [config.functionConfig.afterLogoutLinkParam])

  const switchAccountTitle = intl.formatMessage({ id: 'switchAccount', defaultMessage: jimuUiDefaultMessages.switchAccount})
  const signOutTitle = intl.formatMessage({ id: 'signOut', defaultMessage: jimuUiDefaultMessages.signOut})

  return (
    <div>
      <DropdownItem title={switchAccountTitle} className='login-dropdown-item link-item w-100 h-100 d-flex'
        onClick={onSwitchAccountClick}
        tag='button' role='menuitem' disabled={appMode === AppMode.Design}>
        <div className='text-truncate'>{switchAccountTitle}</div>
      </DropdownItem>
      <DropdownItem title={signOutTitle} className='login-dropdown-item link-item w-100 h-100 d-flex'
        onClick={onSignOutClick}
        tag='button' role='menuitem' disabled={appMode === AppMode.Design}>
        <div className='text-truncate'>{signOutTitle}</div>
      </DropdownItem>
    </div>
  )
}

const LinkItem = ({title, url, appMode}): React.ReactElement => {
  return (
    <DropdownItem
      title={title}
      tag='a'
      className='login-dropdown-item link-item link-con w-100 h-100 d-flex'
      href={url}
      target='_blank'
      role='menuitem'
      disabled={appMode === AppMode.Design}
    >
      <div className='text-truncate'>{title}</div>
    </DropdownItem>
  )
}

const LoginPopper = styled(Popper)<StyleState<any>>(({ theme, styleState }) => {
  // unset the default color and background of surface in style.ts, and use default color and background for style state,
  // otherwise style state cannot cover the surface of popper.
  //const regularFontSize = styleState?.dropdownRegularStyle?.fontSize
  //const defaultRegularMainTitle = {fontSize: regularFontSize || '16px'}
  //const defaultRegularStyle = {backgroundColor: 'var(--sys-color-surface-paper)', color: 'var(--sys-color-surface-paperText)', fontSize: '14px', '.main-title': defaultRegularMainTitle}
  //const hoverFontSize = styleState?.dropdownHoverStyle?.fontSize
  //const defaultHoverMainTitle = {fontSize: hoverFontSize || regularFontSize}
  //const defaultHoverStyle = {'.main-title': defaultHoverMainTitle}

  const regularFontSize = styleState?.dropdownRegularStyle?.fontSize
  const defaultRegularMainTitle = {fontSize: regularFontSize || 'var(--sys-typography-title1-font-size)'}
  const defaultRegularStyle = {fontSize: 'var(--sys-typography-label1-font-size)', '.main-title': defaultRegularMainTitle}

  const dropdownRegularStyle = styleState?.dropdownRegularStyle
  const dropdownHoverStyle = styleState?.dropdownHoverStyle
  const footerButtonRegularStyle = {
    fontWeight: dropdownRegularStyle?.fontWeight ? dropdownRegularStyle.fontWeight : '',
    fontStyle: dropdownRegularStyle?.fontStyle ? dropdownRegularStyle.fontStyle : ''
  }
  const footerButtonHoverStyle = {
    fontWeight: dropdownHoverStyle?.fontWeight ? dropdownHoverStyle.fontWeight : '',
    fontStyle: dropdownHoverStyle?.fontStyle ? dropdownHoverStyle.fontStyle : ''
  }
  const regularStyle = {...defaultRegularStyle, ...styleState?.dropdownRegularStyle, ...{'button': footerButtonRegularStyle}}
  const hoverStyle = {...(styleState?.dropdownHoverStyle || {}), ...{'button': footerButtonHoverStyle}}
  return {
    ...regularStyle,
    ...{'&:hover': hoverStyle}
  }
  //return {
  //  ...styleState?.dropdownRegularStyle,
  //  ...(styleState?.dropdownHoverStyle && {'&:hover': styleState?.dropdownHoverStyle || {}})
  //}
  //return {
  //  ...styleState.dropdownRegularStyle,
  //  ...(styleState.dropdownHoverStyle && {'.link-item': {'&:hover': styleState.dropdownHoverStyle}}),
  //}
})

const LoginDropDown = (props: LoginDropDownProps ): React.ReactElement => {
  const { useMemo, useState, useEffect, useCallback } = React
  const { config, theme, intl, widgetId, active, appMode, noPermissionResourceChangedFlag, buttonRef } = props
  const styleConfig = config.styleConfig
  const loginOptions = config.functionConfig.loginOptions
  const useAdvanceLogin = loginOptions.useAdvanceLogin
  const appState = getAppStore().getState()
  const widgetState: IMWidgetState = appState.widgetsState[widgetId] || Immutable({})
  const isConfiguringHover = widgetState.isConfiguringHover

  const [open, setOpen] = useState(false)
  const linkInfosContent = useMemo(() => {
    let linkInfos = []
    loginOptions.userProfile && linkInfos.push({id:'my_profile', label: intl.formatMessage({ id: 'myProfile', defaultMessage: jimuUiDefaultMessages.myProfile}), url: `${appState.portalUrl}/home/user.html`})
    loginOptions.userSetting && linkInfos.push({id:'user_setting', label: intl.formatMessage({ id: 'mySettings', defaultMessage: jimuUiDefaultMessages.mySettings}), url: `${appState.portalUrl}/home/user.html#settings`})
    //loginOptions.userExperiences && linkInfos.push({id:'user_experience', label: intl.formatMessage({ id: 'myExperiences', defaultMessage: jimuUiDefaultMessages.myExperiences}), url: window.location.origin})
    linkInfos = linkInfos.concat(loginOptions.links)
    return (
      <div>
        {linkInfos.map(linkInfo => (<LinkItem key={linkInfo.id} title={linkInfo.label} url={linkInfo.url} appMode={appMode} />))}
        {(linkInfos.length > 0) && <DropdownItem className='login-dropdown-item divider-item' divider tag='div' />}
      </div>
    )
  }, [loginOptions, appMode, intl, appState.portalUrl])

  const getPermissionListContent = () => {
    const noPermissionResourceInfoList = {...SessionManager.getInstance().getNoPermissionResourceInfoList()}
    if (window.jimuConfig.isInBuilder && Object.entries(noPermissionResourceInfoList).length === 0 ) {
      // mocks a no permission resource info
      noPermissionResourceInfoList['https://sample.server.com/arcgis/rest/services/service1/FeatureServer'] = {signInErrorCode: SignInErrorCode.SignInCanceled}
    }
    const listTitle = intl.formatMessage({ id: 'restrictedResources', defaultMessage: defaultMessages.restrictedResources})
    return (Object.entries(noPermissionResourceInfoList).length > 0 && loginOptions.resourceCredentialList &&
      <div className='p-1'>
        <div className='permission-list-title text-truncate' aria-label={listTitle}>{listTitle}</div>
        <PermissionList
          noPermissionResourceChangedFlag={noPermissionResourceChangedFlag}
          noPermissionResourceInfoList={noPermissionResourceInfoList}
          disableOperation={window.jimuConfig.isInBuilder}
          theme={theme} intl={intl} allowLogout />
        <DropdownItem className='login-dropdown-item divider-item' divider tag='div' />
      </div>
    )
  }

  const styleStateResult = useMemo(() => {
    return styleConfig.customStyle && getStyleState(styleConfig.customStyle, widgetId, active, appMode, isConfiguringHover) || {}
  }, [styleConfig.customStyle, widgetId, active, appMode, isConfiguringHover])

  useEffect(() => {
    if (useAdvanceLogin && window.jimuConfig.isInBuilder) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [useAdvanceLogin])

  useEffect(() => {
    if (props.open !== null) {
      setOpen((e) => !e)
    }
  }, [props.open])

  const onPopperToggle = useCallback(() => {
    if (getAppStore().getState().appRuntimeInfo.appMode === AppMode.Run) {
      setOpen(false)
    }
  }, [])

  return (
    <LoginPopper
      autoUpdate
      open={open}
      reference={buttonRef}
      css={getStyle(theme)}
      styleState={styleStateResult}
      toggle={onPopperToggle}
      flipOptions
      placement='bottom-end'>

      <Paper className='login-dropdown-box'>
        <HeaderItem config={config} />
        {linkInfosContent}
        {getPermissionListContent()}
        <FooterItem intl={intl} config={config} appMode={appMode} />
      </Paper>

    </LoginPopper>
  )
}

export default LoginDropDown
