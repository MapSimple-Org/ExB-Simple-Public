import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
interface ColorSwatchBlockProps extends StandardComponentProps {
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
     * Whether this component is disabled
     */
    disabled?: boolean;
    /**
     * Whether this component is selected
     */
    selected?: boolean;
    /**
     * The size of the color swatch block.
     * @default 20
     */
    size?: number;
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
export declare const ColorSwatchBlock: React.FC<ColorSwatchBlockProps>;
export {};
