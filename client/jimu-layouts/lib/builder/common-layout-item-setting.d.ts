/** @jsx jsx */
import { React, type LayoutInfo } from 'jimu-core';
import { type BorderSide } from 'jimu-ui/advanced/style-setting-components';
interface ExtraProps {
    formatMessage: (id: string) => string;
}
export default class CommonLayoutItemSetting extends React.PureComponent<{
    layoutId: string;
    layoutItemId: string;
    isSection: boolean;
    onStyleChange: (layoutInfo: LayoutInfo, style: any) => void;
    onSettingChange?: (layoutInfo: LayoutInfo, setting: any) => void;
    style: any;
    setting?: any;
} & ExtraProps> {
    updateStyle(key: any, value: any): void;
    onBackgroundStyleChange: (config: any) => void;
    onForegroundChange: (value: string) => void;
    onBothChange: (bg: any, fg: any) => void;
    updateBorder: (bd: any) => void;
    updateBorderSide: (side: BorderSide, bd: any) => void;
    updateRadius: (value: any) => void;
    updateShadow: (value: any) => void;
    formatMessage: (id: string) => string;
    allowCoverBackground(): boolean;
    allowAnimation(): boolean;
    allowBorder(): boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
