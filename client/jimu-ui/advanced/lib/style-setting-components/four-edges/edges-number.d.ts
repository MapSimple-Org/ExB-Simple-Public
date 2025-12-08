import { type FourSidesUnit, DistanceUnits, type StandardComponentProps } from 'jimu-ui';
export interface EdgesNumberProps extends StandardComponentProps {
    /**
     * The type of this component.
     * @default edge
     */
    type: 'edge' | 'corner';
    /**
     * Specifies the legal number intervals
     */
    step?: number;
    /**
     * Define the text displayed in the input when the component has no value.
     */
    placeholder?: string;
    /**
     * The value of this component.
     * @default {number:[0,0,0,0],unit:px}
     */
    value: FourSidesUnit;
    /**
     * If `true`, four values can be set separately.
     */
    detached?: boolean;
    /**
     * Call back the currently activated index.
     */
    onActivatedChange?: (activated: -1 | 0 | 1 | 2 | 3) => void;
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
     * Disable input and selection of all the input boxes.
     * @default false
     */
    disabled?: boolean;
    /**
     * Selectable units: px, rem, em, %.
     * @default ['px','%']
     */
    units?: DistanceUnits[];
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: FourSidesUnit) => void;
    /**
     * Aria-label for unified mode (detached is false).
     * @ignore
     */
    unifiedAriaLabel?: string;
    /**
     * Title for for unified mode (detached is false).
     * @ignore
     */
    unifiedTitle?: string;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
}
export declare const EdgesNumber: (props: EdgesNumberProps) => import("@emotion/react/jsx-runtime").JSX.Element;
