/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { FlipContext, Scale, SelectionMode } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { TreeItemSelectDetail } from './interfaces';

/**
 * @slot  - A slot for adding text.
 * @slot [children] - A slot for adding nested `calcite-tree` elements.
 * @slot [actions-end] - A slot for adding actions to the end of the component. It is recommended to use two or fewer actions.
 */
export declare class TreeItem extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Accessible name for the component. */
    label: string;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /** Fires when the component's content area is collapsed. */
    readonly calciteTreeItemCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteTreeItemExpand: TargetedEvent<this, void>;
}
