/** @jsx jsx */
import { React } from 'jimu-core';
import { type LinearUnit } from 'jimu-ui';
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime';
import type { LayoutItemSettingProps } from '../../builder/types';
export default class FlexRowItemSetting extends React.PureComponent<LayoutItemSettingProps> {
    updateBBox: (prop: string, value: LinearUnit) => void;
    toggleHeightMode: () => void;
    updateAlignSelf: (e: any) => void;
    updateHeightMode: (mode: LayoutItemSizeModes) => void;
    updateWidthMode: (mode: LayoutItemSizeModes) => void;
    updateAspectRatio: (newRatio: any) => void;
    getSizeOfContainer(): DOMRect;
    getSizeOfItem(): DOMRect;
    querySelector(selector: string): HTMLElement;
    formatMessage: (id: string) => string;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
