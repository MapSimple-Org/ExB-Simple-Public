/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

export declare class Option extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Accessible name for the component. */
    label: string;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /** The component's value. */
    value: any;
}
