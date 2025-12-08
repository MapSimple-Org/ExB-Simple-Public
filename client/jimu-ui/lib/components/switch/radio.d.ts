import { type SwitchBaseProps } from './base';
import { React } from 'jimu-core';
/**
 * The `Radio` component props.
 */
export interface RadioProps extends Omit<SwitchBaseProps, 'size' | 'tag' | 'htmlSize' | 'indeterminate'> {
    /**
     * The value attribute is a string containing the radio button's value. The value is never shown to the user by their user agent. Instead, it's used to identify which radio button in a group is selected.
     */
    value?: string;
}
/**
 * The `Radio` component provides the user the option to select a singular option from a set.
 *
 * Wrap `Radio` and `Label` in back-ticks.
 *
 * ```ts
 * import { Radio } from 'jimu-ui'
 * ```
 */
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
