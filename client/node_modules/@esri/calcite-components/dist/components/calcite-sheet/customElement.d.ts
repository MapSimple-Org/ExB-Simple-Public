/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Height, LogicalFlowPosition, Scale, Width } from '../interfaces';
import { FocusTrapOptions } from '../../controllers/useFocusTrap';
import { DisplayMode, ResizeValues } from './interfaces';

/** @slot  - A slot for adding custom content. */
export declare class Sheet extends LitElement {
    /**
     * Passes a function to run before the component closes.
     *
     * @returns
     */
    beforeClose: (el: HTMLCalciteSheetElement) => Promise<void>;
    /**
     * Specifies the display mode - `"float"` (content is separated detached),
     * or `"overlay"` (displays on top of center content).
     *
     * @default "overlay"
     */
    displayMode: DisplayMode;
    /**
     * When `true`, disables the default close on escape behavior.
     *
     * @default false
     */
    escapeDisabled: boolean;
    /**
     * When `true`, prevents focus trapping.
     *
     * @default false
     */
    focusTrapDisabled: boolean;
    /**
     * Specifies custom focus trap configuration on the component, where
     *
     * `"allowOutsideClick`" allows outside clicks,
     * `"initialFocus"` enables initial focus,
     * `"returnFocusOnDeactivate"` returns focus when not active, and
     * `"extraContainers"` specifies additional focusable elements external to the trap (e.g., 3rd-party components appending elements to the document body).
     * `"setReturnFocus"` customizes the element to which focus is returned when the trap is deactivated. Return `false` to prevent focus return, or `undefined` to use the default behavior (returning focus to the element focused before activation).
     */
    focusTrapOptions: Partial<FocusTrapOptions>;
    /**
     * When `position` is `"block-start"` or `"block-end"`, specifies the height of the component.
     *
     * @deprecated Use the `height` property instead.
     * @default "m"
     */
    heightScale: Scale;
    /** Specifies the height of the component. */
    height: Height;
    /**
     * Specifies the label of the component.
     *
     * @required
     */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, displays and positions the component.
     *
     * @default false
     */
    get open(): boolean;
    set open(value: boolean);
    /**
     * When `true`, disables the closing of the component when clicked outside.
     *
     * @default false
     */
    outsideCloseDisabled: boolean;
    /**
     * Determines where the component will be positioned.
     *
     * @default "inline-start"
     */
    position: LogicalFlowPosition;
    /**
     * When `true`, the component is resizable.
     *
     * @default false
     */
    resizable: boolean;
    /**
     * When `position` is `"inline-start"` or `"inline-end"`, specifies the width of the component.
     *
     * @deprecated Use the `width` property instead.
     * @default "m"
     */
    widthScale: Scale;
    /** Specifies the width of the component. */
    width: Extract<Width, Scale>;
    /**
     * Sets focus on the component's "close" button - the first focusable item.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /**
     * Updates the element(s) that are included in the focus-trap of the component.
     *
     * @param extraContainers - Additional elements to include in the focus trap. This is useful for including elements that may have related parts rendered outside the main focus trapping element.
     */
    updateFocusTrapElements(extraContainers?: FocusTrapOptions["extraContainers"]): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteSheetBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteSheetBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteSheetClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteSheetOpen: TargetedEvent<this, void>;
    private messages: Partial<{
        resizeEnabled: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        resizeEnabled: string;
    }>;
}
