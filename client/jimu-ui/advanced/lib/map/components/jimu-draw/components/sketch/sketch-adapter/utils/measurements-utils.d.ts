import { type MeasurementsRuntimeInfo, type ArealUnits, type LinearUnits, MModes } from '../../../measurements/constraints';
import type { MeasurementsNls } from '../../../measurements/utils/m-label-nls-hooks';
import { CreateToolActions } from '..';
import type { ProjectionTools } from '../../../measurements/utils/projection-converter-provider';
export declare const isAddMResults: (measurementsRuntimeInfo: MeasurementsRuntimeInfo) => boolean;
export declare const addMResults: (flags: {
    mode: MModes;
    IsDeletingFlag: boolean;
    isUpdate: boolean;
}, graphics: __esri.Graphic[], measurementsLayer: __esri.FeatureLayer, measurementsRuntimeInfo: MeasurementsRuntimeInfo, refs: {
    coordinateFormatter: __esri.coordinateFormatter;
    projectionTools: ProjectionTools;
    Graphic: typeof __esri.Graphic;
    i18nFormatNumber: any;
    MEASUREMENTS_NLS: MeasurementsNls;
}, geometryOperators: {
    lengthOperator: __esri.lengthOperator;
    geodeticLengthOperator: __esri.geodeticLengthOperator;
    areaOperator: __esri.areaOperator;
    geodeticAreaOperator: __esri.geodeticAreaOperator;
}) => Promise<void>;
export declare const updateMResults: (graphics: __esri.Graphic[], measurementsLayer: __esri.FeatureLayer, measurementsRuntimeInfo: MeasurementsRuntimeInfo, IsDeletingFlag: boolean, refs: {
    coordinateFormatter: __esri.coordinateFormatter;
    projectionTools: ProjectionTools;
    Graphic: typeof __esri.Graphic;
    i18nFormatNumber: any;
    MEASUREMENTS_NLS: MeasurementsNls;
}, geometryOperators: {
    lengthOperator: __esri.lengthOperator;
    geodeticLengthOperator: __esri.geodeticLengthOperator;
    areaOperator: __esri.areaOperator;
    geodeticAreaOperator: __esri.geodeticAreaOperator;
}) => Promise<void>;
export declare const getMResultsFeatures: (graphic: __esri.Graphic, measurementsLayer: __esri.FeatureLayer) => Promise<__esri.FeatureSet>;
export declare const clearMResultsByAttrJimuDrawId: (graphics: __esri.Graphic[], measurementsLayer: __esri.FeatureLayer) => Promise<void>;
export declare const clearAllMResults: (measurementsLayer: __esri.FeatureLayer) => void;
export declare const geodesicLength: (geometry: __esri.Geometry, linearUnit: LinearUnits, geodeticLengthOperator: __esri.geodeticLengthOperator) => Promise<number>;
export declare const geodesicArea: (geometry: __esri.Geometry, arealUnit: ArealUnits, geodeticAreaOperator: __esri.geodeticAreaOperator) => Promise<number>;
export declare const planarLength: (geometry: __esri.Geometry, linearUnit: LinearUnits, lengthOperator: __esri.lengthOperator) => Promise<number>;
export declare const planarArea: (geometry: __esri.Geometry, arealUnit: ArealUnits, areaOperator: __esri.areaOperator) => Promise<number>;
export declare const _getMModesByActivatedTool: (currentActiveToolState: CreateToolActions) => MModes;
export declare const getMModesByGraphic: (graphic: __esri.Graphic) => MModes;
