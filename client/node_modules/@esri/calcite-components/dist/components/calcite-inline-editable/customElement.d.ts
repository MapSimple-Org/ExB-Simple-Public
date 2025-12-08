/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { Scale } from '../interfaces';
import { Label } from '../calcite-label/customElement.js';

/** @slot  - A slot for adding a `calcite-input`. */
export declare class InlineEditable extends LitElement {
    /** Specifies a callback to be executed prior to disabling editing via the controls. When provided, the component's loading state will be handled automatically. */
    afterConfirm: () => Promise<void>;
    /**
     * When `true` and `editingEnabled` is `true`, displays save and cancel controls on the component.
     *
     * @default false
     */
    controls: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, inline editing is enabled on the component.
     *
     * @default false
     */
    get editingEnabled(): boolean;
    set editingEnabled(editingEnabled: boolean);
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies the size of the component. Defaults to the scale of the wrapped `calcite-input` or the scale of the closest wrapping component with a set scale. */
    scale: Scale;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Emits when the component's "cancel editing" button is pressed. */
    readonly calciteInlineEditableEditCancel: TargetedEvent<this, void>;
    /** Emits when the component's "confirm edits" button is pressed. */
    readonly calciteInlineEditableEditConfirm: TargetedEvent<this, void>;
    private messages: Partial<{
        enableEditing: string;
        cancelEditing: string;
        confirmChanges: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        enableEditing: string;
        cancelEditing: string;
        confirmChanges: string;
    }>;
}
