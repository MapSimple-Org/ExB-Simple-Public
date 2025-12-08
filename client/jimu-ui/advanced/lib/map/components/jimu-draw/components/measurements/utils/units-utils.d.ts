import { JimuSymbolType } from '../../../../../';
import type { MeasurementsUnitsInfo, MeasurementsRuntimeInfo } from '../constraints';
import { UnitsSettingMode } from '../components/setting-panel';
export interface UnitsType {
    activated: boolean;
    value: string;
    note: string;
    label: string;
}
export declare const getUnitOptionsByJimuSymbolType: (currentJimuSymbolType: JimuSymbolType, measurementsUnitsInfos: MeasurementsUnitsInfo[]) => UnitsType[];
export declare const findFirstAvailable: (unitMode: UnitsSettingMode, measurementsUnitsInfos: MeasurementsUnitsInfo[]) => string;
export declare const isCurUnitDeleted: (unitMode: UnitsSettingMode, measurementsRuntimeInfoState: MeasurementsRuntimeInfo, measurementsUnitsInfos: MeasurementsUnitsInfo[]) => boolean;
