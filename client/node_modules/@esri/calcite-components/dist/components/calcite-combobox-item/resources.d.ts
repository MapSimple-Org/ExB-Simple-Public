import { Scale } from '../interfaces';
export declare const CSS: {
    active: string;
    centerContent: string;
    container: string;
    iconCustom: string;
    description: string;
    icon: string;
    label: string;
    scale: (scale: Scale) => "scale--s" | "scale--m" | "scale--l";
    shortText: string;
    single: string;
    textContainer: string;
    heading: string;
};
export declare const ICONS: {
    checked: string;
    circle: string;
    indeterminate: string;
    selectedSingle: string;
    unchecked: string;
};
export declare const SLOTS: {
    contentEnd: string;
    contentStart: string;
};
export declare const itemSpacingMultiplier = "--calcite-combobox-item-spacing-indent-multiplier";
