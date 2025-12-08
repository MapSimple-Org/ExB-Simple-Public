import { Scale } from '../interfaces';
export declare const CSS: {
    container: string;
    containerBottom: string;
    content: string;
    contentHasText: string;
    iconEnd: string;
    iconPresent: string;
    iconStart: string;
    titleIcon: string;
    scale: (scale: Scale) => "scale-s" | "scale-m" | "scale-l";
    selectedIndicator: string;
};
export declare const IDS: {
    readonly host: (id: any) => string;
};
