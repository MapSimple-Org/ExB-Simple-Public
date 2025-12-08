import { React, type ImmutableObject } from 'jimu-core';
import type { MeasurementsUnitsInfo, MeasurementsRuntimeInfo } from '../constraints';
export interface MeasurementsContextStates {
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
    measurementsUnitsInfos: MeasurementsUnitsInfo[];
}
interface MeasurementsContextAction {
    type: string;
    payload: any;
}
export declare const actionType: {
    MeasurementsRuntimeInfoChanged: string;
    MeasurementsUnitsInfosChanged: string;
};
export declare const MeasurementsRuntimeInfoChangedAction: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => {
    type: string;
    payload: {};
};
export declare const MeasurementsUnitsInfosChangedAction: (measurementsUnitsInfos: MeasurementsUnitsInfo[]) => {
    type: string;
    payload: MeasurementsUnitsInfo[];
};
export declare const init: (MeasurementsUnitsInfos: MeasurementsUnitsInfo[]) => MeasurementsContextStates;
export declare const reducer: (state: MeasurementsContextStates, action: MeasurementsContextAction) => {
    measurementsUnitsInfos: any;
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
};
export declare const MeasurementsContext: React.Context<{
    measurementsContextStates: MeasurementsContextStates;
    dispatchMeasurementsActions: React.Dispatch<MeasurementsContextAction>;
}>;
export declare const MeasurementsContextProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
