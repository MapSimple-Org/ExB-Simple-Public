/**
 * The config for jimu lib.
 */
export default interface JimuConfig {
    /**
     * The whole exb system is mounted to, such as: /abc/xyz/. End with slash
     */
    mountPath: string;
    /**
     * The app name in exb system, including: builder, experience, template. when deployed out of exb, appNamePath is empty
     */
    appFolderName: string;
    /**
     * rootPath = mountPath + appNamePath, end with slash
     */
    rootPath: string;
    /**
     * baseUrl is used to load modules dynamically, import-maps are relative this URL.
     *
     * baseUrl = buildNumber ? mountPath + 'cdn/' + buildNumber + '/' : mountPath; End with slash
     *
     */
    baseUrl: string;
    /**
     * True means use this URL: :appId/page/:pageId
     * False means use this URL: ?id=:appId&page=:pageId
     */
    useStructuralUrl: boolean;
    /**
     * Whether the app is out of the EXB system. When an app is downloaded, we will change this value to "true"
     * */
    isOutOfExb: boolean;
    /** Whether the app is builder */
    isBuilder: boolean;
    /** Whether the app is site */
    isSite: boolean;
    /** Whether the app is in builder or not */
    isInBuilder: boolean;
    isDevEdition: boolean;
    /**
     * Experience is designed to be able to be deployed in/out portal/AGOL.
     * Whether it's in portal impact how to get the portalUrl.
     *
     * If it's in portal:
     *  get portalUrl from window.location, we don't consider the portalUrl in app config
     * If it's not in portal/AGOL:
     *  * If user has signed in, use user signed in portal
     *  * if not signed in, use portalUrl in app config.
    */
    isInPortal: boolean;
    /**
     * arcgisJsApiUrl and calciteComponentsUrl are set in the webpack config, and can be overridden through url params.
     */
    arcgisJsApiUrl?: string;
    calciteComponentsUrl?: string;
    /**
     * In online and developer edition, the following components url are calculated from arcgisJsApiUrl.
     * In portal edition, the are set in the init jimu config.
     *
     * This can be overridden through componentsurl url params.
     */
    mapComponentsUrl?: string;
    chartsComponentsUrl?: string;
    codingComponentsUrl?: string;
    portalComponentsUrl?: string;
    /** Build number is used to ban cache */
    buildNumber: string;
    exbVersion: string;
    hostEnv: 'dev' | 'qa' | 'prod';
    downloadLocales?: string[];
}
