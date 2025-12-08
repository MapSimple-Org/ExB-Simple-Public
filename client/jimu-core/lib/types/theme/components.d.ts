import type { BorderStyle, NavButtonGroupType } from 'jimu-ui';
import type { ImmutableObject } from 'seamless-immutable';
import type { Color, Size, LineHeight, ThemeBoxStyles, ThemeBoxStylesByState } from './common';
export interface ThemeButtonSize {
    fontSize?: Size;
    lineHeight?: LineHeight;
    paddingX?: Size;
    paddingY?: Size;
    borderRadius?: Size;
}
export interface ThemeInputSize {
    fontSize?: Size;
    paddingY?: Size;
    paddingX?: Size;
    lineHeight?: LineHeight;
    borderRadius?: Size;
    height?: Size | 'auto';
}
export interface ThemeAlert {
    paddingY?: Size;
    paddingX?: Size;
    marginBottom?: Size;
    borderRadius?: Size;
    linkFontWeight?: string;
    borderWidth?: Size;
    bgLevel?: string;
    borderLevel?: string;
    colorLevel?: string;
}
export interface ThemeBadge {
    fontSize?: Size;
    fontWeight?: string;
    paddingX?: Size;
    paddingY?: Size;
    border?: BorderStyle;
    borderRadius?: Size;
    minSize?: Size;
}
export interface ThemeBreadcrumb {
    bg?: Color;
    activeColor?: Color;
    paddingY?: Size;
    paddingX?: Size;
    marginBottom?: Size;
    borderRadius?: Size;
    item?: {
        color?: Color;
        hoverColor?: Color;
        padding?: Size;
    };
    divider?: {
        content?: string;
        color?: Color;
    };
}
export type ThemeButtonType = 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link';
export type ThemeButtonStyles = ThemeBoxStyles;
export type ThemeButtonStylesByState = ThemeBoxStylesByState;
export type IMThemeButtonStylesByState = ImmutableObject<ThemeButtonStylesByState>;
export type ThemeButtonVariants = {
    [key in ThemeButtonType]?: ThemeButtonStylesByState;
};
export type IMThemeButtonVariants = ImmutableObject<ThemeButtonVariants>;
export interface ThemeButton {
    sizes?: {
        default?: ThemeButtonSize;
        sm?: ThemeButtonSize;
        lg?: ThemeButtonSize;
    };
    variants?: ThemeButtonVariants;
    icon?: {
        spacing?: Size;
        size?: Size | 'auto';
    };
}
export interface ThemeCard {
    spacer?: {
        y?: Size;
        x?: Size;
    };
    headerBg?: Color;
    divider?: BorderStyle;
    root?: ThemeBoxStylesByState;
    checkMark?: {
        color?: Color;
        bg?: Color;
        border?: BorderStyle;
    };
}
export interface ThemeClose {
    fontSize?: Size;
    fontWeight?: string;
    color?: Color;
    textShadow?: string;
}
export interface ThemeDropdown {
    button?: {
        sizes?: {
            default?: {
                paddingX?: Size;
            };
            sm?: {
                paddingX?: Size;
            };
            lg?: {
                paddingX?: Size;
            };
        };
    };
    minWidth?: Size;
    paddingY?: Size;
    spacer?: Size;
    bg?: Color;
    border?: BorderStyle;
    borderRadius?: Size;
    divider?: {
        bg?: Color;
        margin?: Size;
    };
    shadow?: string;
    link?: {
        color?: Color;
        hoverColor?: Color;
        hoverBg?: Color;
        activeColor?: Color;
        activeBg?: Color;
        checkIconColor?: Color;
        checkIconGutter?: Size;
        disabledColor?: Color;
    };
    item?: {
        paddingX?: Size;
        paddingY?: Size;
    };
    header?: {
        color?: Color;
    };
}
export interface ThemeForm {
    group?: {
        marginBottom?: Size;
    };
    helpText?: {
        marginTop?: Size;
        fontSize?: Size;
    };
    check?: {
        inline?: {
            marginX?: string;
            inputMarginX?: string;
        };
    };
}
interface _SwitchBase {
    size?: Size;
    border?: BorderStyle;
    borderRadius?: string;
    bg?: Color;
    hover?: {
        borderColor?: Color;
    };
    checked?: {
        color?: Color;
        bg?: Color;
    };
    focusColor?: Color;
    iconSize?: Size;
}
export interface ThemeInputCheckbox extends _SwitchBase {
}
export interface ThemeInputRadio extends _SwitchBase {
}
export interface ThemeInputSwitch {
    width?: Size;
    height?: Size;
    borderRadius?: string;
    bg?: Color;
    border?: BorderStyle;
    checkedBg?: Color;
    checkedBorder?: {
        color?: Color;
    };
    slider?: {
        gap?: Size;
        height?: Size | 'auto';
        width?: Size | 'auto';
        color?: Color;
        checkedColor?: Color;
        disabledColor?: Color;
    };
    focusColor?: Color;
}
export interface ThemeInput {
    bg?: Color;
    color?: Color;
    border?: BorderStyle;
    boxShadow?: string;
    focus?: {
        bg?: Color;
        borderColor?: Color;
        color?: Color;
        width?: Size;
        boxShadow?: string;
    };
    disabled?: {
        bg?: Color;
        borderColor?: Color;
        color?: Color;
    };
    placeHolderColor?: Color;
    sizes?: {
        default?: ThemeInputSize;
        sm?: ThemeInputSize;
        lg?: ThemeInputSize;
    };
    transition?: string;
    checkbox?: ThemeInputCheckbox;
    radio?: ThemeInputRadio;
    switch?: ThemeInputSwitch;
}
export interface ThemeInputGroup {
    addon?: {
        color?: Color;
        bg?: Color;
        borderColor?: Color;
    };
}
export interface ThemeListGroup {
    fontSize?: Size;
    bg?: Color;
    border?: BorderStyle;
    borderRadius?: Size;
    item?: {
        paddingY?: Size;
        paddingX?: Size;
    };
    hover?: {
        bg?: Color;
    };
    active?: {
        color?: Color;
        bg?: Color;
        borderColor?: Color;
    };
    disabled?: {
        color?: Color;
        bg?: Color;
    };
    action?: {
        color?: Color;
        hover?: {
            color?: Color;
        };
        active?: {
            color?: Color;
            bg?: Color;
        };
    };
}
export interface ThemeModal {
    innerPadding?: Size;
    transition?: string;
    dialog?: {
        margin?: Size;
        marginYSmUp?: Size;
    };
    title?: {
        lineHeight?: LineHeight;
    };
    content?: {
        bg?: Color;
        border?: BorderStyle;
        borderRadius?: string;
        shadow?: string;
        shadowSmUp?: string;
    };
    backdrop?: {
        bg?: Color;
        opacity?: number;
    };
    header?: {
        border?: BorderStyle;
        paddingY?: Size;
        paddingX?: Size;
    };
    footer?: {
        border?: BorderStyle;
        button?: {
            minWidth?: Size;
        };
    };
    sizes?: {
        lg?: Size;
        md?: Size;
        sm?: Size;
    };
}
export type ThemeNavType = 'default' | 'underline' | 'tabs' | 'pills';
export interface ThemeNavItem {
    size?: ThemeButtonSize;
    gutter?: Size;
    icon?: {
        spacing?: Size;
    };
}
export type IMThemeNavVariant = ImmutableObject<ThemeNavVariant>;
export interface ThemeNavVariant extends ThemeNavItem {
    root?: ThemeBoxStyles;
    item?: ThemeButtonStylesByState;
}
export type ThemeNavVariants = {
    [key in ThemeNavType]?: ThemeNavVariant;
};
export interface ThemeNav {
    variants?: ThemeNavVariants;
}
export interface ThemeNavBar {
    fontSize?: Size;
    paddingY?: Size;
    paddingX?: Size;
    nav?: {
        link?: {
            paddingX?: Size;
            height?: Size | 'auto';
        };
    };
    brand?: {
        fontSize?: Size;
        height?: Size | 'auto';
        paddingY?: Size | 'auto';
    };
    toggler?: {
        paddingY?: Size;
        paddingX?: Size;
        fontSize?: Size;
        borderRadius?: Size;
    };
    themes?: {
        dark?: {
            color?: Color;
            hoverColor?: Color;
            activeColor?: Color;
            disabledColor?: Color;
            toggler?: {
                iconBg?: string;
                borderColor?: Color;
            };
        };
        light?: {
            color?: Color;
            hoverColor?: Color;
            activeColor?: Color;
            disabledColor?: Color;
            toggler?: {
                iconBg?: string;
                borderColor?: Color;
            };
        };
    };
}
export interface ThemeNavButtonGroupVariant {
    root?: ThemeBoxStyles;
    item?: ThemeButtonStylesByState;
}
export type ThemeNavButtonGroupVariants = {
    [key in NavButtonGroupType]?: ThemeNavButtonGroupVariant;
};
export interface ThemeNavButtonGroup {
    variants?: ThemeNavButtonGroupVariants;
}
export type IMThemePaginationVariant = ImmutableObject<ThemePaginationVariant>;
export interface ThemePaginationVariant {
    root?: ThemeButtonStylesByState;
    button?: ThemeButtonStylesByState;
}
export interface ThemePaginationVariants {
    default?: ThemePaginationVariant;
}
export interface ThemePagination {
    sizes?: {
        default?: {
            button?: {
                paddingY?: Size;
                paddingX?: Size;
                minWidth?: Size;
                lineHeight?: Size | number;
            };
        };
        sm?: {
            button?: {
                paddingY?: Size;
                paddingX?: Size;
                minWidth?: Size;
                lineHeight?: Size | number;
            };
        };
        lg?: {
            button?: {
                paddingY?: Size;
                paddingX?: Size;
                minWidth?: Size;
                lineHeight?: Size | number;
            };
        };
    };
    variants?: ThemePaginationVariants;
    lineHeight?: LineHeight;
    gutter?: Size;
}
export interface ThemePopper {
    fontSize?: Size;
    bg?: Color;
    border?: BorderStyle;
    borderRadius?: Size;
    shadow?: string;
    header?: {
        bg?: Color;
        color?: Color;
        paddingY?: Size;
        paddingX?: Size;
    };
    body?: {
        color?: Color;
        paddingY?: Size;
        paddingX?: Size;
    };
    arrow?: {
        color?: Color;
        outerColor?: Color;
    };
}
export interface ThemePaper {
    bg?: Color;
    color?: Color;
    border?: BorderStyle;
    paddingY?: Size;
    paddingX?: Size;
    boxShadow?: string;
}
export interface ThemeProgress {
    height?: Size;
    fontSize?: Size;
    bg?: Color;
    borderRadius?: Size;
}
export type IMThemeSliderVariant = ImmutableObject<ThemeSliderVariant>;
export interface ThemeSliderVariant {
    root?: ThemeBoxStyles;
    track?: ThemeBoxStyles;
    progress?: ThemeButtonStylesByState;
    thumb?: ThemeButtonStylesByState;
}
export interface ThemeSliderVariants {
    default?: ThemeSliderVariant;
}
export interface ThemeSlider {
    sizes?: {
        default?: {
            root?: Size;
            thumb?: Size;
        };
        sm?: {
            root?: Size;
            thumb?: Size;
        };
        lg?: {
            root?: Size;
            thumb?: Size;
        };
    };
    variants?: ThemeSliderVariants;
}
export interface ThemeTable {
    color?: Color;
    bg?: Color;
    border?: BorderStyle;
    head?: {
        fontSize?: Size;
        bg?: Color;
    };
    cell?: {
        default?: {
            paddingX?: Size;
            paddingY?: Size;
        };
        sm?: {
            paddingX?: Size;
            paddingY?: Size;
        };
    };
    variants?: {
        striped?: {
            bg?: Color;
        };
        dark?: {
            color?: Color;
            bg?: Color;
            border?: {
                color?: Color;
            };
            head?: {
                bg?: Color;
            };
        };
    };
}
export interface ThemeTooltip {
    fontSize?: Size;
    maxWidth?: Size;
    color?: Color;
    bg?: Color;
    borderRadius?: Size;
    border?: BorderStyle;
    boxShadow?: string;
    opacity?: number;
    paddingY?: Size;
    paddingX?: Size;
    arrow?: {
        color?: Color;
        border?: BorderStyle;
    };
}
export interface ThemeComponents {
    alert?: ThemeAlert;
    badge?: ThemeBadge;
    breadcrumb?: ThemeBreadcrumb;
    button?: ThemeButton;
    card?: ThemeCard;
    close?: ThemeClose;
    dropdown?: ThemeDropdown;
    form?: ThemeForm;
    input?: ThemeInput;
    inputGroup?: ThemeInputGroup;
    listGroup?: ThemeListGroup;
    modal?: ThemeModal;
    nav?: ThemeNav;
    navbar?: ThemeNavBar;
    navButtonGroup?: ThemeNavButtonGroup;
    pagination?: ThemePagination;
    popper?: ThemePopper;
    paper?: ThemePaper;
    progress?: ThemeProgress;
    slider?: ThemeSlider;
    table?: ThemeTable;
    tooltip?: ThemeTooltip;
    [component: string]: any;
}
export {};
