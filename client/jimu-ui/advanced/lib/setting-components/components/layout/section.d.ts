import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
/**
 * The SettingSection component props.
 */
export interface SettingSectionProps extends StandardComponentProps {
    /**
     * To provide a role for section
     */
    role?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * If lacking, provide an aria-label.
     */
    'aria-label'?: string;
    /**
     * The aria-describedby attribute lists the ids of the elements that describe the object. It is used to establish a relationship between widgets or groups and the text that describes them.
     * @ignore
     */
    'aria-describedby'?: string;
    /**
     * Defines the title text for the setting section.
     */
    title?: React.ReactNode;
    /**
     * The children of this component.
     */
    children?: React.ReactNode;
}
/**
 * The `SettingSection` component allows users to display setting content as a section.
 * Use this component to wrap `SettingRow` component(s).
 *
 * ```ts
 * import { SettingSection } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare const SettingSection: React.ForwardRefExoticComponent<SettingSectionProps & React.RefAttributes<HTMLDivElement>>;
