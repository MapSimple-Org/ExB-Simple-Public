/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';

/** @slot  - A slot for adding text. */
export declare class InputMessage extends LitElement {
    /** Specifies an icon to display. */
    icon: IconNameOrString | boolean;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the status of the input field, which determines message and icons.
     *
     * @default "idle"
     */
    status: Status;
}
