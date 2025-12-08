/** @jsx jsx */
import { type ImmutableObject } from 'jimu-core';
import { type NavigationVariant } from 'jimu-ui';
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled';
/**
 * The `NavStyleSettingByState` components props.
 */
export interface NavStyleSettingByStateProps {
    /**
     * The value of this component.
     */
    variant?: ImmutableObject<NavigationVariant>;
    /**
     * Callback when values change.
     */
    onChange?: (state: ComponentState, key: string, value: any) => void;
    /**
     * Specifies the state of the setting.
     */
    states?: ComponentState[];
    /**
     * Whether to display icon-related settings.
     */
    icon?: boolean;
    /**
     * Whether to display text-related settings.
     */
    text?: boolean;
    /**
     * Whether to display text style settings.
     */
    hideTextStyle?: boolean;
    /**
     * Whether to display icon related settings in text settings.
     */
    iconInText?: boolean;
    /**
     * For border settings, whether to only set its color.
     */
    onlyBorderColor?: boolean;
    /**
     * Callback when reset some styles.
     */
    onWholeVariantChange?: (variant: ImmutableObject<NavigationVariant>) => void;
}
/**
 * The `NavStyleSettingByState` component is used to provide the user the ability to setting styles for nav related widget.
 *
 * Note: use in Builder only.
 */
export declare const NavStyleSettingByState: (props: NavStyleSettingByStateProps) => import("@emotion/react/jsx-runtime").JSX.Element;
