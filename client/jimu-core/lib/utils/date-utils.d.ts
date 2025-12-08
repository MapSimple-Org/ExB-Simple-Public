import type { IntlShape, FormatDateOptions } from 'react-intl';
import type { EsriDateFormatMap, EsriDateFormats, EsriDateFormat } from '../types/common';
export declare enum VirtualDateType {
    Now = "NOW",
    Min = "MIN",
    Max = "MAX",
    Today = "TODAY",
    Tomorrow = "TOMORROW",
    Yesterday = "YESTERDAY",
    ThisWeek = "THIS_WEEK",
    ThisMonth = "THIS_MONTH",
    ThisQuarter = "THIS_QUARTER",
    ThisYear = "THIS_YEAR"
}
export declare enum TimeUnit {
    Minute = "MINUTE",
    Hour = "HOUR",
    Day = "DAY",
    Week = "WEEK",
    Month = "MONTH",
    Year = "YEAR"
}
export declare const ESRI_DATE_FORMAT_MAP: EsriDateFormatMap;
/**
 * Default esri date time format, for cookie banner, my-location cases.
 * @ignore
 */
export declare const DATE_TIME_DEFAULT_ESRI_FORMAT = "shortDateLongTime24";
export declare const DATE_TIME_DEFAULT_FORMAT: {
    date: string;
    time: string;
    dateTime: string;
};
export declare function getEsriDateFormat(esriDateFormat: EsriDateFormats | EsriDateFormat): EsriDateFormat;
export declare function formatDateValueByEsriFormat(value: number | Date, esriDateFormat: EsriDateFormats, intl: IntlShape): string;
export declare function formatTimeValueByEsriFormat(value: string, esriDateFormat: EsriDateFormats, intl: IntlShape): string;
export declare function formatDateValue(value: number | Date, intl: IntlShape, datePattern?: string, timePattern?: string): string;
export declare const getIntlOptions: (esriDateFormat: EsriDateFormats) => Intl.DateTimeFormatOptions;
export declare const getDateTimeOptions: (formats: EsriDateFormat) => FormatDateOptions;
export declare const getDateOptions: (pattern: string) => FormatDateOptions;
export declare const getTimeOption: (pattern: string, hour12?: boolean) => FormatDateOptions;
export declare function formatDateTime(date: Date, esriFormats: EsriDateFormat, intl: IntlShape): string;
export declare function formatDate(date: Date, pattern: string, intl: IntlShape): string;
export declare function formatTime(date: Date, pattern: string, intl: IntlShape): string;
export declare function isStrictYMDFormat(value: string): boolean;
export declare function getStrictYMDFormat(date: Date | number): string;
export declare function getDateByStrictYMDFormat(date: string): Date;
/**
 * Get real date or date extent by a virtual date.
 * @ignore
 */
export declare function getRealDateByVirtualDate(virtualDate: VirtualDateType, intl: any): Date | Date[];
