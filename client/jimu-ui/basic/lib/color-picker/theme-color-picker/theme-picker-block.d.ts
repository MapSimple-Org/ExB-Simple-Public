import { React, type IMThemeVariables } from 'jimu-core';
import { type PickerBlockProps } from '../components';
/**
 * The ThemePickerBlock component props.
 */
export interface ThemePickerBlockProps extends Omit<PickerBlockProps, 'color' | 'onChange'> {
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * With this prop, it will be spliced with the value of the component as a accessible name.
     */
    'aria-label'?: string;
    /**
   * The theme to get colors. The default value is the theme in the theme context.
   */
    specificTheme?: IMThemeVariables;
}
/**
 * The `ThemePickerBlock` component is a block that allows users display a theme color.
 * @ignore Used for internal purposes.
 */
export declare const ThemePickerBlock: React.ForwardRefExoticComponent<ThemePickerBlockProps & React.RefAttributes<HTMLDivElement>>;
