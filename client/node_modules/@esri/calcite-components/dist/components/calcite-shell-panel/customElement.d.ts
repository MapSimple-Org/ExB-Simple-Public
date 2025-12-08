/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Height, Layout, Position, Scale, Width } from '../interfaces';
import { DisplayMode, ResizeValues } from './interfaces';

/**
 * @slot  - A slot for adding custom content.
 * @slot [action-bar] - A slot for adding a `calcite-action-bar` to the component.
 */
export declare class ShellPanel extends LitElement {
    /**
     * When `true`, hides the component's content area.
     *
     * @default false
     */
    collapsed: boolean;
    /**
     * Specifies the display mode of the component, where:
     *
     * `"dock"` displays at full height adjacent to center content,
     *
     * `"overlay"` displays at full height on top of center content, and
     *
     * `"float"` [Deprecated] does not display at full height with content separately detached from `calcite-action-bar` on top of center content.
     *
     * `"float-content"` does not display at full height with content separately detached from `calcite-action-bar` on top of center content.
     *
     * `"float-all"` detaches the `calcite-panel` and `calcite-action-bar` on top of center content.
     *
     * @default "dock"
     */
    displayMode: DisplayMode;
    /**
     * When `layout` is `horizontal`, specifies the maximum height of the component.
     *
     * @deprecated Use the `height` property instead.
     */
    heightScale: Scale;
    /**
     * The direction of the component.
     *
     * @default "vertical"
     */
    layout: Extract<"horizontal" | "vertical", Layout>;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the component's position. Will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default "start"
     */
    position: Extract<"start" | "end", Position>;
    /**
     * When `true` and `displayMode` is not `float-content` or `float`, the component's content area is resizable.
     *
     * @default false
     */
    resizable: boolean;
    /** Specifies the height of the component. */
    height: Height;
    /**
     * When `layout` is `vertical`, specifies the width of the component.
     *
     * @deprecated Use the `width` property instead.
     * @default "m"
     */
    widthScale: Scale;
    /** Specifies the width of the component. */
    width: Extract<Width, Scale>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteShellPanelCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteShellPanelExpand: TargetedEvent<this, void>;
    private messages: Partial<{
        resize: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        resize: string;
    }>;
}
