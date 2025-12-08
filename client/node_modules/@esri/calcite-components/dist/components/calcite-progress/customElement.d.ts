/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

export declare class Progress extends LitElement {
    /** Accessible name for the component. */
    label: string;
    /**
     * When `true` and type is `"indeterminate"`, reverses the animation direction.
     *
     * @default false
     */
    reversed: boolean;
    /** Text that displays under the component's indicator. */
    text: string;
    /**
     * Specifies the component type.
     *
     * Use `"indeterminate"` if finding actual progress value is impossible.
     *
     * @default "determinate"
     */
    type: "indeterminate" | "determinate";
    /**
     * When `type` is `"determinate"`, specifies the component's value with a range of 0 to 100.
     *
     * @default 0
     */
    value: number;
}
