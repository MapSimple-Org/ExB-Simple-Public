import { type IMThemeVariables } from 'jimu-core';
import { type IconPickerProps } from 'jimu-ui/advanced/resource-selector';
export interface NavIconPickerProps extends Omit<IconPickerProps, 'groups' | 'customIcons'> {
    size?: number;
    theme2?: IMThemeVariables;
}
export declare const NavIconPicker: (props: NavIconPickerProps) => import("@emotion/react/jsx-runtime").JSX.Element;
