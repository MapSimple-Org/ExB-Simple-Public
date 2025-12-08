export declare const USER_SETTING_FILE_KEY = "exb_user_settings";
export interface UserSettingInfo {
    showGuides?: {
        [guideKey: string]: boolean;
    };
    widgets?: {
        [widgetKey: string]: {
            [itemKey: string]: boolean;
        };
    };
}
