import { React } from 'jimu-core';
import { type CollapsableBaseHeaderProps } from './base';
export interface CollapsableToggleHeaderProps extends CollapsableBaseHeaderProps {
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
declare const CollapsableToggleHeader: (props: CollapsableToggleHeaderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CollapsableToggleHeader;
