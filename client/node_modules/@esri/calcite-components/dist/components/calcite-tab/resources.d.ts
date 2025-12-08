import { Scale } from '../interfaces';
export declare const CSS: {
    container: string;
    content: string;
    scale: (scale: Scale) => "scale-s" | "scale-m" | "scale-l";
};
export declare const IDS: {
    tabTitleId: (id: any) => `calcite-tab-title-${any}`;
};
