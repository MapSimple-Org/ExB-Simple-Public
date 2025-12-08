/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { type FourSidesUnit, DistanceUnits, type BorderSides, Sides } from 'jimu-ui';
/**
 * The `FourSides` component props.
 */
export interface FourSidesProps {
    /**
     * Selectable units: px, rem, em, %.
     * @default ['px','%']
     */
    units?: DistanceUnits[];
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    /**
     * The value of this component.
     * @default {number:[0],unit:px}
     */
    value?: FourSidesUnit;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: FourSidesUnit) => void;
    /**
     * Disable input and selection of all the input boxes.
     * @default false
     */
    disabled?: boolean;
    /**
     * The minimum value to accept for all the input boxes.
     * @default 0
     */
    min?: number;
    /**
     * The maximum value to accept for all the input boxes.
     * @default 100
     */
    max?: number;
    /**
     * WWhether to display the prompt text.
     * @default true
     */
    showTip?: boolean;
    /**
     * Define the label for the four input boxes.
     * @default ['T','R','B','L']
     */
    sides?: Array<BorderSides | Sides>;
}
interface State {
    bindAll: boolean;
}
interface ExtraProps {
    intl?: IntlShape;
}
/**
 * The `FourSides` component allows users to set the values of four edges or four corners of the box.
 * @deprecated
 * Use `FourEdges` or `Padding` or `BorderRadiusSetting` conponents instead.
 * ```ts
 * import { FourSides } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare class _FourSides extends React.PureComponent<FourSidesProps & ExtraProps, State> {
    static defaultProps: Partial<FourSidesProps>;
    constructor(props: any);
    _onSideValueChange: (val: any, index: number) => void;
    _onUnitChange: (newUnit: any) => void;
    _onAllSidesValueChange: (value: number) => void;
    _toggleBindAll: () => void;
    nls: (id: string) => string;
    handleAcceptValue: (value: any, index: number) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * The `FourSides` component allows users to set the values of four edges or four corners of the box.
 * @deprecated
 * Use `FourEdges` or `Padding` or `BorderRadiusSetting` conponents instead.
 * ```ts
 * import { FourSides } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const FourSides: import("@emotion/styled").StyledComponent<Omit<any, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
