import type { FlatContainerMaps } from 'jimu-layouts/layout-runtime';
import type { IMAppConfig } from 'jimu-core';
export interface OptionStyle {
    id?: string;
    label: string;
    header?: boolean;
    divider?: boolean;
    headerLabel?: string;
}
export declare const divider: OptionStyle;
export declare const getBreakList: (breaker: number, selectLists: FlatContainerMaps[]) => {
    pageList: FlatContainerMaps[];
    dialogList: FlatContainerMaps[];
};
export declare enum LabelType {
    Page = "pages",
    Dialog = "dialogs",
    Widget = "widgets"
}
export declare const sortByLabel: (items: any, appConfig: IMAppConfig, type: LabelType.Page | LabelType.Dialog | LabelType.Widget) => any;
