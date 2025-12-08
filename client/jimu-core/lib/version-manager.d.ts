import { type AppConfig } from './types/app-config';
/**
 * The Version object.
 */
export interface Version<T = any> {
    /** The version number, which follows the [semver](https://www.npmjs.com/package/semver) version format. */
    version: string;
    /** The description of the version. */
    description: string;
    /**
     * The upgrader function for this version.
     * @param oldConfig The config of the old version.
     * @param id This ID can be a widgetId, an actionConfig ID, or the "app", depending on where the config is from.
     */
    upgrader: (oldConfig: T, id: string) => T | Promise<T>;
}
/**
 * The BaseVersionManager class.
 */
export declare class BaseVersionManager<T = any> {
    /**
     * Versions in the array should be in order.
     * If there is no config change in a version, we do not need to put the version in this array.
     */
    versions: Array<Version<T>>;
    /**
     * @ignore
     * @param oldConfig the config is the old version
     * @param oldVersion
     * @param newVersion
     * @param id this can be a widgetId, an actionConfig Id, or "app"
     *
     * we need to run the upgrader function in (oldVersion, newVersion], which means does not run the upgrader of the oldVersion, but run the upgrader of the newVersion
     *
     * @returns return new upgraded config
     */
    upgrade(oldConfig: T, oldVersion: string, newVersion: string, id: string): Promise<T>;
    protected checkVersions(oldVersion: string, newVersion: string): boolean | [number, number];
    protected getVersionIndex(version: string): number;
    private checkVersion;
}
export declare class AppVersionManager extends BaseVersionManager<AppConfig> {
    versions: {
        version: string;
        description: string;
        upgrader: (oldConfig: AppConfig) => any;
    }[];
}
