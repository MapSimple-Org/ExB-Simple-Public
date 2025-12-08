import { type ImmutableObject } from 'jimu-core';
import { type MeasurementsRuntimeInfo } from '../constraints';
export interface MeasurementsNls {
    location: string;
    length: string;
    area: string;
    coordUnit: string;
    linearUnit: string;
    arealUnit: string;
    perimeterUnit: string;
}
export declare const useMeasurementsLabelNls: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => {
    getMeasurementsNls: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => MeasurementsNls;
};
