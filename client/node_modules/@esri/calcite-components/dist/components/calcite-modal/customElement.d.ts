/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Kind, Scale } from '../interfaces';
import { FocusTrapOptions } from '../../controllers/useFocusTrap';

/**
 * @deprecated Use the `calcite-dialog` component instead.
 * @slot [header] - A slot for adding header text.
 * @slot [content] - A slot for adding the component's content.
 * @slot [content-top] - A slot for adding content to the component's sticky header, where content remains at the top of the component when scrolling up and down.
 * @slot [content-bottom] - A slot for adding content to the component's sticky footer, where content remains at the bottom of the component when scrolling up and down.
 * @slot [primary] - A slot for adding a primary button.
 * @slot [secondary] - A slot for adding a secondary button.
 * @slot [back] - A slot for adding a back button.
 */
export declare class Modal extends LitElement {
    /** Passes a function to run before the component closes. */
    beforeClose: (el: HTMLCalciteModalElement) => Promise<void>;
    /**
     * When `true`, disables the component's close button.
     *
     * @default false
     */
    closeButtonDisabled: boolean;
    /**
     * When `true`, prevents the component from expanding to the entire screen on mobile devices.
     *
     * @default false
     */
    docked: boolean;
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
     * When `true`, sets the component to always be fullscreen. Overrides `widthScale` and `--calcite-modal-width` / `--calcite-modal-height`.
     *
     * @default false
     */
    fullscreen: boolean;
    /** Specifies the kind of the component, which will apply to top border. */
    kind: Extract<"brand" | "danger" | "info" | "success" | "warning", Kind>;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, displays and positions the component.
     *
     * @default false
     */
    get open(): boolean;
    set open(open: boolean);
    /**
     * When `true`, disables the closing of the component when clicked outside.
     *
     * @default false
     */
    outsideCloseDisabled: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the width of the component.
     *
     * @default "m"
     */
    widthScale: Scale;
    /**
     * Sets the scroll top of the component's content.
     *
     * @param top
     * @param left
     */
    scrollContent(top?: number, left?: number): Promise<void>;
    /**
     * Sets focus on the component's "close" button (the first focusable item).
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
    readonly calciteModalBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteModalBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteModalClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteModalOpen: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
    }>;
}
