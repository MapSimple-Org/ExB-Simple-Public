import { React } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import { type SupportedUnits } from './unit-selector';
export interface UnitValue {
    val: number;
    unit: SupportedUnits;
}
export type BaseUnitValue = UnitValue | string;
/**
 * The `BaseUnitInput` component props.
 */
export interface BaseUnitInputProps extends StandardComponentProps {
    /**
     * Specifies the legal number intervals
     */
    step?: number;
    /**
     * Define the text displayed in the input when the component has no value.
     */
    placeholder?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * Supported units for this component.
     * @default ['px']
     */
    units?: SupportedUnits[];
    /**
     * The value of component.
     */
    value?: BaseUnitValue;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Disable input and selection of units.
     * @default false
     */
    disabled?: boolean;
    /**
     * Specifies the precision length of the value (number of decimal digits).
     */
    precision?: number;
    /**
     * The minimum value to accept for the input component.
     */
    min?: number;
    /**
     * The maximum value to accept for the input component.
     */
    max?: number;
    /**
    * If `true`, the input value should not be empty.
    */
    required?: boolean;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: UnitValue | null, evt?: React.KeyboardEvent<HTMLInputElement>) => void;
}
/**
 * The `BaseUnitInput` component allows users to set units and values.
 *
 * ```ts
 * import { BaseUnitInput } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const BaseUnitInput: (props: BaseUnitInputProps) => import("@emotion/react/jsx-runtime").JSX.Element;
