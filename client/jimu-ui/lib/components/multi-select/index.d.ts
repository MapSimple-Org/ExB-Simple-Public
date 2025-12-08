import { React, type ImmutableArray } from 'jimu-core';
import { type MultiSelectItemProps } from './multi-select-item';
import type { StandardComponentProps } from '../types';
import type { SelectProps } from '../select';
/**
 * The MultiSelect component props.
 */
export interface MultiSelectProps extends Pick<SelectProps, 'aria-label' | 'aria-describedby' | 'a11y-description'>, StandardComponentProps {
    /**
     * The ref to the button element.
     */
    buttonRef?: React.Ref<HTMLButtonElement>;
    /**
     * Defines the title added to the element.
     * If not provided, the title will be computed from the selected values.
     */
    title?: string;
    /**
     * Whether to show an arrow icon at the end of the button.
     * @default true
     */
    arrow?: boolean;
    /**
     * The items of the select component.
     * @deprecated Use children instead.
     */
    items?: ImmutableArray<MultiSelectItemProps> | MultiSelectItemProps[];
    /**
     * Selected values array
     */
    values?: ImmutableArray<string | number> | Array<string | number>;
    /**
     * The values of the items selected by default
     */
    defaultValues?: ImmutableArray<string | number> | Array<string | number>;
    /**
     * The hint text displayed when the input is empty
     */
    placeholder?: string;
    /**
     * This determines where to place the select list within the DOM.
     * If true, it will be placed in the `jimu-overlays-container` inside `document.body`.
     * If false, it will be placed in its current parent node.
     * @default true
     */
    appendToBody?: boolean;
    /**
     * The size of the dropdown button
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * If `true`, the multi-select will be disabled.
     */
    disabled?: boolean;
    /**
     *  Display the result text in the input box. Examples of the result texts are as "label1, label2, label3..."
     */
    displayByValues?: (values: Array<string | number>) => string;
    /**
     * Callback fired when the component is clicked.
     */
    onClick?: React.MouseEventHandler;
    /**
     * Callback fired when the item is clicked.
     * @event
     * @deprecated Use `onChange` instead.
     */
    onClickItem?: (evt: React.MouseEvent, value: string | number, selectedValues: Array<string | number>) => void;
    /**
     * Callback fired when the value is changed.
     */
    onChange?: (value: string | number, values: Array<string | number>) => void;
    /**
     * The content of the select component.
     */
    children?: React.ReactNode;
}
/**
 * The `MultiSelect` component is used to select multiple options from a `DropdownMenu`.
 *
 * ```ts
 * import { MultiSelect } from 'jimu-ui'
 * ```
 */
export declare const MultiSelect: React.NamedExoticComponent<MultiSelectProps & React.RefAttributes<HTMLDivElement>>;
export * from './multi-select-item';
