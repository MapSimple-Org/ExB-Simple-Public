import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
/**
 * The ColorBlock component props.
 */
export interface ColorBlockProps extends StandardComponentProps {
    /**
     * The unique id added to the element.
     */
    id?: string;
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole;
    /**
    * The `tabIndex` added to the element.
    */
    tabIndex?: number;
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * The color of this component
     */
    color?: string;
    /**
     * The value of this component
     */
    value?: string;
    /**
     * The width of this component
     */
    width?: number | string;
    /**
     * The height of this component
     */
    height?: number | string;
    /**
     * Whether this component is disabled
     */
    disabled?: boolean;
    /**
     * Whether this component is activated
     */
    active?: boolean;
    /**
    * If `true`, show color by using borders.
    */
    outline?: boolean;
    /**
     * The shape of the pagination items.
     * @default square
     */
    shape?: 'circular' | 'square' | 'rounded';
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}
/**
 * The ColorBlock component is used to display a color block with a specific color, width, height, and other properties.
 *
 * ```ts
 * import { ColorBlock } from 'jimu-ui/basic/color-picker'
 * ```
 */
export declare const ColorBlock: React.ForwardRefExoticComponent<ColorBlockProps & React.RefAttributes<HTMLDivElement>>;
