import { ArcGISIdentityManager, type ICredential, type IUser } from '@esri/arcgis-rest-request';
import type { ArcGISServerInfo } from './types/common';
import { ExternalResolvablePromise } from './external-resolvable-promise';
import { SystemErrorCode } from './types/state';
export interface IDeferred<T> {
    promise: Promise<T>;
    resolve: (v: T) => void;
    reject: (v: any) => void;
}
/**
 * The sign-in parameters.
 */
interface SignInParams {
    /** The portal URL to sign-in to. This is optional. The default is the main portal URL. To sign-in a federated service URL, you need to pass in its federated portal URL. */
    desUrl?: string;
    /** The URL that the sign-in request comes from. This is optional. The default is the root path. */
    fromUrl?: string;
    /** The OAuth2 client id. */
    clientId?: string;
    /** If 'true', will use a popup window to sign-in, if 'false', it will redirect to sign-in page in the same window. This is optional. The default is true. */
    popup?: boolean;
    /** If 'true',  the sign-in page will prompt again even the user has already signed-in. This is optional. The default is false. */
    forceLogin?: boolean;
    /** The url of federated service if sign in to a federated service. Optional. @ignore */
    federatedServiceUrl?: string;
    /** The url opened in a new window after sign-in. Optional. */
    redirectUrlInNewWindow?: string;
    /** The url opened in the top window after sign-in. Optional. When the top window is refreshed, the current window (fromUrl) will not see the refresh effect. */
    redirectUrlInTopWindow?: string;
}
/**
 * The switch account parameters.
 */
interface SwitchAccountParams {
    /** The portal URL to switch account. This is optional. The default is the main portal URL. To switch account for a federated service URL, you need to pass in its federated portal URL. */
    desUrl?: string;
    /** The OAuth2 client id. */
    clientId?: string;
    /** If 'true', will use a popup window to switch account, if 'false', it will redirect to switch account page in the same window. This is optional. The default is true. */
    popup?: boolean;
    /** The url of federated service if switch account to a federated service. Optional. @ignore */
    federatedServiceUrl?: string;
}
/**
 * The sign-out parameters.
 */
interface SignOutParams {
    /** The portal URL to sign-out to. This is optional. The default is the main portal URL. */
    desUrl?: string;
    /** The OAuth2 client id. */
    clientId?: string;
    /** If 'true', it will redirect to sign-out page in the same window, if 'false', will use static sign-out without page redirected or refreshed. This is optional. The default is true. */
    redirectToSignOutPage?: boolean;
    /** The redirected url after sign-out. Optional. The default is the root path, only take effect when 'redirectToSignOutPage' is true */
    redirectUrl?: string;
}
export interface NoPermissionResourceInfo {
    owningSystemUrl?: string;
    userName?: string;
    ignored?: boolean;
    signInErrorCode: SignInErrorCode;
    allowSignIn?: boolean;
}
export interface NoPermissionResourceInfoList {
    [resourceKey: string]: NoPermissionResourceInfo;
}
export declare enum SignInErrorCode {
    TokenRequired = "TOKEN_REQUIRED",
    InvalidToken = "INVALID_TOKEN",
    NoPermission = "NO_PERMISSION",
    SignInCanceled = "SIGN_IN_CANCELED",
    Other = "OTHER"
}
export interface SignInError {
    code: SignInErrorCode;
    isSignInError: boolean;
    message: string;
    message1?: string;
    message2?: string;
}
/**
 * @ignore
 * The reason type session changed
 */
export declare enum SessionChangedReasonType {
    ArcGISJSAPISync = "ARCGIS_JSAPI",
    PostMessageSync = "POST_MESSAGE",
    OtherWindowSync = "OTHER_WINDOW",
    AddOrUpdate = "ADD_OR_UPDATE",
    Remove = "REMOVE"
}
export declare enum SessionType {
    PortalSession = "PORTAL_SESSION",
    ServerSessionFederated = "SERVER_SESSION_FEDERATED",
    ServerSessionStandAlone = "SERVER_SESSION_STAND_ALONE",
    ServerSessionStandAloneWebTier = "SERVER_SESSION_STAND_ALONE_WEB_TIER"
}
/**
 * @ignore
 * The session change listener type
 */
export type SessionChangeListener = (sessions: ArcGISIdentityManager[], reasonType: SessionChangedReasonType) => void;
/**
 * The `SessionManager` is used to manage user sign in sessions.
 */
export declare class SessionManager {
    static instance: SessionManager;
    /** Session types
     *
     * There are three types of a session in the sessions. We use the `portal` and `server` properties to identify the session type.
     *   1, Portal Session. Whether the portal is a web-tier portal or not, we can always get a token.
     *   {
     *     portal: 'https://www.arcgis.com/sharing/rest',
     *     server: undefined
     *   }
     *   2, Federated server session.
     *    - Whether the server is a web-tier portal or not, user always use the portal credential to sign in. After sign in, we use `generateSeverSessionByPortalSession()` to generate a server session.
     *    - When accessing a server service, we always use the server session to get the portal session, then use the portal session to access the resource.
     *   {
     *     portal: 'https://www.arcgis.com/sharing/rest', //portal is owning system portal url
     *     server: 'https://server1.arcgis.com/0c086ufssavnw2/arcgis'
     *   }
     *   3, Unfederated server session.
     *   3.1 If the server is not a web-tier server, because the server does not support OAuth2, so we use JSAPI to do the sign in.
     *       After sign in, API credential is synced to ExB session.
     *   {
     *     portal: undefined,
     *     server: 'https://sampleserver6.arcgisonline.com/arcgis'
     *   }
     *   3.2 If the server is a web-tier server, there is a fake server session without token (token is '').
     *       This fake server session is used to determine the user information, it's not synced to js-api side.
     *   {
     *     portal: undefined,
     *     server: 'https://rqawiniwasasv.ags.esri.com/gis',
     *     token: ''
     *   }
     *   Note:
     *   - If there is a federated server session already exist, then its owning system portal session must also exist.
     *   - Web-tier server must be added to the trusted server list.
     *
     *  */
    /** Session key
     *
     *  ### Portal session key:
     *   * If it's AGOL, the key will be 'www.arcgis.com', 'qaext.arcgis.com', 'devext.arcgis.com'.
     *   * If it's a Enterprise portal, the key is combined with `urlKey` and `customBaseUrl`.
     *   See `getPortalKeyFromUrl()` method.
     *
     *   example_1:
     *   url: https://beijing.mapsqa.arcgis.com
     *   urlKey: beijing
     *   customBaseUrl: mapsqa.arcgis.com
     *   key: qaext.arcgis.com
     *
     *   example_2:
     *   url: http://private.test.com
     *   urlKey: private
     *   customBaseUrl: test.com
     *   key: private.test.com
     *
     *  ### Server session key:
     *   The key is the combination of 'server_' and the `session.server`(without protocol).
     *   Please referer to 'getServerKeyFromUrl' method.
     *
     *   example:
     *   serverSession.server: 'https://server1.arcgis.com/0c086ufssavnw2/arcgis'
     *   key: 'server_server1.arcgis.com/0c086ufssavnw2/arcgis'
     *
     *  */
    /** Session creation
     *  1, App loading
     *    * Read from local storage, session storage or cookie(esri_aopc and platformSelf)
     *  2, Sign in
     *   *  Sign in to portal or server resource. Sign in ExB or JSAPI, the session will be synced.
     *  3, Read from parent window
     *   *  If the URL has `?arcgis-auth-origin`, we'll try to read the session from parent window.
     *      * Now, both the parent and child app must be in the `*.arcgis.com`. But we plan to remove the restriction on the parent window, see #18194
     */
    /** Token expiration time
     * - We check the token expiration time every 20 minutes. If the token will be expired and is refresh-able, we will refresh it.
     * - How to refresh the token?
     *  - For OAuth2 portal, we use `refresh_toke` to refresh the token.
     *  - For web-tier portal, we use the cookie to refresh the portal token; for the federated server, we use the portal token to refresh the server token.
     *  - For unfederated server, we can't refresh the token, we need to sign in again.
     */
    /** Session and JSAPI credential sync
     * - JSAPI create credential for both portal and server.
     * - We always sync between ExB session and JSAPI credential.
     */
    private sessions;
    private trustedServers;
    private isSigning;
    private signInUrlFromQueue;
    private signInQueue;
    private onSessionChangedCallbacks;
    private clientIdDialogResultPromises;
    private requestCacheForValidatingToken;
    private signInDialogPendingList;
    /**
     * This list is used to record all no permission resources, the resource key is service root url or item root url
     * No permission resource is added to list when:
     *   1, checking the token is invalid after get the resource session
     *   2, sign-in dialog cancelled by user
     * @ignore
     */
    private noPermissionResourceInfoList;
    private readSessionFromParentPromise;
    /**
     * Return main session.
     *
     * The main session is session of the portal that the app connects to.
     *
     * @returns [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    getMainSession(): ArcGISIdentityManager;
    /**
     * Return all sessions.
     *
     * @returns Array of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing the logged in users.
     */
    getSessions(): ArcGISIdentityManager[];
    /**
     * Clear all sessions
     */
    clearSessions(): void;
    /**
     * On session changed
     */
    private onSessionChanged;
    /**
     * Get singleton instance.
     */
    static getInstance(): SessionManager;
    /**
     * @ignore
     */
    constructor();
    needToRefreshSession(session: any): boolean;
    private refreshFederatedSessionsBelongToThePortalSession;
    private refreshPortalSession;
    private refreshWebTierPortalSession;
    refreshSessions(): void;
    /**
     * @ignore
     *
     * We can init session from 3 places: local storage, cookie(esri_aopc), and parent app.
     *
     * First, we'll check `arcgis-auth-origin` URL param. If this param exists, will try `readSessionFromParent()`. Else,
     * Then, for develop edition:
     *        1: try to init session from cookie (esri_aopc) if it's deployed in the same domain as the portal (client id is 'experienceBuilder') .
     *        2: else init session from local storage.
     *       for non-develop edition, init session from cookie(esri_aopc) or local storage.
     *
     * About sync session for embed:
     * Ref: https://esri.github.io/arcgis-rest-js/guides/embedded-apps/
     *
     * Note: **Embed** here means embed for auth sync only, by checking `arcgis-auth-origin` URL param.
     *
     * When an exb app is embedded, will call `UserSession.fromParent(arcgisAuthOrigin)` to get auth from host app.
     * When an exb app is as host app, will listen and reply auth message from/to all `*.arcgis.com` domains
     *
     * The main portal must have been set in app store before call this method.
     */
    initSession(): Promise<void>;
    /**
     * Init session from cookie or storage
     * @param portalInfo
     */
    private initSessionFromCookieOrStorage;
    /**
     * Init resource sessions from storage, validate the token before init it.
     */
    private initResourceSessionsFromStorage;
    /**
     * Handle the situation for init session failed.
     */
    private failedToInitSession;
    /**
     * Set session by PlatformSelf response
     * @param response
     * @param portalInfo
     */
    private setSessionByPlatformSelfResponse;
    /**
     * Sends a request to check the token of the session from storage.
     * @param portalUrl
     */
    isValidTokenFromStorage(portalUrl: string): Promise<boolean>;
    /**
     * Check token is valid or not.
     *
     *   Because the token is used as the cache key, if a token is invalid, which cache will be removed
     *
     * @ignore
     */
    isValidToken(url: string, token: string, fetchParams?: {}): Promise<any>;
    /**
     * Return true if the two sessions are equal.
     * @param session1
     * @param session2
     */
    isSameSession(session1: ArcGISIdentityManager, session2: ArcGISIdentityManager): boolean;
    /**
     * Return true if the session is a main session and is valid.
     * @param session
     */
    private readonly isMainSession;
    /**
     * Handle invalid sign-in session.
     */
    private readonly processInvalidSignInSession;
    /**
     * @ignore
     * Redirect to sign-in page
     */
    gotoSignInPage: () => void;
    gotoLandingPage: () => void;
    /**
     * Redirect to privilege error page
     * @ignore
     */
    gotoPrivilegeErrorPage: (systemErrorCode: SystemErrorCode) => void;
    /**
     * @ignore
     * Get main user info by main session.
     * @param newMainSession
     */
    getUserInfo(newMainSession?: ArcGISIdentityManager): Promise<IUser>;
    /**
     * Handle works after got user info.
     * @param session
     */
    private afterGetUserInfo;
    /**
     * Get your portal info
     */
    private getMainPortal;
    /**
     * @ignore
     * Get trusted server from authorizedCrossOriginDomains of portalSelf info.
     */
    getTrustedServers(): string[];
    /**
     * @ignore
     * Return true if the server url is trusted.
     * @param serverUrl
     */
    isTrustedServer(serverUrl: string): boolean;
    /**
     * Remove the session from session manager and revoke token of session. So, deleting a session means signing out.
     * Note: token of stand-alone server session will be destroyed when syncing to 'arcgis-dependency-extension'
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    removeSession(session: ArcGISIdentityManager): boolean;
    /**
     * Remove session by key.
     * @param key
     */
    private removeSessionByKey;
    /**
     * @ignore
     *
     * Add or replace a session, we use session key to check whether to add new or replace old one.
     * After session changed, will sync to other window's SessionManager.
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    addOrReplaceSession(session: ArcGISIdentityManager): boolean;
    /**
     * Add a new session, if the session's key has exist, replace it.
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    private doAddOrReplaceSession;
    /**
     * Update the session
     * @param key
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     *
     * 1, add session to SM
     * 2, update user state if it's a main session
     * 3, update auth info in storage if it's a main session
     */
    private setSession;
    private updatingAfterMainSessionChanged;
    private removeServerSessionsByPortalSession;
    /**
     * Return session by url.
     * @param url
     *
     * @returns [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    getSessionByUrl(url: string): ArcGISIdentityManager;
    /**
     * Get session key from a session.
     *
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    getSessionKeyFromSession(session: ArcGISIdentityManager): string;
    /**
     * @ignore
     *
     * The URL can be an arcgis service url or a portal url, the key is used as id of the session.
     *
     * @param url
     */
    getSessionKeyFromUrl(url: string): string;
    /**
     * @ignore
     * Get session key from a service url, return '' if the url is not a server url.
     *
     * @param url
     */
    getServerKeyFromUrl(url: string): string;
    /**
     * Get portal key from url.
     *
     * @param url
     */
    private getPortalKeyFromUrl;
    /**
     * Get portal url info.
     * @param portalUrl
     */
    private getPortalUrlInfo;
    /**
     * Get session from auth info.
     * @param authInfo
     */
    private getSessionFromAuthInfo;
    /**
     * Get session from storage.
     *
     * @returns [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    private getSessionFromStorage;
    /**
     * Remove cookie by key.
     * @param key
     */
    private readCookie;
    /**
     * Get portal from AuthInfo.
     * @param authInfo
     */
    private getPortalFromAuthInfo;
    /**
     * Return true if the session is expired.
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    private isSessionExpired;
    /**
     * Get authInfo from session.
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     */
    private getAuthInfoFromSession;
    /**
     * Return true if it's a valid authInfo.
     * @param authInfo
     */
    private checkAuthInfo;
    /**
     * Read info by key from local storage.
     * @param key
     */
    private readAuthInfo;
    /**
     * @ignore
     * Write authInfo to storage.
     * @param session A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     *
     *  write exb auth info to session storage or local storage:
     *   dev edition: always write to local storage storage. (because it may not have aopc cookie, except it's deployed under portal)
     *   online edition:
     *     1, sign-in from OAuth2 dialog: depends on persist checkbox
     *     2, sign-in from old auth info: depends on old auth info
     *     3, sign-in from aopc cookie: always write to session storage
     *   note: after writing to session storage, when switching environments (such as from prod to devext), other new tabs my need to sign-in again
     */
    writeAuthInfo(session: ArcGISIdentityManager): void;
    /**
     * Remove authInfo from local storage.
     * @param session
     */
    private removeAuthInfo;
    /**
     * update resource auth info (exclude main session) to session storage.
     */
    private updateResourcesAuthInfo;
    /**
     * read resource auth info from session storage.
     */
    private readResourcesAuthInfo;
    private writeAuthState;
    /**
     * Return the session key for AGOL.
     * If the url is not a public AGOL url or a org url, return undefined.
     * @param url
     */
    private getStandardAGOLSessionKey;
    /**
     * This method is valid for AGOL only
     * @param sessionKey
     * @param orgUrlKey
     */
    private getOrgUrl;
    /**
     * Get hosted service
     * @param url
     */
    private getHostedService;
    /**
     * Get key of hosted service.
     * @param url
     */
    private getHostedServiceArcgisKey;
    /**
     * @ignore
     *
     * Get sign in domain.
     * @param url
     * @param orgKey
     */
    getSignInDomain(url: string, orgKey: string): Promise<string>;
    /**
     * Start sign in flow by a resource url and return the user session.
     *
     * @param resourceUrl a resource url can be:
     *        service url: federated or non-federated;
     *        portal item url;
     * @param owningSystemUrl owning system url for federated service url
     */
    signInByResourceUrl(resourceUrl: string, owningSystemUrl?: string, forceLogin?: boolean): Promise<ArcGISIdentityManager>;
    /**
     * Start OAuth2 sign-in flow and return the user session.
     *
     * @param signInParams The properties for sign-in.
     */
    signIn(signInParams?: SignInParams): Promise<ArcGISIdentityManager>;
    /**
     * Start non-OAuth sign in flow and return the user session.
     * It use esri request to sign-in resource
     *
     * @param desUrl The url you want to sign in
     */
    nonOAuthSignIn(desUrl: string, forceLogin?: boolean): Promise<any>;
    /**
     * Get the sign-in error by providing the authentication error.
     *
     * @param error `ArcGISRequestError` or `ArcGISAuthError`
     */
    getSignInErrorCodeByAuthError(error: any): SignInErrorCode | null;
    /**
     * Get the sign-in error by providing the sign-in error code.
     *
     * @param errorCode The sign-in error code.
     */
    getSignInErrorByCode(errorCode?: SignInErrorCode): SignInError;
    /**
     * Get a valid client id for portal url
     *
     * @param portalUrl portal url
     */
    getClientIdByUrl(portalUrl: string): string;
    getClientIdByPortalUrlAndHost(portalUrl: string, hostName: string): string;
    onClientIdDialogFinished(portalUrl: string, clientId: string, error?: any): void;
    private getPortalVersionByUrl;
    /**
     * Popup a dialog to set client id to app config
     *
     * @param portalUrl portal url
     * @param needToSignIn indicates whether need to sign-in
     * @param serviceUrl service url
     */
    useDialogToSetClientIdToConnectionsOfAppConfig(portalUrl: string): Promise<any>;
    /**
     * @ignore
     * You can register some callbacks for session changing
     * @param listener
     */
    addSessionChangeListener(listener: SessionChangeListener): void;
    private _executeSignIn;
    /**
     * When you need to handle the error caused by sign in, you can catch the error and call this method.
     * This method will try to sign in to get a new session.
     */
    handleAuthError: (error: any, popup?: boolean) => Promise<ArcGISIdentityManager>;
    /**
     * Start a sign-out flow by a resource url without page redirects or refreshes
     *
     * @param resourceUrl a resource url can be:
     *        service url: federated or non-federated;
     *        portal item url;
     * @param owningSystemUrl owning system url for federated service url
     */
    signOutByResourceUrl(resourceUrl: string, owningSystemUrl?: string): void;
    /**
     * Start OAuth2 sign-out flow
     * @param signOutParams The properties for sign-out.
     */
    signOut(signOutParams?: SignOutParams): void;
    /**
     * Start switch account flow by a resource url and return the user session.
     *
     * @param resourceUrl a resource url can be:
     *        service url: federated or non-federated;
     *        portal item url;
     * @param owningSystemUrl owning system url for federated service url
     */
    switchAccountByResourceUrl(resourceUrl: string, owningSystemUrl?: string): Promise<ArcGISIdentityManager>;
    /**
     * Start OAuth2 switch account flow and return the user session.
     *
     * @param switchAccountParams The properties for switching account.
     */
    switchAccount(switchAccountParams?: SwitchAccountParams): Promise<ArcGISIdentityManager>;
    private defer;
    /**
     * Generate token.
     * @param portalUrl
     * @param getTokenParam
     * @param credentialsParam
     */
    generateToken(portalUrl: string, getTokenParam?: string, credentialsParam?: string): Promise<any>;
    /**
     * Generate server session with owning system portal session.
     * @param portalSession A session of [ArcGIS REST JS 'ArcGISIdentityManager'](https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-request/ArcGISIdentityManager/) representing a logged in user.
     * @param serverUrl
     */
    generateSeverSessionByPortalSession(portalSession: ArcGISIdentityManager, serverUrl: string, credentialsParamForGenerateToken?: string): Promise<ArcGISIdentityManager>;
    /**
     * Get portalSelf info with credentials.
     * @param portalUrl
     * @param getTokenParam
     */
    private getPortalSelf;
    /**
     * @ignore
     *
     * Get session from webTier portal.
     * This method can be used to check the portal is webTier or not.
     * return a session means it's a webTier portal.
     * @param portalUrl
     * @param getTokenParam
     */
    getSessionFromWebTierPortal(portalUrl: string, getTokenParam?: string, portalSelfParam?: any): Promise<ArcGISIdentityManager>;
    /**
     * @ignore
     * Get session by webTier server url (webTier services are stored in the 'trusted servers')
     * @param serviceUrl
     */
    getSessionFromWebTierServer(serviceUrl: string): Promise<ArcGISIdentityManager>;
    /**
     * Return session type according to a session
     * @param session
     */
    getSessionType(session: ArcGISIdentityManager): SessionType;
    /****************************************************************
     * Methods for syncing session to IdentityManager of js-api
     ***************************************************************/
    /**
     * Create a session from ArcGIS Maps SDK for JavaScript credential
     * @param credential
     */
    addFromCredential(credential: ICredential | __esri.Credential, from: SessionChangedReasonType, serverInfo?: ArcGISServerInfo, oAuthInfo?: any): Promise<ArcGISIdentityManager>;
    /*****************************************************************
     * Methods for syncing session to other window
     ****************************************************************/
    /**
     * Sync session to other window's session manager
     */
    private syncToOtherWindowSessionManager;
    /**
     * Sync session from other window, this if for build-app sync only.
     *
     * @ignore
     * @param sessions
     */
    syncSessionsFromOtherWindow(sessions: ArcGISIdentityManager[]): void;
    /**
     * Sync list for no permission resource info to other window's session manager
     */
    private syncNoPermissionResourceInfoListToOtherWindowSessionManager;
    /**
     * Sync list for no permission resource from other window, this if for build-app sync only.
     *
     * @ignore
     * @param sessions
     */
    syncNoPermissionResourceInfoListFromOtherWindow(noPermissionResourceInfoList: NoPermissionResourceInfoList): void;
    private readSessionFromParent;
    /**
     * When an app receives the `arcgis:auth:requestCredential` message, it should
     * check if the origin is a trusted domain and if so, it should respond with
     * the `arcgis:auth:credential` message.
     * @param origin The origin of the message
     */
    private canPostSessionTo;
    private readonly onMessage;
    /**
     * Try to pending sign-in dialog when the dialog is popping up
     * Return a deferred if the current sign-in dialog is pending.
     *
     * This method is used to solve two problems:
     * 1, if both exb and js-api access the same private resource, both will popup a sign-in dialog.
     * 2, user have to click multiple on the cancel button to cancel login from js-api side.
     *    [known issue of js-api](https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/47886).
     *
     * @param url service or portal url
     * @ignore
     */
    tryToPendingSignInDialog(url: string): ExternalResolvablePromise | null;
    /**
     * Release all pending sign-in dialog with url
     *
     * @param url service or portal url
     * @ignore
     */
    releasePendingSignIn(url: string, error?: any): void;
    /**
     * Get no permission resource key, return null if it's not a resource url.
     *   service root url for service
     *   item url for portal item
     *
     * @param url service or portal url
     *
     * @ignore
     */
    getNoPermissionResourceKey(url: string): string;
    /**
     * Add a permission info to no-permission list.
     *
     * @param url service or portal url
     * @param isCanceld is canceled
     * @param isIgnored is ignored
     * @param owningSystemUrl it's owning system url of federated service
     *
     * @ignore
     */
    addToNoPermissionResourceInfoList(url: string, userName?: string, signInErrorCode?: SignInErrorCode, isIgnored?: boolean, owningSystemUrl?: string): void;
    /**
     * Remove a permission info from no-permission info list by url, return a removed no-permission info list.
     *
     * @param url resource url, server root url or portal root url
     *            remove all related no-permission infos if the url param is a root portal/server url
     * @ignore
     */
    removeFromNoPermissionResourceInfoList(url: string): NoPermissionResourceInfoList | null;
    /**
     * Ignore a permission info from no-permission list by url.
     *
     * @param url service or portal url, ignore all items if there in no url parameter
     *
     * Note: All items belong portal will be ignored if the url is a portal url
     *       All services belong server will be ignored if the url is a server root url
     * @ignore
     */
    ignoreFromNoPermissionResourceInfoList(url?: string): void;
    /**
     * Get no permission resource info list.
     * @ignore
     */
    getNoPermissionResourceInfoList(): NoPermissionResourceInfoList;
    /**
     * Set no permission resource info list.
     * @ignore
     */
    setNoPermissionResourceInfoList(noPermissionResourceInfoList: NoPermissionResourceInfoList): void;
    /**
     * Get a permission info from no-permission list by url.
     * @ignore
     */
    getNoPermissionResourceInfoByUrl(url: string): NoPermissionResourceInfo;
    /**
     * Check access for current url, add to no-permission list if does not have access.
     *
     * This method is used to manager permission banner list.
     *
     * @param url service or portal url
     * @param token current token
     * @param owningSystemUrl it's owning system url of federated service
     * @ignore
     */
    checkSessionPermissionForUrl(url: string, token: string, userName?: string, owningSystemUrl?: string): void;
    /**
     * Handle invalid token (498 error)
     *  1, Remove invalid sessions:
     *    a) if the url is service url: remove server session
     *    b) if the url is portal url: remove portal session and all server sessions it's corresponding portal
     *    removing token validating request cache
     *
     *  2, Redirect to error page if builder/app encounters 498 error on main portal:
     *    a), builder env;
     *    b), app env and it's not public app (non-dev edition app)
     *
     * there are three situations for 498 error (invalid token):
     *   1, app/portal sign-out from other page of current browser
     *   2, enforce MFA turned on from org
     *   3, token is expired
     *
     * @ignore
     */
    handleInvalidToken(url: string): void;
    /**
     * return true if the sign-in prompt is blocked
     * only effects on app env, always return false in builder env
     */
    isSignInPromptBlocked(): boolean;
}
/** @ignore */
export default SessionManager;
