export declare const wkidLookup: (code: string | number) => any;
/**
 * Check whether wkid is valid
 * @param wkid
 */
export declare const isValidWkid: (wkid: string | number) => boolean;
/**
 * Get sr label/name by wkid
 * @param wkid
 */
export declare const getSRLabel: (wkid: string | number) => string;
/**
 * Get cs default unit by wkid
 * @param {number} wkid
 */
export declare const getCSUnit: (wkid: number) => string;
export declare const isSameSpheroid: (tSr: any, sSr: any) => boolean;
export declare const lookupDatum: (code: string | number) => any;
/**
 * Check whether datum wkid is valid
 * @param datumWkid
 */
export declare const isValidDatumWkid: (datumWkid: string) => boolean;
/**
 * Get label/name by datum wkid
 * @param wkid
 */
export declare const getDatumSRLabel: (wkid: any) => any;
