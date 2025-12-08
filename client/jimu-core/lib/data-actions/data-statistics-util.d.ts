import type { StatisticDefinition, DataRecord, FeatureLayerDataSource, SceneLayerDataSource, DataRecordSet } from '../data-sources';
export type StatResult = {
    [statType in StatisticDefinition['statisticType'] | 'countEmpty']?: number;
};
export declare const statTypes: Array<keyof StatResult>;
export declare const queryFieldStatistics: (ds: FeatureLayerDataSource | SceneLayerDataSource, fieldName: string) => Promise<StatResult>;
export declare const getFieldStatistics: (records: DataRecord[], fieldName: string) => StatResult;
export declare const getStatisticalFields: (dataSet: DataRecordSet) => string[];
