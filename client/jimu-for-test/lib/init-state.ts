import {
  type AppContext, type AppInfo, type AppRuntimeInfo, BrowserSizeMode, type DataSourceInfo, type IMState, type IMUrlHashParameters, Immutable, type JimuMapViewInfo,
  type MapWidgetInfo, type RuntimeInfos, type UrlParameters, type WidgetsMutableStateVersion,
  type IMAppConfig,
  version
} from 'jimu-core'
import { mockSystemJs } from './mock-systemjs'

/**
 * Init globals to make test easy.
 */
export function initGlobal () {
  window.jimuConfig = {
    isBuilder: false,
    isSite: false,
    isInBuilder: false,
    isOutOfExb: false,
    rootPath: '/',
    appFolderName: '',
    baseUrl: '/',
    useStructuralUrl: true,
    isInPortal: false,
    mountPath: '/',
    hostEnv: 'prod',
    isDevEdition: false,
    arcgisJsApiUrl: 'https://js.arcgis.com/4.34/',
    calciteComponentsUrl: '',
    buildNumber: '',
    exbVersion: '1.19.0'
  }
  mockSystemJs()
}

/** Return an empty init state. */
export function getInitState (): IMState {
  if (!window.jimuConfig) {
    initGlobal()
  }
  const INIT_STATE: IMState = Immutable({
    appConfig: null,
    portalUrl: null,
    portalSelf: null,
    widgetsRuntimeInfo: {} as RuntimeInfos,
    widgetsClassStatus: {} as { [widgetUri: string]: boolean },
    widgetsPreloadProps: {} as { [widgetId: string]: any },

    dataSourcesPreloadData: {} as { [dsId: string]: any[] },
    appContext: {
      locale: 'en' // It is to prevent console error of intl, "locale" was not configured, using "undefined" as fallback.
    } as AppContext,

    appPath: window.jimuConfig.rootPath,
    appInfo: {} as AppInfo,

    isNetworkOffLine: false,
    isMobileSize: false,
    appId: null,
    appI18nMessages: {} as any,
    appRuntimeInfo: {} as AppRuntimeInfo,
    jimuCoreNls: null,
    queryObject: {} as UrlParameters,
    urlHashObject: {} as IMUrlHashParameters,

    dataSourcesInfo: {} as { [dsId: string]: DataSourceInfo },
    jimuMapViewsInfo: {} as { [jimuMapViewId: string]: JimuMapViewInfo },

    widgetsState: {} as any,
    widgetsMutableStateVersion: {} as WidgetsMutableStateVersion,

    mapWidgetsInfo: {} as { [dsId: string]: MapWidgetInfo },

    dynamicStyleState: {} as { [widgetId: string]: number },

    user: null,
    theme: null,
    browserSizeMode: BrowserSizeMode.Large,
    overlays: [],
    userLocaleChanged: false,
    systemError: null,
    portalsNeedToRegisterClientId: [],
    noPermissionResourceChangedFlag: '',
    resourceSessions: {} as { [key: string]: string },
    guideId: null,
    shouldCheckGuideDisplay: false
  })

  return INIT_STATE
}

/** Get an empty default app config. */
export function getDefaultAppConfig (): IMAppConfig {
  return Immutable({
    theme: '/themes/default/',
    mainSizeMode: BrowserSizeMode.Large,
    pages: {},
    pageStructure: [],
    dialogs: {},
    layouts: {},
    sections: {},
    views: {},
    widgets: {},
    screenGroups: {},
    screens: {},
    header: {},
    footer: {},
    dataSources: {},
    attributes: {},
    widgetsManifest: {},
    messageConfigs: {},
    exbVersion: version
  } as any)
}
