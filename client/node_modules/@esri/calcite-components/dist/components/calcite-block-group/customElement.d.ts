/// <reference path="../../index.d.ts" />
import { default as Sortable } from 'sortablejs';
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { SortableComponent } from '../../utils/sortableComponent';
import { SortMenuItem } from '../calcite-sort-handle/interfaces';
import { Scale } from '../interfaces';
import { BlockDragDetail } from './interfaces';

/** @slot  - A slot for adding `calcite-block` elements. */
export declare class BlockGroup extends LitElement {
    /** When provided, the method will be called to determine whether the element can move from the component. */
    canPull: (detail: BlockDragDetail) => boolean | "clone";
    /** When provided, the method will be called to determine whether the element can be added from another component. */
    canPut: (detail: BlockDragDetail) => boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, `calcite-block`s are sortable via a draggable button.
     *
     * @default false
     */
    dragEnabled: boolean;
    /**
     * The block-group's group identifier.
     *
     * To drag elements from one group into another, both groups must have the same group value.
     */
    group?: string;
    /**
     * Specifies an accessible name for the component.
     *
     * When `dragEnabled` is `true` and multiple group sorting is enabled with `group`, specifies the component's name for dragging between groups.
     *
     * @required
     */
    label: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, and a `group` is defined, `calcite-block`s are no longer sortable.
     *
     * @default false
     */
    sortDisabled: boolean;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     * @returns
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's dragging has ended. */
    readonly calciteBlockGroupDragEnd: TargetedEvent<this, BlockDragDetail>;
    /** Fires when the component's dragging has started. */
    readonly calciteBlockGroupDragStart: TargetedEvent<this, BlockDragDetail>;
    /** Fires when the component's item order changes. */
    readonly calciteBlockGroupOrderChange: TargetedEvent<this, BlockDragDetail>;
    /**
     * Fires when a user attempts to move an element using the sort menu and 'canPut' or 'canPull' returns falsy.
     *
     * @deprecated No longer necessary.
     */
    readonly calciteBlockGroupMoveHalt: TargetedEvent<this, BlockDragDetail>;
}
