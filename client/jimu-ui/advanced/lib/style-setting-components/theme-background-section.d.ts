import { type BackgroundStyle } from 'jimu-ui';
/**
 * The `ThemeBackgroundSection` component props.
 */
export interface ThemeBackgroundSectionProps {
    /**
     * The value of this component, including the background color, background image, and the fill type of background image
     */
    background?: BackgroundStyle;
    /**
     * Invoked when the background value changes.
     */
    onChange?: (background: BackgroundStyle) => void;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    hasForeground?: boolean;
    foreground?: string;
    onForegroundChange?: (foreground: string) => void;
    onBothChange?: (background: BackgroundStyle, foreground: string) => void;
}
export declare function ThemeBackgroundSection(props: ThemeBackgroundSectionProps): import("@emotion/react/jsx-runtime").JSX.Element;
