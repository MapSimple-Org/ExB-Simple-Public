import { React } from 'jimu-core';
import { type CollapsableBaseHeaderProps } from './base';
export interface CollapsableHeaderProps extends CollapsableBaseHeaderProps {
    /**
     * The right icon displayed after the label.
     */
    rightIcon?: any;
    /**
     * The active icon displayed after the label.
     */
    rightActiveIcon?: any;
    /**
     * The left icon displayed before the label.
     */
    leftIcon?: any;
    /**
     * The label displayed in the header of the component.
     */
    label?: React.ReactNode;
    /**
     * Whether to wrap label.
     * @default false
     */
    wrapLabel?: boolean;
    /**
     * Whether this component is disabled.
     * @default false
     */
    disabled?: boolean;
}
declare const CollapsableHeader: (props: CollapsableHeaderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CollapsableHeader;
