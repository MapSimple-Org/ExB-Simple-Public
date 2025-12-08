import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The common props for the 'switch' type components, such as Radio, Checkbox, and Switch.
 * Note: This is the props for an internal component, don't use it directly
 */
export interface SwitchBaseProps extends StandardComponentProps {
    /**
     * The unique id added to the element.
     */
    id?: string;
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * The `tabIndex` added to the element.
     */
    tabIndex?: number;
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole;
    /**
     * Name of the form control. Submitted with the form as part of a name/value pair.
     */
    name?: string;
    /**
     * To provide a label for interactive components for accessibility purposes,
     * if the label is next to this component DOM node, use <label /> with the original component to bind them automatically;
     * if there is no available label next to this DOM node, you should pass the aria-label to it.
     */
    'aria-label'?: string;
    /**
     * The type of `SwitchBaseComponent`
     * @ignore
     * @default checkbox
     */
    type?: 'checkbox' | 'radio' | 'switch';
    /**
     * If true, the component is checked.
     */
    checked?: boolean;
    /**
     * @ignore
     */
    defaultChecked?: boolean;
    /**
     * If true, the component will be disabled.
     */
    disabled?: boolean;
    /**
     * If `true`, the component is focused.
     * @ignore
     */
    focus?: boolean;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLInputElement>;
    /**
     * Fire callback when the component gains focus.
     */
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    /**
    * Fire callback when the component loses focus.
    */
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    /**
     * Callback fires when the `checked` state is changed.
     * @event
     */
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    /**
     * If `true`, the component is indeterminate, regardless of `checked`.
     */
    indeterminate?: boolean;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The base component that provides the common methods and UI for Checkbox, Radio and Switch components.
 * Note: This is an internal component don't use it directly
 */
export declare const SwitchBase: React.ForwardRefExoticComponent<SwitchBaseProps & React.RefAttributes<HTMLInputElement>>;
