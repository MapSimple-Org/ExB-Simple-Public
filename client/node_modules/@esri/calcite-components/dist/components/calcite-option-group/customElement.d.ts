/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

/** @slot  - A slot for adding `calcite-option`s. */
export declare class OptionGroup extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
}
