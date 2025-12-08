import { React } from 'jimu-core';
import { type DropdownItemProps } from '../dropdown';
/**
 * The SelectOption component props.
 */
export interface SelectOptionProps extends Omit<DropdownItemProps, 'onClick'> {
    /**
     * The label of the dropdown item.
     * @deprecated Use `children` instead.
     */
    label?: string;
    /**
     * Input element value. It is used to display value when the component is controlled.
     */
    value?: string | number;
    /**
    * Fire callback when the root element is clicked.
    */
    onClick?: React.MouseEventHandler<HTMLOptionElement>;
}
/**
 * The options of the `DropdownMenu` in the Select component.
 *
 * ```ts
 * import { Option } from 'jimu-ui'
 * ```
 */
export declare const Option: React.ForwardRefExoticComponent<SelectOptionProps & React.RefAttributes<HTMLOptionElement>>;
