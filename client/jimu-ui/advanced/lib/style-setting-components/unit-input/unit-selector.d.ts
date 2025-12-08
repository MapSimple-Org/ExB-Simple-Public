import { type DistanceUnits as _DistanceUnits } from 'jimu-ui';
export type DateUnits = 'year' | 'month' | 'day';
export type DateWeekUnits = 'year' | 'month' | 'week' | 'day';
export type TimeUnits = 'hour' | 'minute' | 'second';
export type DateTimeUnits = DateWeekUnits | TimeUnits;
export type DistanceUnits = `${_DistanceUnits}`;
export type SupportedUnits = DistanceUnits | DateTimeUnits;
export declare const UnitSelectorDateUnits: DateUnits[];
export declare const UnitSelectorDateWeekUnits: DateWeekUnits[];
export declare const UnitSelectorTimeUnits: TimeUnits[];
export interface UnitSelectorProps {
    /**
     * The unit displayed.
     * @deprecated use `value` instead.
     */
    unit?: SupportedUnits;
    /**
     * The value for this component.
     */
    value?: SupportedUnits;
    /**
     * Supported units for this component.
     * @default ['px']
     */
    units?: SupportedUnits[];
    /**
     * Invoked when the value changes.
     */
    onChange?: (unit: SupportedUnits) => void;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    /**
     * Defines the style added to the element.
     */
    style?: any;
    /**
     * The title of the component.
     */
    title?: string;
    /**
     * If `true`, the component will be disabled.
     * @default false
     */
    disabled?: boolean;
}
export declare const UnitSelector: (props: UnitSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
