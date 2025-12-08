/** @jsx jsx */
import { type UseDataSource, React, type ImmutableArray } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
import { type IMJimuMapConfig } from '../jimu-map';
interface Props {
    useDataSources?: ImmutableArray<UseDataSource>;
    jimuMapConfig?: IMJimuMapConfig;
    buttonLabel?: string;
    title?: string;
    id?: string;
    isUseWidgetSize?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onConfigChanged?: (config: IMJimuMapConfig) => void;
}
interface States {
    isShowDialog: boolean;
    currentJimuMapView: JimuMapView;
}
export declare class MapStatesEditor extends React.PureComponent<Props, States> {
    constructor(props: any);
    handleClickOk: () => void;
    handleClickClose: () => void;
    showDialog: () => void;
    handleActiveViewChange: (jimuMapView: JimuMapView) => void;
    querySelector(selector: string): HTMLElement;
    getWidgetSize: () => any;
    getRightSize: (innerSize: {
        width: number;
        height: number;
    }) => {
        width: number;
        height: number;
    };
    getGlobalStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
