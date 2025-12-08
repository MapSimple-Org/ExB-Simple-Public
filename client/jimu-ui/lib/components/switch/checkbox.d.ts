import { React } from 'jimu-core';
import { type SwitchBaseProps } from './base';
/**
 * The `Checkbox` component props.
 */
export interface CheckboxProps extends Omit<SwitchBaseProps, 'size' | 'tag' | 'onBlur' | 'onFocus'> {
    /**
     * A string representing the value of the checkbox. This is not displayed on the client-side, but on the server this is the value given to the data submitted with the checkbox's name.
     */
    value?: string;
}
/**
 * The `Checkbox` component allows the user to select one or more items from a set.
 *
 * ```ts
 * import { Checkbox } from 'jimu-ui'
 * ```
 */
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
