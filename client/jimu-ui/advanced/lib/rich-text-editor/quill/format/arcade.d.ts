import type { ArcadeContentConfig } from 'jimu-core';
import { Embed } from '../base';
export interface ArcadeFormatValue {
    uniqueid: string;
    dsid: string;
    name: string;
    arcade?: ArcadeContentConfig;
}
export declare class Arcade extends Embed {
    contentNode: HTMLSpanElement;
    static blotName: string;
    static tagName: string;
    domNode: any;
    declareClass: 'Arcade';
    static create(value?: ArcadeFormatValue): HTMLElement;
    static formats(domNode: any): any;
    format(name: string, value: any): void;
    formats(): {
        [index: string]: any;
    };
}
