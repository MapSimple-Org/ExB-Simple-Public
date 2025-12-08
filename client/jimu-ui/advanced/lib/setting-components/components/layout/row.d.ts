import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
/**
 * The SettingRow component props.
 */
export interface SettingRowProps extends StandardComponentProps {
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
     * @default 3
     */
    level?: 1 | 2 | 3;
    /**
     * Defines the label text for the setting row.
     */
    label?: React.ReactNode;
    /**
     * The tag of the component.
     * If the tag is 'label', clicking on the label will trigger the form child element.
     * @default div
     */
    tag?: 'div' | 'label';
    /**
     * Indicates whether the children should flow to the next line.
     * 'wrap' - the children will flow to the next line.
     * 'no-wrap' - the children will stay in the line as the label.
     */
    flow?: 'wrap' | 'no-wrap';
    /**
     * Indicates whether to indent the row.
     */
    indented?: boolean;
    /**
     * Indicates whether to truncate long label text.
     */
    truncateLabel?: boolean;
    /**
     * The children of this component.
     */
    children?: React.ReactNode;
    /**
     * Whether to show the bottom line.
     * @default false
     */
    bottomLine?: boolean;
}
/**
 * The `SettingRow` component allows users to display setting content in a row.
 * Use this component inside of the `SettingSection` component.
 *
 * ```ts
 * import { SettingRow } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare const SettingRow: React.ForwardRefExoticComponent<SettingRowProps & React.RefAttributes<HTMLDivElement>>;
