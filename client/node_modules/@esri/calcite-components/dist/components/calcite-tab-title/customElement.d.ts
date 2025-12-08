/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { FlipContext, Scale } from '../interfaces';
import { TabChangeEventDetail, TabCloseEventDetail } from '../calcite-tab/interfaces';
import { TabID, TabLayout, TabPosition } from '../calcite-tabs/interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';

/**
 * Tab-titles are optionally individually closable.
 *
 * @slot  - A slot for adding text.
 */
export declare class TabTitle extends LitElement {
    /**
     * When `true`, a close button is added to the component.
     *
     * @default false
     */
    closable: boolean;
    /**
     * When `true`, does not display or position the component.
     *
     * @default false
     */
    closed: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the position of `calcite-tab-nav` and `calcite-tab-title` components in relation to, and is inherited from the parent `calcite-tabs`, defaults to `top`.
     *
     *  `@internal`
     *
     * @default "top"
     */
    position: TabPosition;
    /**
     * When `true`, the component and its respective `calcite-tab` contents are selected.
     *
     * Only one tab can be selected within the `calcite-tabs` parent.
     *
     * @default false
     */
    selected: boolean;
    /**
     * Specifies a unique name for the component.
     *
     * When specified, use the same value on the `calcite-tab`.
     */
    tab: string;
    /** Returns the index of the title within the `calcite-tab-nav`. */
    getTabIndex(): Promise<number>;
    /** Fires when a `calcite-tab` is selected. */
    readonly calciteTabsActivate: TargetedEvent<this, void>;
    /** Fires when a `calcite-tab` is closed. */
    readonly calciteTabsClose: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
    }>;
}
