import { type BoxShadowStyle, type StandardComponentProps } from 'jimu-ui';
/**
 * The `BoxShadowSettingProps` component props.
 */
export interface BoxShadowSettingProps extends StandardComponentProps {
    /**
     * Box shadow style, including offsetX, offsetY, blur, spread and color
     */
    value?: BoxShadowStyle;
    /**
     * Define the text displayed in the input when the component has no value.
     */
    placeholder?: string;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: BoxShadowStyle) => void;
}
/**
 * The `BoxShadowSetting` component allows users to set box-shadow style (offsetX, offsetY, blur, spread and color).
 *
 * ```ts
 * import { BoxShadowSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const BoxShadowSetting: (props: BoxShadowSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
