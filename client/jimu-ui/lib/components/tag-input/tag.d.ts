import { React } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
/**
* The Tag component props.
*/
export interface TagProps extends StandardComponentProps {
    /**
     * Defines the role added to the element.
     * @default button
     */
    role?: React.AriaRole;
    /**
     * The color of the component. It supports those theme colors that make sense for this component.
     * @default default
     */
    color?: BrandFunctionColors | 'default';
    /**
     * The variant of the component. It defines the style of the component.
     */
    variant?: 'contained' | 'outlined';
    /**
     * The label of the tag.
     */
    label?: string;
    /**
     * The element tag used of the component.
     * @default span
     */
    tag?: React.ElementType;
    /**
     * Callback fired when the delete icon is clicked. If set, the delete icon will be shown.
     * @event
     */
    onDelete?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLLIElement | HTMLSpanElement>) => void;
}
/**
 * The Tag component is used to display a tag with a label and an optional delete icon.
 *
 * ```ts
 * import { Tag } from 'jimu-ui'
 * ```
 */
export declare const Tag: React.ForwardRefExoticComponent<TagProps & React.RefAttributes<HTMLLIElement>>;
