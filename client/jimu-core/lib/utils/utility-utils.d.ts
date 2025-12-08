import type { AppConfig, UtilitiesJson, SupportedUtilityType } from '../types/app-config';
interface AddNewutilityResult {
    id: string;
    appConfig: AppConfig;
}
export declare function addNewUtilityByUrl(appConfig: AppConfig, serviceUrl: string, type: SupportedUtilityType, label?: string): AddNewutilityResult;
export declare const checkIsUrlExist: (utilities: UtilitiesJson, serviceUrl: string) => boolean;
export declare const getUtilityIdbyServiceUrl: (utilities: UtilitiesJson, serviceUrl: string) => string;
export {};
