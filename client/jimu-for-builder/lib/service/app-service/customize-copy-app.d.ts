import { type AppInfo, AppType } from '../type';
interface CreateAppOptions {
    originalAppInfo: AppInfo;
    useDraftConfig?: boolean;
    updateAppConfigVersion?: boolean;
    isRemoveFaviconInConfig?: boolean;
    folderId?: string;
    type?: AppType;
}
/**
 * App can be App or App Template.
 * We can determine the type of new app through the `option.type` parameter.
 * */
export declare function crateAppByApp(option: CreateAppOptions): Promise<string>;
export {};
