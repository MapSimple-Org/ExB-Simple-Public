import type { ImmutableArray, ImmutableObject } from 'seamless-immutable';
import { type IntlShape } from 'react-intl';
export declare function getLocaleToLoad(locale: string, translatedLocales: string[] | ImmutableArray<string>): string;
/**
 * Get the user's preferred language from the browser.
 *
 * @param navigator https://developer.mozilla.org/en-US/docs/Web/API/Navigator
 */
export declare function getBrowserLanguage(navigator: Navigator): any;
/**
 *
 * @param locale user's current locale
 * @param translatedLocales a list of locales that translated by the library or widget
 */
export declare function getTranslatedLocale(locale: string, translatedLocales?: string[] | ImmutableArray<string>): string;
export declare function isSameLanguage(locale1: string, locale2: string): boolean;
export interface I18nMessages {
    [index: string]: string;
}
export type IMI18nMessages = ImmutableObject<I18nMessages>;
/**
 * @param baseUrl base URL of library or widget translation files
 * @param locale user's current locale
 */
export declare function loadLocaleMessages(baseUrl: string, locale: string): Promise<I18nMessages>;
export declare function isRTLLocale(locale: any): boolean;
/**
 * @param widgetId if no widgetId, means frameworks'
 * @param context use widget runtime or setting's i18n message
 *
 * You can use this method to getIntl for builder's widget
 */
export declare function getIntl(widgetId?: string, context?: 'runtime' | 'setting'): IntlShape;
/**
 * The framework (jimu) message may change as more jimu libs are loaded. e.g., when only jimu-core get loaded,
 * the intl contains jimu-core messages only. After jimu-ui loaded, we need to reset the intl cache so the messages in jimu-ui can be used.
 */
export declare function resetIntls(): void;
export type DecimalSeparator = ',' | '.';
export declare function getDecimalSeparator(locale: string): DecimalSeparator;
/**
 * Find the locale from the locales list. If not matched, return undefined.
 * @param locale
 * @param locales
 */
export declare function findLocale(locale: string, locales?: string[] | ImmutableArray<string>): string;
export declare function changeLocale(locale: string): Promise<void>;
export declare function setRTL(locale: any): void;
