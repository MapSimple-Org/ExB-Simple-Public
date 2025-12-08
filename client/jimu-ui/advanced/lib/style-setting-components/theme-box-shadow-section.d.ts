import { type BoxShadowStyle } from 'jimu-ui';
export interface ThemeBoxShadowSectionProps {
    /**
     * The value of this component, including the color, offset, etc.
     */
    value?: BoxShadowStyle;
    /**
     * Invoked when the box shadow value changes.
     */
    onChange?: (value: BoxShadowStyle) => void;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
}
export declare function ThemeBoxShadowSection(props: ThemeBoxShadowSectionProps): import("@emotion/react/jsx-runtime").JSX.Element;
