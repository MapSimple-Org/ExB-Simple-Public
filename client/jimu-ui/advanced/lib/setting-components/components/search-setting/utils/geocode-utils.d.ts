import { type ImmutableArray, type UseUtility, type FieldSchema } from 'jimu-core';
import { type IMSearchGeocodeDataConfig, type SearchDataConfig, type AddressFields } from '../type/type';
import type { UtilityTreeItem } from 'jimu-ui/advanced/utility-selector';
interface UrlCheckResult {
    urlCheckResultType: UrlCheckResultType;
    singleLineFieldName?: string;
    addressFields?: AddressFields[];
    candidateFields?: AddressFields[];
    isSupportSuggest?: boolean;
    spatialReference?: any;
}
declare enum UrlCheckResultType {
    Pass = "Pass",
    NotHttps = "Not_Https",
    InvalidURL = "Invalid_URL"
}
interface GetNewDataConfigByUtilityOption {
    useUtility: UseUtility;
    datasourceConfig: ImmutableArray<SearchDataConfig>;
    id: string;
    configId?: string;
    viewId?: string;
    createOutputDs?: boolean;
    dataSourceConfigItem?: IMSearchGeocodeDataConfig;
    notAddNewUtility?: boolean;
    geocodeURL?: string;
}
interface GetNewDataConfigByUtilityResultType {
    urlCheckResult: UrlCheckResult;
    dataSourceConfig?: SearchDataConfig[];
}
export interface GetDefaultGeocodeItemOption {
    utility: UtilityTreeItem;
    id: string;
    createOutputDs: boolean;
    viewId: string;
    notAddNewUtility: boolean;
    index: number;
}
export declare const getDefaultGeocodeLabel: (geocodeUrl: string) => string;
export declare const getGeocodeName: (geocodeUrl: string) => string;
export declare const isMeteredArcGISWorldGeocoder: (url: string) => boolean;
export declare const isProxiedArcGISWorldGeocoder: (url: string) => boolean;
export declare const isArcGISWorldGeocoder: (url: string) => boolean;
export declare const getOrganizationGeocodeService: (portalUrl: string) => Promise<any>;
export declare function getNewDataConfigByUtility(options: GetNewDataConfigByUtilityOption): Promise<GetNewDataConfigByUtilityResultType>;
/**
 * Use address field as displayField by default
*/
export declare const getDefaultDisplayField: (addressFieldsSchema: FieldSchema[], defaultAddressFieldName: string) => FieldSchema[];
export declare const getZoomScaleOfUseUtility: (useUtility: UseUtility) => number;
export declare const getUrlOfUseUtility: (useUtility: UseUtility) => Promise<string>;
/**
   * Check whether geocode service is legal
   */
export declare const validateGeocodeService: (geocodeServiceUrl: string) => Promise<UrlCheckResult>;
export declare function getAllGeocodeUtility(nls: any): UtilityTreeItem[];
export interface GetDefaultGeocodeConfigOption {
    nls: any;
    isSingle: boolean;
    createOutputDs: boolean;
    id: string;
    viewId: string;
    notAddNewUtility?: boolean;
}
export declare function getMultipleDefaultGeocodeConfigInRuntime(option: GetDefaultGeocodeConfigOption): Promise<SearchDataConfig[]>;
export declare function getDefaultGeocodeItem(options: GetDefaultGeocodeItemOption, newUid?: string): Promise<SearchDataConfig>;
export {};
