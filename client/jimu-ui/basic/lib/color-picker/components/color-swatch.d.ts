import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
export interface ColorItem {
    label: string;
    value: string;
    color?: string;
}
/**
 * The ColorSwatch component props.
 */
export interface ColorSwatchProps extends StandardComponentProps {
    /**
     * Defines the ARIA role of the color swatch element.
     * @default radiogroup
     */
    role?: React.AriaRole;
    /**
     * Provides an accessible label for the color swatch.
     */
    'aria-label'?: string;
    /**
     * The currently selected color value.
     */
    color?: string;
    /**
     * List of available color options, either as ColorItem objects or color strings.
     */
    colors?: ColorItem[] | string[];
    /**
     * If true, the color swatch fills the available space.
     * @default false
     */
    fill?: boolean;
    /**
     * The size of the color swatch block.
     * @default 15
     */
    size?: number;
    /**
     * The shape of the color swatch: 'circular', 'square', or 'rounded'.
     */
    shape?: 'circular' | 'square' | 'rounded';
    /**
     * Callback function called when the color value changes.
     */
    onChange?: (color: string) => void;
}
export declare const PRESET_COLORS: string[];
export declare const THEME_CUSTOM_PRESET_COLORS: string[];
/**
 * The ColorSwatch component displays a collection of color options for selection.
 *
 * ```ts
 * import { ColorSwatch } from 'jimu-ui/basic/color-picker'
 * ```
 */
export declare const ColorSwatch: (props: ColorSwatchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
