/** @jsx jsx */
import { React, jsx, type IMThemeVariables, getAppStore, Immutable } from 'jimu-core'
import { Button, Icon, defaultMessages as jimuUiDefaultMessages, type StyleState } from 'jimu-ui'
import type { IntlShape } from 'react-intl'
import { type ExtraProps, isSignedIn, signIn, signOut, getThumbnail } from '../../utils'
import { type IMConfig, QuickStyleMode, type IMWidgetState } from '../../config'
import { getStyleState, type LoginStyleState } from '../style'
import { styled } from 'jimu-theme'
import LoginDropDown from './login-dropdown'

const IconAccount = require('../assets/default-user.svg')
const { useState, useCallback, useMemo } = React

export interface LoginButtonProps extends ExtraProps {
  config: IMConfig
  widgetId: string
  intl: IntlShape
  theme: IMThemeVariables
}

const LoginButtonRoot = styled(Button)<StyleState<LoginStyleState>>(({ theme, styleState, className }) => {
  //const isLinkLabelOnlyMode = className?.includes(QuickStyleMode.linkLabelOnly)
  //const defaultBackgroundColor = isLinkLabelOnlyMode ? 'transparent': 'var(--sys-color-surface-paper)'
  //const defaultColor = isLinkLabelOnlyMode ? 'var(--sys-color-action-link)' : 'var(--sys-color-surface-paperText)'
  //const defaultTextDecoration = isLinkLabelOnlyMode ? 'underline' : undefined
  //const defaultBorder = isLinkLabelOnlyMode ? 'solid 0px' : ''
  //const defaultBorderRadius = '0 0 0 0'
  //const defaultRegularStyle = {backgroundColor: defaultBackgroundColor, color: defaultColor, fontSize: '14px', border: defaultBorder, borderRadius: defaultBorderRadius}
  //const defaultHoverStyle = {backgroundColor: defaultBackgroundColor, textDecoration: defaultTextDecoration}

  const defaultRegularStyle = {fontSize: 'var(--sys-typography-label1-font-size)'}
  const regularStyle = {...defaultRegularStyle, ...(styleState?.regularStyle), ...({'& img, & svg': styleState?.iconStyle?.regularStyle || {}})}
  const hoverStyle = {...(styleState?.hoverStyle), ...({'img, svg': styleState?.iconStyle?.hoverStyle || {}})}

  return {
    ...regularStyle,
    ...{'&:hover': hoverStyle}
  }
})

const LoginButton = (props: LoginButtonProps): React.ReactElement => {
  const [open, setOpen] = useState(null)
  const { config, widgetId, active, appMode, intl } = props
  const functionConfig = config.functionConfig
  const iconConfig = functionConfig?.icon
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const styleConfig = config.styleConfig
  const useAdvanceLogin = functionConfig.loginOptions.useAdvanceLogin
  const user = getAppStore().getState().user
  const usePopupLogin = functionConfig.usePopupLogin
  const widgetState: IMWidgetState = getAppStore().getState().widgetsState[widgetId] || Immutable({})
  const isConfiguringHover = widgetState.isConfiguringHover
  const userThumbnail = getThumbnail()
  const isLogoutMode = window.jimuConfig.isInBuilder && widgetState.isLogoutMode
  const isSigned = isLogoutMode ? false : isSignedIn()

  const onLoginButtonClick = useCallback(() => {
    if (useAdvanceLogin) {
      isSigned && setOpen(!open)
      !isSigned && signIn(usePopupLogin, functionConfig.afterLoginLinkParam)
    } else {
      isSigned ? signOut(functionConfig.afterLogoutLinkParam) : signIn(usePopupLogin, functionConfig.afterLoginLinkParam)
    }
  }, [open, isSigned, useAdvanceLogin, usePopupLogin, functionConfig.afterLoginLinkParam, functionConfig.afterLogoutLinkParam])

  const styleStateResult = useMemo(() => {
    return styleConfig.customStyle && getStyleState(styleConfig.customStyle, widgetId, active, appMode, isConfiguringHover) || {}
  }, [styleConfig.customStyle, widgetId, active, appMode, isConfiguringHover])

  const buttonLabel = useMemo(() => {
    const signInStr = intl.formatMessage({ id: 'signIn', defaultMessage: jimuUiDefaultMessages.signIn})
    const signOutStr = intl.formatMessage({ id: 'signOut', defaultMessage: jimuUiDefaultMessages.signOut})
    if (useAdvanceLogin) {
      return isSigned ? user?.username : signInStr
    } else {
      return isSigned ? signOutStr : signInStr
    }
  }, [isSigned, user, useAdvanceLogin, intl])

  const getIconContent = useMemo(() => {
    const defaultIcon = <Icon className='d-block avatar-icon' icon={IconAccount} width={24} height={24} />
    if (isSigned) {
      if (userThumbnail) {
        return (<img src={userThumbnail} width={24} height={24} style={{ borderRadius: '50%' }} className='d-block float-left avatar-icon' />)
      } else {
        return defaultIcon
      }
    } else {
      if (iconConfig) {
        return <Icon className='avatar-icon' icon={iconConfig.data.svg} aria-hidden={true} />
      } else {
        return defaultIcon
      }
    }

  }, [iconConfig, userThumbnail, isSigned])

  return (
    <div className='login-button-box w-100 h-100'>
      <LoginButtonRoot ref={buttonRef}
      styleState={styleStateResult}
      className={`login-button ${functionConfig.quickStyleMode}`}
      type='default'
      size='sm'
      icon={false}
      onClick={onLoginButtonClick}>
        {(functionConfig.quickStyleMode !== QuickStyleMode.labelOnly && functionConfig.quickStyleMode !== QuickStyleMode.linkLabelOnly) && getIconContent}
        {(functionConfig.quickStyleMode !== QuickStyleMode.iconOnly) && <div className='user-name text-truncate'>{buttonLabel}</div>}
      </LoginButtonRoot>
      {isSigned && <LoginDropDown {...props} open={open} buttonRef={buttonRef.current}/>}
    </div>
  )
}

export default LoginButton
