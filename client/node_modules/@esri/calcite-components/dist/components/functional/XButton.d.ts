import { TemplateResult } from 'lit-html';
import { LuminaJsx } from '@arcgis/lumina';
import { Scale } from '../interfaces';
export interface XButtonProps extends LuminaJsx.CustomAttributes<HTMLButtonElement> {
    disabled: boolean;
    focusable?: boolean;
    label: string;
    round?: boolean;
    scale: Scale;
    title?: string;
    onClick?: LuminaJsx.DOMAttributes<HTMLElement>["onClick"];
}
export declare const CSS: {
    button: string;
    buttonRound: string;
};
export declare const XButton: ({ disabled, focusable, key, label, onClick, ref, round, scale, title, }: XButtonProps) => TemplateResult;
