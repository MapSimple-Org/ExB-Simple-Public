import { Formatters, IntlFormatters, OnErrorFn, Part } from './types';
export declare function formatList(opts: {
    locale: string;
    onError: OnErrorFn;
}, getListFormat: Formatters['getListFormat'], values: ReadonlyArray<string>, options: Parameters<IntlFormatters['formatList']>[1]): string;
export declare function formatListToParts<T>(opts: {
    locale: string;
    onError: OnErrorFn;
}, getListFormat: Formatters['getListFormat'], values: ReadonlyArray<string | T>, options: Parameters<IntlFormatters['formatList']>[1]): Part[];
