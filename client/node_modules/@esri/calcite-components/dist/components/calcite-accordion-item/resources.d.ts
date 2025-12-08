import { Appearance, Position, IconType } from '../interfaces';
export declare const SLOTS: {
    actionsStart: string;
    actionsEnd: string;
    contentEnd: string;
    contentStart: string;
};
export declare const CSS: {
    actionsEnd: string;
    actionsStart: string;
    content: string;
    description: string;
    expandIcon: string;
    header: string;
    headerContainer: string;
    headerContent: string;
    headerText: string;
    headerAppearance: (appearance: Appearance) => "header--solid" | "header--outline" | "header--outline-fill" | "header--transparent";
    heading: string;
    icon: string;
    iconEnd: string;
    iconStart: string;
    iconPosition: (iconPosition: Position) => "icon-position--start" | "icon-position--end" | "icon-position--top" | "icon-position--bottom";
    iconType: (iconType: IconType) => "icon-type--chevron" | "icon-type--caret" | "icon-type--ellipsis" | "icon-type--overflow" | "icon-type--plus-minus";
    item: string;
    slotContentEnd: string;
    slotContentStart: string;
};
export declare const IDS: {
    section: string;
    sectionToggle: string;
};
export declare const ICONS: {
    chevronDown: string;
    caretDown: string;
    plus: string;
    minus: string;
};
