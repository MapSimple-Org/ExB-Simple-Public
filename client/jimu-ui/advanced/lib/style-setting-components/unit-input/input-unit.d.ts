import { React } from 'jimu-core';
import { type BaseUnitInputProps } from './base-unit-input';
import type { DistanceUnits } from './unit-selector';
import type { LinearUnit } from 'jimu-ui';
export type InputUnitValue = LinearUnit | string;
/**
 * The `InputUnit` component props.
 */
export interface InputUnitProps extends Omit<BaseUnitInputProps, 'value' | 'onChange'> {
    /**
     * Supported units for this component.
     * @default ['px']
     */
    units?: DistanceUnits[];
    /**
     * The value of component.
     */
    value?: InputUnitValue;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: LinearUnit, evt?: React.KeyboardEvent<HTMLInputElement>) => void;
}
/**
 * The `InputUnit` component allows users to set units and values.
 *
 * ```ts
 * import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const InputUnit: (props: InputUnitProps) => import("@emotion/react/jsx-runtime").JSX.Element;
