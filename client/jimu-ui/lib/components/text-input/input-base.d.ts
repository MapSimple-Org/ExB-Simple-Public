import { React } from 'jimu-core';
export type InputType = 'text' | 'email' | 'select' | 'file' | 'radio' | 'checkbox' | 'textarea' | 'button' | 'reset' | 'submit' | 'date' | 'datetime-local' | 'hidden' | 'image' | 'month' | 'number' | 'range' | 'search' | 'tel' | 'url' | 'week' | 'password' | 'datetime' | 'time' | 'color';
export interface InputBaseProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * The type attribute applied to the root input element.
     */
    type?: InputType | 'switch';
    /**
     * Defines the size of the component.
     * @default default
     */
    size?: 'lg' | 'sm' | 'default';
    /**
     * Tag name used for the root input element.
     */
    tag?: React.ElementType;
}
export declare const InputBase: React.ForwardRefExoticComponent<InputBaseProps & React.RefAttributes<HTMLInputElement>>;
