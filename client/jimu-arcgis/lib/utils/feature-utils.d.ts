import { type DataRecordSet } from 'jimu-core';
export declare function convertDataRecordSetToFeatureSet(dsSet: DataRecordSet): Promise<__esri.FeatureSet>;
export type DefaultSymbolType = 'point' | 'polyline' | 'polygon';
export interface DefaultSymbol {
    type: string;
    color: number[];
    outline?: {
        color: number[];
        width: number;
    };
}
export declare function getDefaultSymbol(type: DefaultSymbolType): DefaultSymbol;
