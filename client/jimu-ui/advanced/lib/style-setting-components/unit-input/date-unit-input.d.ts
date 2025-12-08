import { React } from 'jimu-core';
import type { InputUnitProps } from './input-unit';
import type { DateTimeUnits } from './unit-selector';
export interface DateUnitInputValue {
    val: number;
    unit: DateTimeUnits;
}
/**
 * The `DateUnitInput` component props.
 */
export interface DateUnitInputProps extends Omit<InputUnitProps, 'units' | 'value' | 'onChange'> {
    /**
     * Supported units for this component.
     * @default ['px']
     */
    units?: DateTimeUnits[];
    /**
     * The value of component.
     */
    value?: DateUnitInputValue;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: DateUnitInputValue, evt?: React.KeyboardEvent<HTMLInputElement>) => void;
}
/**
 * The `DateUnitInput` component allows users to set date time units and values.
 *
 * ```ts
 * import { DateUnitInput } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const DateUnitInput: (props: DateUnitInputProps) => import("@emotion/react/jsx-runtime").JSX.Element;
