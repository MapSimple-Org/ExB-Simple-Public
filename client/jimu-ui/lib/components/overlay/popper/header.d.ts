import { React } from 'jimu-core';
import type { StandardComponentProps } from '../../types';
export interface PanelHeaderAction {
    name: string;
    label?: string;
    icon: any;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    ref?: React.RefObject<HTMLButtonElement>;
}
export interface PanelHeaderProps extends StandardComponentProps {
    /**
     * The type of this component.
     * @default default
     */
    type?: 'default' | 'primary';
    /**
     * If `true`, Set the cursor as `move`
     */
    moveable?: boolean;
    /**
     * The text that this component displays
     */
    title?: React.ReactNode;
    /**
     * if `false`, hide close button
     */
    showClose?: boolean;
    /**
     * @ignore
     */
    closeButtonRef?: React.RefObject<HTMLButtonElement>;
    /**
     * Be invoked when clicking the close button
     */
    onClose?: (e: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * @ignore
     *
     * Customize some actions
     *
     * Note: `actions` and `showClose` are mutually exclusive,
     * `actions` have higher priority, and up to 3 actions are allowed
     */
    actions?: PanelHeaderAction[];
    /**
     * @ignore
     */
    level?: 1 | 2;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
export declare const PanelHeader: React.NamedExoticComponent<PanelHeaderProps>;
