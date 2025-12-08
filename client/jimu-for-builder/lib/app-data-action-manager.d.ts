import { type DataActionSettingProps, React } from 'jimu-core';
export default class AppDataActionManager {
    static instance: AppDataActionManager;
    static getInstance(): AppDataActionManager;
    private actionSettings;
    /**
     * Update this.actionSettings if there is new widget with data action is added.
     */
    loadAllActionSettingClasses(): {
        [uri: string]: Promise<React.ComponentClass<DataActionSettingProps<unknown>>>;
    };
    private loadDependency;
    private injectActionSettingProps;
}
