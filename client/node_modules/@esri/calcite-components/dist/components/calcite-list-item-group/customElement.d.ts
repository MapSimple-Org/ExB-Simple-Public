/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Scale } from '../interfaces';

/** @slot  - A slot for adding `calcite-list-item` and `calcite-list-item-group` elements. */
export declare class ListItemGroup extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** The header text for all nested `calcite-list-item` rows. */
    heading: string;
    /**
     * Specifies the size of the component.
     *
     * @internal
     * @default "m"
     */
    scale: Scale;
}
