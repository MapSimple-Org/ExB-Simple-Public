import { React } from 'jimu-core';
import { type CollapseProps } from '../collapse';
export interface BaseCollapsablePanelProps extends Omit<CollapseProps, 'ref' | 'children'> {
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * If lacking, provide an aria-label.
     */
    'aria-label'?: string;
    /**
     * Whether to show the bottom line.
     * @default false
     */
    bottomLine?: boolean;
    /**
     * The header of the component.
     */
    header: React.ReactNode;
    /**
     * If true, the children will be hidden but do not unmount when isOpen is false.
     * @default false
     * @ignore
     */
    keepMount?: boolean;
    /**
     * The children of this component.
     */
    children?: React.ReactNode;
}
export declare const BaseCollapsablePanel: (props: BaseCollapsablePanelProps) => import("@emotion/react/jsx-runtime").JSX.Element;
