/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { HandleChange, HandleNudge } from './interfaces';

/** @deprecated Use the `calcite-sort-handle` component instead. */
export declare class Handle extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Value for the button title attribute. */
    dragHandle: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires whenever the component is selected or unselected. */
    readonly calciteHandleChange: TargetedEvent<this, void>;
    /** Fires when the handle is selected and the up or down arrow key is pressed. */
    readonly calciteHandleNudge: TargetedEvent<this, HandleNudge>;
    private messages: {
        dragHandle: string;
        dragHandleUntitled: string;
        dragHandleActive: string;
        dragHandleChange: string;
        dragHandleCommit: string;
        dragHandleIdle: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        dragHandle: string;
        dragHandleUntitled: string;
        dragHandleActive: string;
        dragHandleChange: string;
        dragHandleCommit: string;
        dragHandleIdle: string;
    }>;
}
