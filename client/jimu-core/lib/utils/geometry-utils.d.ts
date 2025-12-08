import type { DataRecord } from '../data-sources';
import type { IGeometry } from '@esri/arcgis-rest-request';
/**
 * Project data records to a new spatial reference.
 * NOTE: When the spatial reference are different, returns a clone of projected data records.
 *
 * @param dataRecords The input data records
 * @param spatialReference Target spatial reference
 */
export declare function projectDataRecordsToSpatialReference(dataRecords: DataRecord[], spatialReference: __esri.SpatialReference): Promise<DataRecord[]>;
/**
 * Project a set of geometries to a new spatial reference.
 * NOTE: When the spatial reference are different, returns a clone of projected geometries.
 *
 * @param geometries The input geometries
 * @param spatialReference Target spatial reference
 */
export declare function projectToSpatialReference(geometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]>;
/**
 * Creates buffer polygons at a specified distance around the input geometries.
 * @param geometries
 */
export declare function createBuffer(geometries: __esri.Geometry | __esri.Geometry[], distances: number[], unit: string): Promise<__esri.Geometry | __esri.Geometry[]>;
export declare function convertGeometryJsonToGeometryInstance(inputGeometry: IGeometry | __esri.Geometry, needsClone: boolean): Promise<__esri.Geometry>;
