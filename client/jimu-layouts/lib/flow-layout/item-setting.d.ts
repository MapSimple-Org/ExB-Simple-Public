import { React, type LayoutInfo, type LayoutItemJson, type BoundingBox } from 'jimu-core';
import { type LinearUnit } from 'jimu-ui';
export default class FlowItemSetting extends React.PureComponent<{
    layoutId: string;
    layoutItem: LayoutItemJson;
    onSettingChange: (layoutInfo: LayoutInfo, setting: any) => void;
    onPosChange: (layoutInfo: LayoutInfo, bbox: BoundingBox) => void;
}> {
    _updateStyle(key: any, value: any): void;
    _updateFitContainer: (e: any) => void;
    _updateBorder: (bd: any) => void;
    _updateBorderSide: (side: any, bd: any) => void;
    _updateRadius: (value: any) => void;
    _updateShadow: (value: any) => void;
    _updateAlign: (e: any) => void;
    _updateBBox: (prop: string, value: LinearUnit) => void;
    _updateAutoSetting: (prop: string, value: boolean) => void;
    _createBBoxPropSetting(bbox: any, label: string, prop: string, key: number): import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
