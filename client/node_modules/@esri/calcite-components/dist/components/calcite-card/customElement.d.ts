/// <reference path="../../index.d.ts" />
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { LogicalFlowPosition, SelectionMode } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';

/**
 * @slot  - A slot for adding content.
 * @slot [title] - [Deprecated] use `heading` instead. A slot for adding a heading.
 * @slot [subtitle] - [Deprecated] use `description` instead. A slot for adding a description.
 * @slot [thumbnail] - A slot for adding a thumbnail.
 * @slot [heading] - A slot for adding a heading.
 * @slot [description] - A slot for adding a description.
 * @slot [footer-start] - A slot for adding a leading footer.
 * @slot [footer-end] - A slot for adding a trailing footer.
 */
export declare class Card extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Accessible name for the component. */
    label: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, the component is selectable.
     *
     * @deprecated use `selectionMode` property on a parent `calcite-card-group` instead.
     * @default false
     */
    selectable: boolean;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /**
     * Sets the placement of the thumbnail defined in the `thumbnail` slot.
     *
     * @default "block-start"
     */
    thumbnailPosition: LogicalFlowPosition;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the deprecated `selectable` is true, or `selectionMode` set on parent `calcite-card-group` is not `none` and the component is selected. */
    readonly calciteCardSelect: TargetedEvent<this, void>;
    private messages: Partial<{
        select: string;
        loading: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        select: string;
        loading: string;
    }>;
}
