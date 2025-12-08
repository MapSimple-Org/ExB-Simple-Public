export declare enum StatisticType {
    Count = "count",
    Sum = "sum",
    Min = "min",
    Max = "max",
    Avg = "avg",
    Stddev = "stddev",
    percentile_disc = "percentile_disc",
    percentile_cont = "percentile_cont"
}
export declare const ESRI_OBJECTID_TYPE = "esriFieldTypeOID";
export declare const EXPRESSION_LOAD_PREFIX = "EXPRESSION_RESOLVER";
export declare enum ResolveExpressionErrorCode {
    ParamType = "INVALID_PARAM_TYPE",// e.g. avg({f1}) and f1 isn't a number field, or, avg({f1}) and doesn't find f1 in data source schema
    ParamNumber = "INVALID_NUMBER_OF_PARAMS",// e.g. avg({f1}, {f2}), only support one parameter
    FuncType = "INVALID_FUNCTION_TYPE",// e.g. average({f1}), should use avg
    NeedRecord = "NEED_RECORD",// e.g. {f1} and doesn't find any records in data source
    NeedDataSource = "NEED_DATA_SOURCE"
}
