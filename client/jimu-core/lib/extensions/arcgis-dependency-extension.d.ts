import type * as extensionSpec from '../extension-spec/extension-spec';
import type { Resource } from '../types/common';
export declare class ArcGISDependencyDefineExtension implements extensionSpec.DependencyDefineExtension {
    id: string;
    themeLoadObserver: any;
    getDependencyKey(): string;
    getResources(): Resource[];
    postInit(): Promise<void>;
    private initModules;
    private initInterceptor;
    private replaceGetCredential;
    private checkSessionPermissionForUrl;
    private addToNoPermissionResourceInfoList;
    private initToRegisterOAuthForMainPortalAndAGOL;
    /**
     * use after initModules for loading OAuthInfo/ServerInfo/IdentityManager
     */
    private registerOAuthInfo;
    /**
     * get flow type for registering OAuth info.
     *  return 'authorization-code' if accessing AGOL or ArcGIS Enterprise version 10.9 or higher;
     *  return 'implicit' if accessing ArcGIS Enterprise version prior to 10.9.
     */
    private getFlowTypeForRegisteringOAuthInfo;
    /**
     * if the url is portal url, remove the portal credential and all server credentials belonging to the same portal
     * if the url is service url, remove it's owning system portal credential and all server credentials belonging to the same owning system url
     * @ignore
     */
    private removePortalAndItsServerCredentials;
    private addCredentialToSessionManger;
    /**
     * use after initModules
     */
    private listeningJsApiSignIn;
    private syncToArcgisJSAPI;
    private onSessionChangedCallback;
    private addToTrustedServers;
    private onCurrentThemeLoad;
    private removeApiThemeStyle;
    private getAPIThemeUrl;
    private checkAPITheme;
}
