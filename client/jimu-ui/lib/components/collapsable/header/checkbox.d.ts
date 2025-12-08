import { type CollapsableBaseHeaderProps } from './base';
export interface CollapsableCheckboxHeaderProps extends CollapsableBaseHeaderProps {
    /**
      * The right icon displayed after the label.
      */
    rightIcon?: any;
    /**
     * The active icon displayed after the label.
     */
    rightActiveIcon?: any;
    /**
     * The label displayed in the header of the component.
     */
    label?: string;
    /**
     * The name used to identify the checkbox.
     */
    name?: string;
    /**
     * The checked status of the checkbox.
     */
    checked?: boolean;
    /**
     * The callback function when the checked status of the checkbox changes.
     */
    onCheckedChange?: (checked: boolean) => void;
    /**
     * Whether to disable action in unchecked state.
     * @default false
     * @ignore
     */
    disableActionForUnchecked?: boolean;
    /**
     * Whether to wrap label.
     * @default false
     */
    wrapLabel?: boolean;
}
declare const CollapsableCheckboxHeader: (props: CollapsableCheckboxHeaderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CollapsableCheckboxHeader;
