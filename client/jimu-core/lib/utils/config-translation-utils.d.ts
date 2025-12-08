import type { AppConfig, TranslationJson } from "../types/app-config";
export declare const getTranslationFilePath: (isDraft: boolean) => string;
export declare const getTranslationFileName: (locale: string) => string;
export declare const getTranslationFullFileName: (locale: string, isDraft: boolean) => string;
export declare const isTranslationFile: (fileName: string, isDraft: boolean) => boolean;
export declare const getLocaleFromTranslationFile: (fileName: string, isDraft: boolean) => string;
export declare const mergeTranslation: (appConfig: AppConfig, translation: TranslationJson) => void;
