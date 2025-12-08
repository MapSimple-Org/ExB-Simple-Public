import { React } from 'jimu-core';
export interface CollapsableLabelProps {
    /**
    * Defines the class name of the component.
    */
    className?: string;
    /**
     * The left icon displayed before the label.
     */
    leftIcon?: any;
    /**
     * The label displayed in the header of the component.
     */
    label?: React.ReactNode;
    /**
     * Reduce the maximum width of the label.
     */
    padded?: boolean;
    /**
     * Whether to wrap the label.
     * @default false
     */
    wrap?: boolean;
}
declare const CollapsableLabel: (props: CollapsableLabelProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CollapsableLabel;
