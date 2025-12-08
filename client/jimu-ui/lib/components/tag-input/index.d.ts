import { React } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
/**
 * The TagInput component props.
 */
export interface TagInputProps extends StandardComponentProps {
    /**
   * The color of the tags displayed in the component. It supports those theme colors that make sense for this component.
   * @default default
   */
    color?: BrandFunctionColors | 'default';
    /**
     * The data list of the tag.
     * @deprecated Use `values` instead.
     */
    data?: string[];
    /**
     * The tags displayed in the input.
     */
    values?: string[];
    /**
     * The name attribute added to the input.
     */
    name?: string;
    /**
     * To provide a label for interactive components for accessibility purposes
     */
    'aria-label'?: string;
    /**
     * The placeholder text.
     */
    placeholder?: string;
    /**
     * The message shown when there are no suggestions.
     */
    emptyMessage?: string;
    /**
     * An array of suggestions that are used as basis for showing suggestions.
     */
    suggestions?: string[];
    /**
     * The select list data.
     * @deprecated Use `suggestions` instead.
     */
    selectListData?: string[];
    /**
     * The max height of the suggestion list.
     * @default 300
     */
    maxListHeight?: number;
    /**
     * Callback fired when the values is changed.
     */
    onChange?: (values: string[]) => void;
}
/**
 * The TagInput component is used to generate tags by inputting text or selecting from a given list.
 *
 * ```ts
 * import { TagInput } from 'jimu-ui'
 * ```
 */
export declare const TagInput: React.ForwardRefExoticComponent<TagInputProps & React.RefAttributes<HTMLDivElement>>;
export { Tag } from './tag';
