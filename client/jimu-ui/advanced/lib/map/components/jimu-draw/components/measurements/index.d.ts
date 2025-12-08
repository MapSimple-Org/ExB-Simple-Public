/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core';
import { JimuSymbolType } from '../../../../';
import type { JimuSymbol } from '../symbols';
import type { MeasurementsRuntimeInfo, MeasurementsUnitsInfo, MeasurementsPropsInfo, MDecimalPlaces } from './constraints';
import { useMeasurementsUnitsInfos } from './utils/measurements-units-infos-hooks';
export { type MeasurementsPropsInfo, type MeasurementsUnitsInfo, type MDecimalPlaces, useMeasurementsUnitsInfos };
export interface Props {
    symbol: JimuSymbol;
    jimuSymbolType: JimuSymbolType;
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
    measurementsUnitsInfos: MeasurementsUnitsInfo[];
    onMeasurementsInfoChanged: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => void;
}
export declare const Measurements: React.MemoExoticComponent<(props: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
