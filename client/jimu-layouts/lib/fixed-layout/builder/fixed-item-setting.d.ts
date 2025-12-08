/** @jsx jsx */
import { React } from 'jimu-core';
import type { FixedLayoutItemSetting } from '../../types';
import { type LinearUnit } from 'jimu-ui';
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime';
import type { LayoutItemSettingProps } from '../../builder/types';
interface State {
    enableToolbar: boolean;
}
export default class FixedItemSetting extends React.PureComponent<LayoutItemSettingProps, State> {
    itemSetting: FixedLayoutItemSetting;
    flipLeftRight: boolean;
    ref: HTMLDivElement;
    constructor(props: any);
    componentDidMount(): void;
    updateBBox: (prop: string, value: LinearUnit) => void;
    updateMode: (prop: string, value: LayoutItemSizeModes) => void;
    updateLockParent: (e: any) => void;
    getSizeOfContainer(): DOMRect;
    getSizeOfItem(): DOMRect;
    querySelector(selector: string): HTMLElement;
    toggleHeightMode: () => void;
    updateAspectRatio: (newRatio: any) => void;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
