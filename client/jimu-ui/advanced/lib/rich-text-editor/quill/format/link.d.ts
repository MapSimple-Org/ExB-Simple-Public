import type { LinkParam, LinkTarget } from 'jimu-core';
import { Inline } from '../base';
export interface LinkFormatValue {
    uniqueid: string;
    dsid: string;
    href: string;
    target: LinkTarget;
    link?: LinkParam;
}
export declare class Link extends Inline {
    static SANITIZED_URL: any;
    domNode: HTMLLinkElement;
    static blotName: string;
    static tagName: string;
    static PROTOCOL_WHITELIST: string[];
    static create(value: LinkFormatValue | string): HTMLElement;
    static formats(domNode: any): any;
    static sanitize(url: any): string;
    format(name: any, value: LinkFormatValue | string): void;
}
export declare function sanitize(url: any, protocols: any): boolean;
