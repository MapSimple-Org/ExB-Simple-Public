import { JimuFieldType, type IMThemeVariables, type IntlShape } from 'jimu-core';
export declare const NO_SELECTION_ID = "CLICK_ME_TO_CLEAR_SELECTION";
export declare function getIconFromFieldType(type: JimuFieldType, theme: IMThemeVariables, intl?: IntlShape): {
    icon: any;
    color: string;
    title: string;
};
