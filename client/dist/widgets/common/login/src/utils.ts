import { type AllWidgetProps, Immutable, type AppMode, SessionManager, type LinkParam, getAppStore, urlUtils, type ImmutableObject, utils as jimuUtils } from 'jimu-core'
import { type IMConfig, QuickStyleMode } from './config'

export interface ExtraProps {
  active: boolean
  appMode: AppMode
  noPermissionResourceChangedFlag?: string
}

export type LoginProps = AllWidgetProps<IMConfig> & ExtraProps

export function getDefaultConfig (): IMConfig {
  return Immutable({
    functionConfig: {
      usePopupLogin: true,
      quickStyleMode: QuickStyleMode.default,
      loginOptions: {
        useAdvanceLogin: false,
        username: true,
        userAvatar: true,
        userProfile: true,
        userSetting: true,
        //userExperiences : true,
        resourceCredentialList: false,
        links: []
      }
    },
    styleConfig: {
      //useCustom: false,
      themeStyle: {
        quickStyleType: 'default'
      }
    }
  })
}

export function isSignedIn () {
  const mainSession = SessionManager.getInstance().getMainSession()
  return !!mainSession
}

export function signIn (usePopup: boolean = false, afterLoginLinkParam?: ImmutableObject<LinkParam>) {
  if (window.jimuConfig.isInBuilder || isSignedIn()) {
    return
  }
  const isEmbeddedInIframe = jimuUtils.isInIFrame()
  if (isEmbeddedInIframe) {
    // force popup when ExB app is embedded.
    usePopup = true
  }

  const currentUrl = window.location.href
  const queryObject = getAppStore().getState().queryObject
  const redirectUrl = afterLoginLinkParam && urlUtils.getHrefFromLinkTo(afterLoginLinkParam, queryObject)
  const openType = afterLoginLinkParam?.openType || '_self'
  const defaultFromUrl = usePopup ? null : currentUrl
  const fromUrl = openType === '_self' && redirectUrl ? redirectUrl : defaultFromUrl
  const redirectUrlInNewWindow = openType === '_blank' && redirectUrl ? redirectUrl : null
  const redirectUrlInTopWindow = openType === '_top' && redirectUrl? redirectUrl : null
  SessionManager.getInstance().signIn({popup: usePopup, fromUrl, redirectUrlInNewWindow, redirectUrlInTopWindow, forceLogin: true})
}

export function signOut (afterLogoutLinkParam?: ImmutableObject<LinkParam>) {
  if (window.jimuConfig.isInBuilder || !isSignedIn()) {
    return
  }

  const currentUrl = window.location.href
  const queryObject = getAppStore().getState().queryObject
  let redirectUrl = afterLogoutLinkParam && urlUtils.getHrefFromLinkTo(afterLogoutLinkParam, queryObject)
  if (redirectUrl && (redirectUrl.indexOf('https://') !== 0)) {
    redirectUrl = `https://${window.location.host}${redirectUrl}`
  }
  redirectUrl = redirectUrl || currentUrl
  SessionManager.getInstance().signOut({redirectUrl})
}

export function switchAccount () {
  if (window.jimuConfig.isInBuilder || !isSignedIn()) {
    return
  }
  SessionManager.getInstance().switchAccount()
}

export function getThumbnail () {
  let userThumbnail
  const mainSession = SessionManager.getInstance().getMainSession()
  const user = getAppStore().getState().user
  const portalUrl = getAppStore().getState().portalUrl
  if (user && user.thumbnail) {
    userThumbnail = `${portalUrl}/sharing/rest/community/users/${user.username}/info/${user.thumbnail}?token=${mainSession?.token}`
  }
  return userThumbnail
}

