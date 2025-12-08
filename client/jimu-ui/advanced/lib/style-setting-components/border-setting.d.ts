import { type BorderStyle } from 'jimu-ui';
export type BorderSide = 'left' | 'top' | 'right' | 'bottom';
export interface BorderStyleProps {
    className?: string;
    style?: any;
    top?: BorderStyle;
    left?: BorderStyle;
    bottom?: BorderStyle;
    right?: BorderStyle;
    /**
     * Border style, including type, color, and width
     */
    value?: BorderStyle;
    /**
    * If `true`, the component can only set one border style.
    */
    singleMode?: boolean;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    onChange?: (param: BorderStyle) => void;
    onSideChange?: (side: BorderSide, param: BorderStyle) => void;
}
/**
 * The `BorderSetting` component allows users to set border styles.
 * ```ts
 * import { BorderSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const BorderSetting: (props: BorderStyleProps) => import("@emotion/react/jsx-runtime").JSX.Element;
