import { type ImmutableObject } from 'jimu-core';
import { type BorderStyle, type FourSidesUnit } from 'jimu-ui';
import { type BorderSide } from './border-setting';
export interface ThemeBorderSectionProps {
    border?: BorderStyle;
    borderTop?: BorderStyle;
    borderLeft?: BorderStyle;
    borderRight?: BorderStyle;
    borderBottom?: BorderStyle;
    borderRadius?: FourSidesUnit | ImmutableObject<FourSidesUnit>;
    /**
     * Invoked when the border value changes.
     */
    onBorderChange?: (value: BorderStyle) => void;
    onBorderSideChange?: (side: BorderSide, value: BorderStyle) => void;
    onBorderRadiusChange?: (value: FourSidesUnit | ImmutableObject<FourSidesUnit>) => void;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
}
export declare function ThemeBorderSection(props: ThemeBorderSectionProps): import("@emotion/react/jsx-runtime").JSX.Element;
