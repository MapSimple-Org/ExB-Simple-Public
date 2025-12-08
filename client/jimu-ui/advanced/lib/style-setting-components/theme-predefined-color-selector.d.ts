import { type StandardComponentProps } from 'jimu-ui';
export interface ThemePredefinedColorSelectorProps extends StandardComponentProps {
    isDarkTheme: boolean;
    /**
     * The title of this component
     */
    title?: string;
    /**
     * The value of this component, including the background color, background image, and the fill type of background image
     */
    value?: string;
    /**
     * The color list used in the dropdown menu.
     */
    colorList?: string[];
    /**
     * Whether the custom color is selected
     */
    isCustom?: boolean;
    /**
     * Invoked when the background value changes.
     */
    onChange?: (value: string) => void;
    /**
     * Invoked when the custom color is clicked.
     */
    onCustomClick?: () => void;
    /**
     * The variant of the component.
     * @default contained
     */
    variant?: 'contained' | 'outlined';
}
export declare const ThemePredefinedColorSelector: (props: ThemePredefinedColorSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
