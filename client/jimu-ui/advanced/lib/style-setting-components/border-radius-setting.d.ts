import { type ImmutableObject } from 'jimu-core';
import { type FourSidesUnit } from 'jimu-ui';
import { type FourEdgesProps } from './four-edges';
/**
 * The `BorderRadiusSetting` component props.
 */
export interface BorderRadiusSettingProps extends Omit<FourEdgesProps, 'type' | 'value' | 'onChange' | 'unifiedAriaLabel' | 'unifiedTitle'> {
    /**
     * The value of this component.
     */
    value: ImmutableObject<FourSidesUnit>;
    /**
     * Invoked when the value changes.
     */
    onChange: (value: ImmutableObject<FourSidesUnit>) => void;
}
/**
 * The `BorderRadiusSetting` component allows users to set the border radius of the box.
 *
 * ```ts
 * import { BorderRadiusSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const BorderRadiusSetting: (props: BorderRadiusSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
