import { React } from 'jimu-core';
import { FontFamilyValue } from 'jimu-ui';
export interface FontFamilySelectorProps {
    'aria-label'?: string;
    className?: string;
    style?: React.CSSProperties;
    /**
     * One value of enum FontFamilyValue
     */
    font?: FontFamilyValue;
    onChange?: (font: string) => void;
}
/**
 * A react component for choosing a font we support
 */
export declare const FontFamilySelector: (props: FontFamilySelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
