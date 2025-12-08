import type { Expression as ExpressionValue } from 'jimu-core';
import { Embed } from '../base';
export interface ExpressionFormatValue {
    uniqueid: string;
    dsid: string;
    name: string;
    expression?: ExpressionValue;
}
export declare const EXPRESSION_ATTRIBUTES: string[];
export declare class RichExpression extends Embed {
    contentNode: HTMLSpanElement;
    static blotName: string;
    static tagName: string;
    domNode: any;
    declareClass: 'Expression';
    static create(value?: ExpressionFormatValue): HTMLElement;
    static formats(domNode: any): any;
    static value(domNode: any): string;
    format(name: string, value: any): void;
}
