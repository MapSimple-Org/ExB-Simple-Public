import { Embed } from '../base';
export interface ImageFormatValue {
    name?: string;
    url?: string;
}
export declare class Image extends Embed {
    static blotName: string;
    static tagName: string;
    static create(value?: ImageFormatValue | string): HTMLElement;
    static formats(domNode: Element): {
        [x: string]: any;
    };
    static match(url: string): boolean;
    static sanitize(url: string): string;
    static value(domNode: Element): string;
    domNode: HTMLImageElement;
    format(name: string, value: ImageFormatValue | string | boolean): void;
    sanitizeStyle(value: any): string;
}
