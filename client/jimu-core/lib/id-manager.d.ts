import type { IMAppConfig, ElementType } from './types/app-config';
export default class IdManager {
    static instance: IdManager;
    static getInstance(): IdManager;
    private idCounter;
    initIdCounter(appConfig: IMAppConfig): void;
    private getConfigKeyByType;
    /**
     * @ignore
     * we use <type_number> format to generate key.
     * @param type
     */
    getUniqueId(type: ElementType): string;
}
