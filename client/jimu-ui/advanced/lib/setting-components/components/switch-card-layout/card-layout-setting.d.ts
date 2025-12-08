/** @jsx jsx */
import { type BrowserSizeMode, type IMAppConfig } from 'jimu-core';
import type { SettingChangeFunction } from 'jimu-for-builder';
import { CardLayout, type Status } from './type';
interface LayoutSettingProps {
    id: string;
    onSettingChange: SettingChangeFunction;
    cardLayout: CardLayout;
    status: Status;
    browserSizeMode: BrowserSizeMode;
    mainSizeMode: BrowserSizeMode;
    layouts: any;
    config: any;
    appConfig: IMAppConfig;
    isCardWidget?: boolean;
}
export declare const CardLayoutSetting: (props: LayoutSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
