/** @jsx jsx */
import { React } from 'jimu-core';
import { type LinearUnit } from 'jimu-ui';
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime';
import type { LayoutItemSettingProps } from '../../builder/types';
export default class AccordionItemSetting extends React.PureComponent<LayoutItemSettingProps> {
    updateHeight: (value: LinearUnit) => void;
    toggleAspectRatio: (e: any, checked: boolean) => void;
    updateHeightMode: (mode: LayoutItemSizeModes) => void;
    updateAspectRatio: (newRatio: any) => void;
    formatMessage: (id: string) => string;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
