import { type IMAppConfig, type BrowserSizeMode } from 'jimu-core';
import { type CardLayout, Status } from './type';
export interface SwitchCardLayoutOption {
    layout: CardLayout;
    config: any;
    widgetId: string;
    appConfig: IMAppConfig;
    status: Status;
    label?: string;
    isCardWidget?: boolean;
    layouts: any;
    mainSizeMode: BrowserSizeMode;
}
export declare const setLayoutAuto: (option: SwitchCardLayoutOption) => void;
export declare const setLayoutCustom: (option: SwitchCardLayoutOption) => void;
