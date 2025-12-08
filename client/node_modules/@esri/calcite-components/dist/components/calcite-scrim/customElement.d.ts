/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';

/** @slot  - A slot for adding custom content, primarily loading information. */
export declare class Scrim extends LitElement {
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    private messages: Partial<{
        loading: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        loading: string;
    }>;
}
