/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { PropertyValues } from 'lit';
import { FlipContext, Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { BlockSectionToggleDisplay } from './interfaces';

/** @slot  - A slot for adding custom content. */
export declare class BlockSection extends LitElement {
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, expands the component and its contents.
     *
     * @deprecated Use `expanded` prop instead.
     * @default false
     */
    get open(): boolean;
    set open(value: boolean);
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Displays a status-related indicator icon.
     *
     * @deprecated Use `icon-start` instead.
     */
    status: Status;
    /** The component header text. */
    text: string;
    /**
     * Specifies how the component's toggle is displayed, where:
     *
     * `"button"` sets the toggle to a selectable header, and
     *
     * `"switch"` sets the toggle to a switch.
     *
     * @default "button"
     */
    toggleDisplay: BlockSectionToggleDisplay;
    /**
     * Sets focus on the component's first tabbable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteBlockSectionCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteBlockSectionExpand: TargetedEvent<this, void>;
    /** Fires when the header has been clicked. */
    readonly calciteBlockSectionToggle: TargetedEvent<this, void>;
    private messages: Partial<{
        collapse: string;
        expand: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        collapse: string;
        expand: string;
    }>;
}
