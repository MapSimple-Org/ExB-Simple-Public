import { Embed } from '../base';
import type { UrlInfo as UrlInfoValue } from 'jimu-core';
export interface UrlInfoFormatValue {
    uniqueid: string;
    name: string;
    urlInfo?: UrlInfoValue;
}
export declare const URLINFO_ATTRIBUTES: string[];
export declare class RichUrlInfo extends Embed {
    contentNode: HTMLSpanElement;
    static blotName: string;
    static tagName: string;
    domNode: any;
    declareClass: 'UrlInfo';
    static create(value?: UrlInfoFormatValue): HTMLElement;
    static formats(domNode: any): any;
    static value(domNode: any): string;
    format(name: string, value: any): void;
}
