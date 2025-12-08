/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core';
import { JimuSymbolType } from '../../../../../';
import type { MeasurementsRuntimeInfo, MeasurementsUnitsInfo } from '../constraints';
export interface MeasurementsSettingProps {
    predefinedJimuSymbolType: JimuSymbolType;
    currentJimuSymbolType: JimuSymbolType;
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
    measurementsUnitsInfos: MeasurementsUnitsInfo[];
    onMInfoSingletonChanged: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => void;
}
export declare enum UnitsSettingMode {
    Coord = "coord",
    Linear = "linear",
    Areal = "areal",
    Perimeter = "perimeter"
}
export declare const SettingPanel: React.MemoExoticComponent<(props: (MeasurementsSettingProps)) => import("@emotion/react/jsx-runtime").JSX.Element>;
