/** @jsx jsx */
import { React } from 'jimu-core';
import { type FlowLayoutItemSetting, LayoutItemSizeModes } from 'jimu-layouts/layout-runtime';
import type { LayoutItemSettingProps } from '../../builder/types';
import { type LinearUnit } from 'jimu-ui';
export default class FloatingItemSetting extends React.PureComponent<LayoutItemSettingProps> {
    itemSetting: FlowLayoutItemSetting;
    updateWidth: (value: LinearUnit) => void;
    updateBBoxWidth: (value: LinearUnit) => void;
    updateHeight: (value: LinearUnit) => void;
    updateOffsetX: (value: number) => void;
    updateOffsetY: (value: number) => void;
    updateHeightMode: (mode: LayoutItemSizeModes) => void;
    updateFloatingArea(value: number): void;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
