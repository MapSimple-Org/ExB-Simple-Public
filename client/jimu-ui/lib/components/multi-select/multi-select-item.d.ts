import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
export interface MultiSelectItemProps extends StandardComponentProps {
    /**
     * If `true`, the component will be disabled.
     */
    disabled?: boolean;
    /**
    * Identity value of the item
    */
    value: string | number;
    /**
     * Label assigned for the item
     */
    label: string;
    /**
     * Indicates whether the item is disabled
     */
    selected?: boolean;
    /**
    * Fire callback when the component is clicked.
    */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * The children of the item.
     * If the children is provided, it will be rendered instead of the label.
     */
    children?: React.ReactNode | ((props: MultiSelectItemProps) => React.ReactNode);
}
export declare const MultiSelectItem: (props: MultiSelectItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
