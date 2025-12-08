import { type AppConfig, type IMAppConfig } from './types/app-config';
import type { IntlShape } from 'react-intl';
export default class ConfigManager {
    static instance: ConfigManager;
    static getInstance(options: {
        intl: IntlShape;
    }): ConfigManager;
    constructor(options: any);
    intl: IntlShape;
    private removedOrChangedContent;
    loadAppConfig(): Promise<IMAppConfig>;
    setAppConfig(rawAppConfig: AppConfig): Promise<void>;
    private loadAndProcessAppConfig;
    private initPortalAndWebTier;
    upgradeAppConfig(appConfig: AppConfig): Promise<AppConfig>;
    private handleWebTierAndUpdatePortalAndInitSession;
    private checkWebTierAndUpdatePortalAndInitSession;
    private processRawConfig;
    /**
     * When app is deployed, the app info is saved in app config.
     * @param attributes
     */
    private updateAppInfoForDeployedApp;
    loadRawAppConfig(): Promise<AppConfig>;
    /**
     * By default, app can load app config from:
     *  ?config=<url>: relative or absolute URL
     *  ?id=<app id>: the item id.
     *  /:appId?:
     */
    loadAppConfigWithDefault(): Promise<AppConfig>;
    private addWebmapOrWebsceneToAppConfig;
    loadAppConfigFromLocalServer(appId: string): Promise<AppConfig>;
    loadAppConfigFromPortal(appId: string): Promise<AppConfig>;
    private _handleAuthError;
    applyAppConfigProcessorExtension(appConfig: AppConfig): Promise<AppConfig>;
    loadAllWidgetsManifest(appConfig: AppConfig): Promise<AppConfig>;
    processAppConfigAfterLoad(appConfig: AppConfig): void;
    cleanConfig(appConfig: AppConfig): void;
    handleEmbedMode(appConfig: AppConfig): void;
    buildAppStructure(appConfig: AppConfig): void;
    addDefaultPageStructure(appConfig: AppConfig): void;
    fixAllIds(appConfig: AppConfig): void;
    fixId(section: any): void;
    processWidgets(appConfig: AppConfig): void;
    fixThemeUri(appConfig: AppConfig): void;
    addDefaultValues(appConfig: AppConfig): AppConfig;
    addDefaultPageVisible(appConfig: AppConfig): void;
    addDefaultLabelAndIcon(appConfig: AppConfig): void;
    addPageLabel(appConfig: AppConfig): void;
    applyTranslation(appConfig: AppConfig, locale: string): Promise<AppConfig>;
    private removeNoPermissionPages;
    private onUserChange;
    private mergeRemovedOrChangedContent;
    private resetRemovedOrChangedContent;
}
