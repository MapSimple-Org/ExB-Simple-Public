/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { IconNameOrString } from './interfaces';

export declare class Icon extends LitElement {
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    flipRtl: boolean;
    /**
     * Displays a specific icon.
     *
     * @see [Calcite UI Icons](https://developers.arcgis.com/calcite-design-system/icons).
     */
    icon: IconNameOrString;
    /**
     * When `true`, it preloads the icon data.
     *
     * @default false
     */
    preload: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Accessible name for the component.
     *
     * It is recommended to set this value if your icon is semantic.
     */
    textLabel: string;
}
