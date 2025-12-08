import { React } from 'jimu-core';
import { type SwitchBaseProps } from './base';
/**
 * The `Switch` component props.
 */
export interface SwitchProps extends Omit<SwitchBaseProps, 'size' | 'indeterminate' | 'tag' | 'onBlur' | 'onFocus'> {
    /**
     * A string representing the value of the switch. This is not displayed on the client-side, but on the server this is the value given to the data submitted with the switch's name.
     */
    value?: string;
    /**
     * To define the size of the switch component.
     * @default default
     */
    size?: 'default' | 'sm';
}
/**
* The `Switch` component provides the user the ability to toggle the state of a single setting on and off.
*
* ```ts
* import { Switch } from 'jimu-ui'
* ```
*/
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
