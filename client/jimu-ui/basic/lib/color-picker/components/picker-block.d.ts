import { React } from 'jimu-core';
import { type ColorBlockProps } from './color-block';
/**
 * The PickerBlock component props.
 */
export interface PickerBlockProps extends Omit<ColorBlockProps, 'role' | 'outline' | 'shape'> {
    /**
     * The type of this component.
     * @default default
     */
    type?: 'default' | 'with-icon' | 'icon-only' | 'label-icon';
    /**
     * If `true`, show color by using borders.
     * Note: only valid when `type` is `default`.
     */
    outline?: boolean;
    /**
     * The icon of this component.
     */
    icon?: React.ReactElement | string;
    /**
     * The label displayed on the component.
     * Only valid when `type` is `label-icon`.
     */
    label?: string;
    /**
     * The color of the label icon.
     * Only valid when `type` is `label-icon` or `icon-only`.
     */
    textColor?: string;
    /**
     * If `true`, set background to transparent.
     * Note: only valid when `type` is not `default`.
     */
    noBackground?: boolean;
}
/**
 * The PickerBlock component is a customizable block for color picker.
 *
 * ```ts
 * import { PickerBlock } from 'jimu-ui/basic/color-picker'
 * ```
 */
export declare const PickerBlock: React.ForwardRefExoticComponent<PickerBlockProps & React.RefAttributes<HTMLDivElement>>;
