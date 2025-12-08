/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { SelectionMode, InteractionMode, Scale, FlipContext } from '../interfaces';
import { SelectionAppearance } from '../calcite-list/resources';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { SortableComponentItem } from '../../utils/sortableComponent';
import { SortMenuItem } from '../calcite-sort-handle/interfaces';
import { List } from '../calcite-list/customElement.js';
import { ListDisplayMode } from '../calcite-list/interfaces';

/**
 * @slot  - A slot for adding `calcite-list`, `calcite-list-item` and `calcite-list-item-group` elements.
 * @slot [actions-start] - A slot for adding actionable `calcite-action` elements before the content of the component.
 * @slot [content-start] - A slot for adding non-actionable elements before the label and description of the component.
 * @slot [content] - A slot for adding non-actionable, centered content in place of the `label` and `description` of the component.
 * @slot [content-end] - A slot for adding non-actionable elements after the label and description of the component.
 * @slot [actions-end] - A slot for adding actionable `calcite-action` elements after the content of the component.
 * @slot [content-bottom] - A slot for adding content below the component's `label` and `description`.
 */
export declare class ListItem extends LitElement {
    /**
     * When `true`, a close button is added to the component.
     *
     * @default false
     */
    closable: boolean;
    /**
     * When `true`, hides the component.
     *
     * @default false
     */
    closed: boolean;
    /** A description for the component. Displays below the label text. */
    description: string;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, the item is not draggable.
     *
     * @default false
     */
    dragDisabled: boolean;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** The label text of the component. Displays above the description text. */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Provides additional metadata to the component. Primary use is for a filter on the parent `calcite-list`. */
    metadata: Record<string, unknown>;
    /**
     * When `true`, the item is open to show child components.
     *
     * @deprecated Use `expanded` prop instead.
     * @default false
     */
    get open(): boolean;
    set open(value: boolean);
    /**
     * Specifies the size of the component.
     *
     * @internal
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true` and the parent `calcite-list`'s `selectionMode` is `"single"`, `"single-persist"', or `"multiple"`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /**
     * When `true`, displays and positions the sort handle.
     *
     * @default false
     */
    sortHandleOpen: boolean;
    /**
     * When `true`, the component's content appears inactive.
     *
     * @default false
     */
    unavailable: boolean;
    /** The component's value. */
    value: any;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the close button is clicked. */
    readonly calciteListItemClose: TargetedEvent<this, void>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteListItemCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteListItemExpand: TargetedEvent<this, void>;
    /** Fires when the component is selected. */
    readonly calciteListItemSelect: TargetedEvent<this, void>;
    /** Fires when the sort handle is requested to be closed and before the closing transition begins. */
    readonly calciteListItemSortHandleBeforeClose: TargetedEvent<this, void>;
    /** Fires when the sort handle is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteListItemSortHandleBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the sort handle is closed and animation is complete. */
    readonly calciteListItemSortHandleClose: TargetedEvent<this, void>;
    /** Fires when the sort handle is open and animation is complete. */
    readonly calciteListItemSortHandleOpen: TargetedEvent<this, void>;
    /** Fires when the open button is clicked. */
    readonly calciteListItemToggle: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
        expand: string;
        collapse: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
        expand: string;
        collapse: string;
    }>;
}
