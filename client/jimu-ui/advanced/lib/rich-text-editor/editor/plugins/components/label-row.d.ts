import { React } from 'jimu-core';
/**
 * Props for the `SettingRow` component.
 */
export interface LabelRowProps {
    /**
     * To provide a role for row
     */
    role?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * If lacking, provide an aria-label.
     */
    'aria-label'?: string;
    /**
     * @ignore
     * Three different levels of label
     */
    level?: 1 | 2 | 3;
    /**
     * Defines the label text for the setting row.
     */
    label?: string | React.JSX.Element;
    /**
     * Indicates whether the children should flow to the next line.
     * 'wrap' - the children will flow to the next line.
     * 'no-wrap' - the children will stay in the line as the label.
     */
    flow?: 'wrap' | 'no-wrap';
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    /**
     * Indicates whether to truncate long label text.
     */
    truncateLabel?: boolean;
    /**
     * The children of this component.
     */
    children?: React.ReactNode;
}
export declare const LabelRow: (props: LabelRowProps) => import("@emotion/react/jsx-runtime").JSX.Element;
