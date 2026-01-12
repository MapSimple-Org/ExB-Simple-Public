import React, { useState, useEffect, useRef } from 'react';
import { Button, TextInput, NumericInput, Switch, Slider, Label, AdvancedButtonGroup, Select, Option, Popper } from 'jimu-ui';
import { SymbolSelector, JimuSymbolType, JimuSymbol } from 'jimu-ui/advanced/map';
import { JimuMapView } from 'jimu-arcgis';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Graphic from 'esri/Graphic';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import TextSymbol from 'esri/symbols/TextSymbol';
import Color from 'esri/Color';
import Font from 'esri/symbols/Font';
import { ThemeContext } from 'jimu-theme';
import { IMThemeVariables } from 'jimu-core';
import HitTestResult = __esri.HitTestResult;
import GraphicHit = __esri.GraphicHit;
import { ColorPicker } from 'jimu-ui/basic/color-picker';
import geometryEngineAsync from "esri/geometry/geometryEngineAsync";
import Point from "esri/geometry/Point";

// Optional: Import icons for text alignment if available
import hAlignLeft from 'jimu-icons/svg/outlined/editor/text-left.svg';
import hAlignCenter from 'jimu-icons/svg/outlined/editor/text-center.svg';
import hAlignRight from 'jimu-icons/svg/outlined/editor/text-right.svg';
import vAlignBase from './assets/text-align-v-base.svg';
import vAlignTop from './assets/text-align-v-t.svg';
import vAlignMid from './assets/text-align-v-m.svg';
import vAlignBot from './assets/text-align-v-b.svg';
import fsBoldIcon from './assets/bold.svg';
import fItalicIcon from './assets/italic.svg';
import fUnderlineIcon from './assets/underline.svg';

import { InputUnit } from 'jimu-ui/advanced/style-setting-components';
import { Icon } from 'jimu-ui';

import { TextStyleEditor } from './TextStyleEditor';

import { Alert } from 'jimu-ui';
import * as projection from 'esri/geometry/projection';
import SpatialReference from 'esri/geometry/SpatialReference';

type FontStyle = 'bold' | 'italic' | 'underline';
type HorizontalAlign = 'left' | 'center' | 'right';
type VerticalAlign = 'baseline' | 'top' | 'middle' | 'bottom';


interface ExtendedGraphic extends __esri.Graphic {
    measure?: {
        graphic: ExtendedGraphic;
        areaUnit?: string;
        lengthUnit?: string;
    };
    measureParent?: ExtendedGraphic;
    checked?: boolean;
    originalSymbol?: any;
    isBufferDrawing?: boolean;
    sourceGraphicId?: string;
    bufferGraphic?: ExtendedGraphic; // Direct reference to attached buffer
    _selectionOverlay?: __esri.Graphic | null;
    bufferSettings?: {
        distance: number;
        unit: string;
        enabled: boolean;
        opacity?: number;
    };
}

const asExtendedGraphic = (graphic: __esri.Graphic): ExtendedGraphic => {
    return graphic as ExtendedGraphic;
};

interface MyDrawingsPanelProps {
    graphicsLayer: GraphicsLayer;
    jimuMapView: JimuMapView;
    allowLocalStorage?: boolean;
    localStorageKey?: string;
    confirmOnDelete?: boolean;
    onDrawingSelect?: (graphic: __esri.Graphic, index: number) => void;
    onDrawingsUpdate?: (graphics: __esri.Graphic[]) => void;
    showAlert?: (message: string, type: 'success' | 'error' | 'info') => void;
    drawings?: __esri.Graphic[]; // Optional prop to receive drawings from parent
    isActiveTab: boolean;
    onMeasurementSystemControl?: (enabled: boolean) => void;
    onClearSelectionOverlays?: () => void;
}

interface MyDrawingsPanelState {
    drawings: ExtendedGraphic[];
    selectedGraphicIndex: number | null;
    sortOption: 'name' | 'type' | 'created';
    editingGraphicIndex: number | null;
    alertMessage: string;
    alertType: 'success' | 'error' | 'info' | 'warning';
    showAlert: boolean;
    consentGranted: boolean | null;
    graphicsWatchHandle: __esri.WatchHandle | null;

    // Confirm dialog
    confirmDialogOpen: boolean;
    confirmDialogAction: (() => void) | null;
    confirmDialogMessage: string;
    confirmDialogType: 'delete' | 'clearAll';
    confirmDialogItemIndex: number | null;

    // Import
    importDialogOpen: boolean;
    importFile: File | null;
    importFileContent: string | null;

    // Selection
    selectedGraphics: Set<number>;
    symbolEditingIndex: number | null;
    showStorageDisclaimer: boolean;

    // Text editor values
    textValue: string;

    // Text symbol editing properties
    fontColor: string;
    fontSize: number;
    fontFamily: string;
    fontOpacity: number;
    fontRotation: number;

    // Text alignment
    horizontalAlignment: 'left' | 'center' | 'right';
    verticalAlignment: 'baseline' | 'top' | 'middle' | 'bottom';

    // Button active states
    hAlignLeftActive: boolean;
    hAlignCenterActive: boolean;
    hAlignRightActive: boolean;
    vAlignBaseActive: boolean;
    vAlignTopActive: boolean;
    vAlignMidActive: boolean;
    vAlignBotActive: boolean;
    fsBoldActive: boolean;
    fsItalicActive: boolean;
    fsUnderlineActive: boolean;

    // Font style
    fontWeight: string;
    fontStyle: string;
    fontDecoration: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;

    // Halo properties
    fontHaloEnabled: boolean;
    fontHaloColor: string;
    fontHaloSize: number;
    fontHaloOpacity: number;

    // TextSymbol object for editor
    currentTextSymbol: TextSymbol;

    // Restore prompt
    showLoadPrompt: boolean;
    hasExistingDrawings: boolean;
}

export class MyDrawingsPanel extends React.PureComponent<MyDrawingsPanelProps, MyDrawingsPanelState> {
    sketchViewModel: SketchViewModel | null = null;
    private localStorageKey: string;
    private isDeletingGraphics = false;
    private ignoreNextGraphicsUpdate = false;
    private internalSketchVM = true; // Track if we're using our own SketchVM or parent's
    private measurementStylesInitialized = false;
    private _mapClickSyncEnabled = true;
    private _drawingMap: Map<string, number> = new Map();
    private _refreshDrawingsOriginal: () => void;
    private _cleanMeasurementLabelsHandler: __esri.WatchHandle | null = null;
    private _measurementStyleWatcher: __esri.WatchHandle | null = null;
    private _positionWatchers: { [key: string]: __esri.WatchHandle } = {};
    private _savePositionTimeout: any = null;
    private _loadChoiceMadeThisSession = false;
    private static _drawingsLoadChoiceTimestamp: number = 0;
    private _afterRefreshDrawings: () => void = null;
    private _graphicsWatchHandles: __esri.WatchHandle[] = [];
    private _goToController: AbortController | null = null;
    private _measurementWasEnabled: boolean = false;
    private _originalQuality: string = 'high';
    private _isInteracting: boolean = false;
    private processedMeasurementGraphics = new Set<string>()
    private projectGeometryToWGS84 = async (geometry: __esri.Geometry): Promise<__esri.Geometry | null> => {
        try {
            // Ensure projection module is loaded
            await projection.load();

            // Target WGS84 spatial reference
            const wgs84SR = new SpatialReference({ wkid: 4326 });

            // If already in WGS84, return as-is
            if (geometry.spatialReference && geometry.spatialReference.wkid === 4326) {
                return geometry;
            }

            // Project the geometry to WGS84 with proper type casting
            const projectedGeometry = projection.project(geometry as any, wgs84SR) as __esri.Geometry;

            return projectedGeometry;
        } catch (error) {
            console.error('Error projecting geometry to WGS84:', error);
            return null;
        }
    };
    private convertGeometryToWGS84 = (geometry: __esri.Geometry): __esri.Geometry | null => {
        const mapSR = geometry.spatialReference;

        if (!mapSR) {
            console.warn('No spatial reference found, assuming WGS84');
            return geometry;
        }

        // If already WGS84, return as-is
        if (mapSR.wkid === 4326) {
            return geometry;
        }

        try {
            switch (geometry.type) {
                case 'point':
                    const point = geometry as __esri.Point;
                    const convertedCoords = this.convertCoordinateManually(point.x, point.y, mapSR.wkid);

                    return {
                        type: 'point',
                        x: convertedCoords.lon,
                        y: convertedCoords.lat,
                        longitude: convertedCoords.lon,
                        latitude: convertedCoords.lat,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Point;

                case 'polyline':
                    const polyline = geometry as __esri.Polyline;
                    const convertedPaths = polyline.paths.map(path =>
                        path.map(coord => {
                            const converted = this.convertCoordinateManually(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polyline',
                        paths: convertedPaths,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polyline;

                case 'polygon':
                    const polygon = geometry as __esri.Polygon;
                    const convertedRings = polygon.rings.map(ring =>
                        ring.map(coord => {
                            const converted = this.convertCoordinateManually(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polygon',
                        rings: convertedRings,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polygon;

                case 'extent':
                    const extent = geometry as __esri.Extent;
                    const sw = this.convertCoordinateManually(extent.xmin, extent.ymin, mapSR.wkid);
                    const ne = this.convertCoordinateManually(extent.xmax, extent.ymax, mapSR.wkid);

                    return {
                        type: 'extent',
                        xmin: sw.lon,
                        ymin: sw.lat,
                        xmax: ne.lon,
                        ymax: ne.lat,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Extent;

                default:
                    console.warn(`Cannot convert geometry type: ${geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error in geometry conversion:', error);
            return null;
        }
    };

    // Enhanced manual coordinate conversion with better State Plane support
    private convertCoordinateManually = (x: number, y: number, wkid: number): { lon: number; lat: number } => {
        //console.log(`Converting coordinates: ${x}, ${y} from WKID: ${wkid}`);

        // Web Mercator
        if (wkid === 3857 || wkid === 102100) {
            const lon = (x / 20037508.34) * 180;
            const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
            return { lon, lat };
        }

        // UTM zones
        if (wkid >= 32601 && wkid <= 32660) {
            // UTM North
            const zone = wkid - 32600;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;
            const roughLon = centralMeridian + (x - 500000) / 111320;
            const roughLat = y / 110540;
            return {
                lon: Math.max(-180, Math.min(180, roughLon)),
                lat: Math.max(-90, Math.min(90, roughLat))
            };
        }

        if (wkid >= 32701 && wkid <= 32760) {
            // UTM South
            const zone = wkid - 32700;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;
            const roughLon = centralMeridian + (x - 500000) / 111320;
            const roughLat = (y - 10000000) / 110540;
            return {
                lon: Math.max(-180, Math.min(180, roughLon)),
                lat: Math.max(-90, Math.min(90, roughLat))
            };
        }

        // State Plane Coordinate Systems (rough approximations based on WKID ranges)
        // These are approximate conversions - for production use, proper projection libraries would be better

        // State Plane zones typically have large coordinate values
        if (wkid >= 2001 && wkid <= 5000) {
            // Most State Plane coordinate systems
            let scale = 1;
            let offsetX = 0;
            let offsetY = 0;

            // Determine if coordinates are in feet or meters based on magnitude
            const isFeet = Math.abs(x) > 1000000 || Math.abs(y) > 1000000;

            if (isFeet) {
                // Convert feet to meters first
                scale = 0.3048;
            }

            // Very rough conversion - this is not geodetically accurate
            // but provides a starting point for State Plane coordinates
            const meterX = x * scale;
            const meterY = y * scale;

            // Rough approximation: assume coordinates are relative to a central point
            // This is highly approximate and location-dependent
            let roughLon = meterX / 111320; // meters per degree longitude at equator
            let roughLat = meterY / 110540; // meters per degree latitude

            // Try to determine approximate region based on WKID
            if (wkid >= 2001 && wkid <= 2099) {
                // NAD83 State Plane zones - generally US
                roughLon += -98; // Rough center longitude of US
                roughLat += 39;  // Rough center latitude of US
            } else if (wkid >= 3001 && wkid <= 3999) {
                // Other State Plane systems
                roughLon += -100;
                roughLat += 40;
            }

            return {
                lon: Math.max(-180, Math.min(180, roughLon)),
                lat: Math.max(-90, Math.min(90, roughLat))
            };
        }

        // If coordinates look like they might already be geographic
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
            return { lon: x, lat: y };
        }

        // Last resort: scale down large coordinates
        const scaleFactor = Math.max(Math.abs(x), Math.abs(y)) > 1000000 ? 0.000001 : 0.001;
        return {
            lon: Math.max(-180, Math.min(180, x * scaleFactor)),
            lat: Math.max(-90, Math.min(90, y * scaleFactor))
        };
    };

    private projectGeometryToWGS84Alternative = async (geometry: __esri.Geometry): Promise<__esri.Geometry | null> => {
        try {
            // Target WGS84 spatial reference
            const wgs84SR = new SpatialReference({ wkid: 4326 });

            // If already in WGS84, return as-is
            if (geometry.spatialReference && geometry.spatialReference.wkid === 4326) {
                return geometry;
            }

            // Try to load and use projection module
            try {
                await projection.load();
                const projectedGeometry = projection.project(geometry as any, wgs84SR) as __esri.Geometry;
                return projectedGeometry;
            } catch (projectionError) {
                console.warn('Projection module failed, using manual conversion');
                return this.manualProjectionFallback(geometry);
            }

        } catch (error) {
            console.error('Error projecting geometry to WGS84:', error);
            return this.manualProjectionFallback(geometry);
        }
    };

    // Manual projection fallback for common coordinate systems
    private manualProjectionFallback = (geometry: __esri.Geometry): __esri.Geometry | null => {
        const mapSR = geometry.spatialReference;

        if (!mapSR) {
            console.warn('No spatial reference found, assuming WGS84');
            return geometry;
        }

        try {
            switch (geometry.type) {
                case 'point':
                    const point = geometry as __esri.Point;
                    const convertedCoords = this.convertCoordinateManually(point.x, point.y, mapSR.wkid);

                    return new Point({
                        longitude: convertedCoords.lon,
                        latitude: convertedCoords.lat,
                        spatialReference: { wkid: 4326 }
                    });

                case 'polyline':
                    const polyline = geometry as __esri.Polyline;
                    const convertedPaths = polyline.paths.map(path =>
                        path.map(coord => {
                            const converted = this.convertCoordinateManually(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polyline',
                        paths: convertedPaths,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polyline;

                case 'polygon':
                    const polygon = geometry as __esri.Polygon;
                    const convertedRings = polygon.rings.map(ring =>
                        ring.map(coord => {
                            const converted = this.convertCoordinateManually(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polygon',
                        rings: convertedRings,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polygon;

                case 'extent':
                    const extent = geometry as __esri.Extent;
                    const sw = this.convertCoordinateManually(extent.xmin, extent.ymin, mapSR.wkid);
                    const ne = this.convertCoordinateManually(extent.xmax, extent.ymax, mapSR.wkid);

                    return {
                        type: 'extent',
                        xmin: sw.lon,
                        ymin: sw.lat,
                        xmax: ne.lon,
                        ymax: ne.lat,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Extent;

                default:
                    console.warn(`Cannot manually convert geometry type: ${geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error in manual projection fallback:', error);
            return null;
        }
    };

    // Use the alternative projection method in your convertToStandardGeoJSON
    private convertToStandardGeoJSON = async (geometry: __esri.Geometry): Promise<any> => {
        if (!geometry) {
            console.warn('No geometry provided');
            return null;
        }

        // console.log('Converting geometry:', {
        //   type: geometry.type,
        //   spatialReference: geometry.spatialReference?.wkid
        // });

        try {
            // Use the existing projection method
            const wgs84Geometry = await this.projectGeometryToWGS84Alternative(geometry);

            if (!wgs84Geometry) {
                console.warn('Failed to convert geometry to WGS84');
                return null;
            }

            // Now convert to GeoJSON
            switch (wgs84Geometry.type) {
                case 'point':
                    const point = wgs84Geometry as __esri.Point;
                    const lon = point.longitude || point.x;
                    const lat = point.latitude || point.y;

                    //console.log(`Point converted to: ${lon}, ${lat}`);

                    if (!this.isValidCoordinate(lon, lat)) {
                        console.warn(`Invalid point coordinates: ${lon}, ${lat}`);
                        return null;
                    }

                    return {
                        type: 'Point',
                        coordinates: [Number(lon.toFixed(8)), Number(lat.toFixed(8))]
                    };

                case 'polyline':
                    const polyline = wgs84Geometry as __esri.Polyline;
                    const paths = [];

                    for (const path of polyline.paths) {
                        const convertedPath = [];
                        for (const coord of path) {
                            const lon = coord[0];
                            const lat = coord[1];
                            if (this.isValidCoordinate(lon, lat)) {
                                convertedPath.push([Number(lon.toFixed(8)), Number(lat.toFixed(8))]);
                            }
                        }
                        if (convertedPath.length > 1) {
                            paths.push(convertedPath);
                        }
                    }

                    if (paths.length === 0) return null;

                    return {
                        type: paths.length === 1 ? 'LineString' : 'MultiLineString',
                        coordinates: paths.length === 1 ? paths[0] : paths
                    };

                case 'polygon':
                    const polygon = wgs84Geometry as __esri.Polygon;
                    const rings = [];

                    for (const ring of polygon.rings) {
                        const convertedRing = [];
                        for (const coord of ring) {
                            const lon = coord[0];
                            const lat = coord[1];
                            if (this.isValidCoordinate(lon, lat)) {
                                convertedRing.push([Number(lon.toFixed(8)), Number(lat.toFixed(8))]);
                            }
                        }
                        if (convertedRing.length > 3) {
                            const first = convertedRing[0];
                            const last = convertedRing[convertedRing.length - 1];
                            if (first[0] !== last[0] || first[1] !== last[1]) {
                                convertedRing.push([first[0], first[1]]);
                            }
                            rings.push(convertedRing);
                        }
                    }

                    //console.log(`Polygon converted with ${rings.length} rings`);

                    if (rings.length === 0) return null;

                    return {
                        type: 'Polygon',
                        coordinates: rings
                    };

                case 'extent':
                    const extent = wgs84Geometry as __esri.Extent;

                    return {
                        type: 'Polygon',
                        coordinates: [[
                            [Number(extent.xmin.toFixed(8)), Number(extent.ymin.toFixed(8))],
                            [Number(extent.xmax.toFixed(8)), Number(extent.ymin.toFixed(8))],
                            [Number(extent.xmax.toFixed(8)), Number(extent.ymax.toFixed(8))],
                            [Number(extent.xmin.toFixed(8)), Number(extent.ymax.toFixed(8))],
                            [Number(extent.xmin.toFixed(8)), Number(extent.ymin.toFixed(8))]
                        ]]
                    };

                default:
                    console.warn(`Unsupported geometry type: ${wgs84Geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error converting geometry:', error);
            return null;
        }
    };

    private manualProjectionFallbackEnhanced = (geometry: __esri.Geometry): __esri.Geometry | null => {
        const mapSR = geometry.spatialReference;

        if (!mapSR) {
            console.warn('No spatial reference found, assuming WGS84');
            return geometry;
        }

        //console.log(`Enhanced manual conversion from WKID: ${mapSR.wkid}`);

        try {
            switch (geometry.type) {
                case 'point':
                    const point = geometry as __esri.Point;
                    const convertedCoords = this.convertCoordinateManuallyEnhanced(point.x, point.y, mapSR.wkid);

                    return new Point({
                        longitude: convertedCoords.lon,
                        latitude: convertedCoords.lat,
                        spatialReference: { wkid: 4326 }
                    });

                case 'polyline':
                    const polyline = geometry as __esri.Polyline;
                    const convertedPaths = polyline.paths.map(path =>
                        path.map(coord => {
                            const converted = this.convertCoordinateManuallyEnhanced(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polyline',
                        paths: convertedPaths,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polyline;

                case 'polygon':
                    const polygon = geometry as __esri.Polygon;
                    const convertedRings = polygon.rings.map(ring =>
                        ring.map(coord => {
                            const converted = this.convertCoordinateManuallyEnhanced(coord[0], coord[1], mapSR.wkid);
                            return [converted.lon, converted.lat];
                        })
                    );

                    return {
                        type: 'polygon',
                        rings: convertedRings,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Polygon;

                case 'extent':
                    const extent = geometry as __esri.Extent;
                    const sw = this.convertCoordinateManuallyEnhanced(extent.xmin, extent.ymin, mapSR.wkid);
                    const ne = this.convertCoordinateManuallyEnhanced(extent.xmax, extent.ymax, mapSR.wkid);

                    return {
                        type: 'extent',
                        xmin: sw.lon,
                        ymin: sw.lat,
                        xmax: ne.lon,
                        ymax: ne.lat,
                        spatialReference: { wkid: 4326 }
                    } as __esri.Extent;

                default:
                    console.warn(`Cannot manually convert geometry type: ${geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error in enhanced manual projection fallback:', error);
            return null;
        }
    };
    private convertCoordinateManuallyEnhanced = (x: number, y: number, wkid: number): { lon: number; lat: number } => {
        //console.log(`Converting coordinates: ${x}, ${y} from WKID: ${wkid}`);

        // Web Mercator (most common)
        if (wkid === 3857 || wkid === 102100) {
            const lon = (x / 20037508.34) * 180;
            const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
            return {
                lon: Math.max(-180, Math.min(180, lon)),
                lat: Math.max(-90, Math.min(90, lat))
            };
        }

        // UTM zones (Northern Hemisphere)
        if (wkid >= 32601 && wkid <= 32660) {
            const zone = wkid - 32600;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;

            // More accurate UTM to Geographic conversion
            const k0 = 0.9996; // UTM scale factor
            const e = 0.00669438; // Earth's eccentricity squared
            const e1sq = e / (1 - e);
            const a = 6378137; // Earth's radius in meters

            const x1 = x - 500000; // Remove false easting
            const y1 = y; // Keep northing as-is for northern hemisphere

            // Rough conversion (simplified)
            const roughLat = y1 / 110540; // meters per degree latitude
            const roughLon = centralMeridian + (x1 / (111320 * Math.cos(roughLat * Math.PI / 180)));

            return {
                lon: Math.max(-180, Math.min(180, roughLon)),
                lat: Math.max(-90, Math.min(90, roughLat))
            };
        }

        // UTM zones (Southern Hemisphere)
        if (wkid >= 32701 && wkid <= 32760) {
            const zone = wkid - 32700;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;

            const x1 = x - 500000; // Remove false easting
            const y1 = y - 10000000; // Remove false northing for southern hemisphere

            const roughLat = y1 / 110540; // meters per degree latitude
            const roughLon = centralMeridian + (x1 / (111320 * Math.cos(Math.abs(roughLat) * Math.PI / 180)));

            return {
                lon: Math.max(-180, Math.min(180, roughLon)),
                lat: Math.max(-90, Math.min(90, roughLat))
            };
        }

        // State Plane Coordinate Systems - Enhanced with more specific conversions
        if (wkid >= 2001 && wkid <= 5000) {
            let scale = 1;
            let centerLon = -98; // Default US center longitude
            let centerLat = 39;  // Default US center latitude

            // Better detection of units (feet vs meters)
            const isFeet = Math.abs(x) > 1000000 || Math.abs(y) > 1000000;
            if (isFeet) {
                scale = 0.3048; // Convert feet to meters
            }

            // Regional adjustments based on WKID ranges
            if (wkid >= 2001 && wkid <= 2099) {
                // NAD83 State Plane zones
                if (wkid >= 2001 && wkid <= 2020) {
                    // Eastern US states
                    centerLon = -77;
                    centerLat = 40;
                } else if (wkid >= 2021 && wkid <= 2050) {
                    // Central US states
                    centerLon = -95;
                    centerLat = 35;
                } else if (wkid >= 2051 && wkid <= 2099) {
                    // Western US states
                    centerLon = -115;
                    centerLat = 37;
                }
            }

            // More accurate State Plane conversion
            const meterX = x * scale;
            const meterY = y * scale;

            // Improved conversion accounting for Earth's curvature
            const latRadians = centerLat * Math.PI / 180;
            const metersPerDegreeLon = 111320 * Math.cos(latRadians);

            const deltaLon = meterX / metersPerDegreeLon;
            const deltaLat = meterY / 110540;

            const finalLon = centerLon + deltaLon;
            const finalLat = centerLat + deltaLat;

            return {
                lon: Math.max(-180, Math.min(180, finalLon)),
                lat: Math.max(-90, Math.min(90, finalLat))
            };
        }

        // Additional common coordinate systems

        // British National Grid (EPSG:27700)
        if (wkid === 27700) {
            // Rough conversion for British National Grid
            // This is a very approximate conversion - for production use a proper transformation library
            const centerLon = -2; // Approximate center of UK
            const centerLat = 54;

            const deltaLon = (x - 400000) / 70000; // Very rough approximation
            const deltaLat = (y - 100000) / 110000;

            return {
                lon: Math.max(-180, Math.min(180, centerLon + deltaLon)),
                lat: Math.max(-90, Math.min(90, centerLat + deltaLat))
            };
        }

        // If coordinates already look like geographic coordinates
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
            return { lon: x, lat: y };
        }

        // Last resort: intelligent scaling based on coordinate magnitude
        let scaleFactor = 1;
        const maxCoord = Math.max(Math.abs(x), Math.abs(y));

        if (maxCoord > 10000000) {
            scaleFactor = 0.0000001; // Very large coordinates
        } else if (maxCoord > 1000000) {
            scaleFactor = 0.000001;  // Large coordinates (likely state plane feet)
        } else if (maxCoord > 100000) {
            scaleFactor = 0.00001;   // Medium coordinates
        } else if (maxCoord > 10000) {
            scaleFactor = 0.001;     // Smaller coordinates
        }

        const scaledLon = x * scaleFactor;
        const scaledLat = y * scaleFactor;

        // Apply regional offset if coordinates are too far from expected geographic ranges
        let finalLon = scaledLon;
        let finalLat = scaledLat;

        // If scaled coordinates are still way off, try to guess the region
        if (Math.abs(finalLon) > 180 || Math.abs(finalLat) > 90) {
            // Very rough regional guessing based on original coordinate magnitude and sign
            if (x > 0 && y > 0 && maxCoord > 100000) {
                // Likely Eastern hemisphere, northern region
                finalLon = -100 + (scaledLon % 60);
                finalLat = 40 + (scaledLat % 30);
            } else if (x < 0 && y > 0 && maxCoord > 100000) {
                // Likely Western hemisphere, northern region  
                finalLon = -120 + (Math.abs(scaledLon) % 60);
                finalLat = 35 + (scaledLat % 30);
            } else {
                // Default to center of continental US
                finalLon = -98;
                finalLat = 39;
            }
        }

        //console.log(`Applied scaling factor ${scaleFactor} to coordinates, result: ${finalLon}, ${finalLat}`);

        return {
            lon: Math.max(-180, Math.min(180, finalLon)),
            lat: Math.max(-90, Math.min(90, finalLat))
        };
    };
    private projectGeometryFromWGS84 = async (wgs84Geometry: __esri.Geometry, targetSR: __esri.SpatialReference): Promise<__esri.Geometry | null> => {
        try {
            // Try using ArcGIS projection engine first
            try {
                await projection.load();
                // Type cast the geometry to satisfy the projection engine requirements
                const projectedResult = projection.project(wgs84Geometry as any, targetSR);

                if (projectedResult) {
                    // Handle the case where projection.project might return an array
                    const projectedGeometry = Array.isArray(projectedResult) ? projectedResult[0] : projectedResult;

                    if (projectedGeometry) {
                        //console.log(`Successfully projected from WGS84 to WKID ${targetSR.wkid} using ArcGIS projection engine`);
                        return projectedGeometry as __esri.Geometry;
                    }
                }
            } catch (projectionError) {
                console.warn('ArcGIS projection engine failed during WGS84 conversion, using manual method:', projectionError);
            }

            // Fallback to manual conversion
            return this.manualProjectionFromWGS84(wgs84Geometry, targetSR);

        } catch (error) {
            console.error('Error projecting from WGS84:', error);
            return this.manualProjectionFromWGS84(wgs84Geometry, targetSR);
        }
    };

    private manualProjectionFromWGS84 = (wgs84Geometry: __esri.Geometry, targetSR: __esri.SpatialReference): __esri.Geometry | null => {
        if (!targetSR || targetSR.wkid === 4326) {
            return wgs84Geometry; // Already in WGS84
        }

        try {
            switch (wgs84Geometry.type) {
                case 'point':
                    const point = wgs84Geometry as __esri.Point;
                    const lon = point.longitude || point.x;
                    const lat = point.latitude || point.y;
                    const converted = this.convertFromWGS84Enhanced(lon, lat, targetSR.wkid);

                    return new Point({
                        x: converted.x,
                        y: converted.y,
                        spatialReference: targetSR
                    });

                case 'polyline':
                    const polyline = wgs84Geometry as __esri.Polyline;
                    const convertedPaths = polyline.paths.map(path =>
                        path.map(coord => {
                            const converted = this.convertFromWGS84Enhanced(coord[0], coord[1], targetSR.wkid);
                            return [converted.x, converted.y];
                        })
                    );

                    return {
                        type: 'polyline',
                        paths: convertedPaths,
                        spatialReference: targetSR
                    } as __esri.Polyline;

                case 'polygon':
                    const polygon = wgs84Geometry as __esri.Polygon;
                    const convertedRings = polygon.rings.map(ring =>
                        ring.map(coord => {
                            const converted = this.convertFromWGS84Enhanced(coord[0], coord[1], targetSR.wkid);
                            return [converted.x, converted.y];
                        })
                    );

                    return {
                        type: 'polygon',
                        rings: convertedRings,
                        spatialReference: targetSR
                    } as __esri.Polygon;

                default:
                    console.warn(`Cannot project geometry type: ${wgs84Geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error in manual projection from WGS84:', error);
            return null;
        }
    };

    private convertFromWGS84Enhanced = (lon: number, lat: number, wkid: number): { x: number; y: number } => {
        // If target is WGS84, return as-is
        if (wkid === 4326) {
            return { x: lon, y: lat };
        }

        console.log(`Converting WGS84 coordinates ${lon}, ${lat} to WKID: ${wkid}`);

        // Web Mercator
        if (wkid === 3857 || wkid === 102100) {
            const x = lon * 20037508.34 / 180;
            const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
            return { x, y };
        }

        // UTM zones (Northern Hemisphere)
        if (wkid >= 32601 && wkid <= 32660) {
            const zone = wkid - 32600;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;

            // More accurate WGS84 to UTM conversion
            const latRad = lat * Math.PI / 180;
            const lonRad = lon * Math.PI / 180;
            const centralMeridianRad = centralMeridian * Math.PI / 180;

            // Simplified UTM projection (not geodetically perfect but much better than linear)
            const k0 = 0.9996; // UTM scale factor
            const a = 6378137; // Earth's radius in meters
            const e = 0.00669438; // Earth's eccentricity squared

            const N = a / Math.sqrt(1 - e * Math.sin(latRad) * Math.sin(latRad));
            const T = Math.tan(latRad) * Math.tan(latRad);
            const C = e * Math.cos(latRad) * Math.cos(latRad) / (1 - e);
            const A = Math.cos(latRad) * (lonRad - centralMeridianRad);

            const x = 500000 + k0 * N * (A + (1 - T + C) * A * A * A / 6);
            const y = k0 * (a * (lat * Math.PI / 180) + N * Math.tan(latRad) * (A * A / 2));

            return { x, y };
        }

        // UTM zones (Southern Hemisphere)
        if (wkid >= 32701 && wkid <= 32760) {
            const zone = wkid - 32700;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;

            // Similar to northern hemisphere but with false northing
            const latRad = lat * Math.PI / 180;
            const lonRad = lon * Math.PI / 180;
            const centralMeridianRad = centralMeridian * Math.PI / 180;

            const k0 = 0.9996;
            const a = 6378137;
            const e = 0.00669438;

            const N = a / Math.sqrt(1 - e * Math.sin(latRad) * Math.sin(latRad));
            const T = Math.tan(latRad) * Math.tan(latRad);
            const C = e * Math.cos(latRad) * Math.cos(latRad) / (1 - e);
            const A = Math.cos(latRad) * (lonRad - centralMeridianRad);

            const x = 500000 + k0 * N * (A + (1 - T + C) * A * A * A / 6);
            const y = 10000000 + k0 * (a * (lat * Math.PI / 180) + N * Math.tan(latRad) * (A * A / 2));

            return { x, y };
        }

        // State Plane Coordinate Systems - Enhanced reverse conversion
        if (wkid >= 2001 && wkid <= 5000) {
            let centerLon = -98; // Default US center longitude
            let centerLat = 39;  // Default US center latitude
            let usesFeet = false;

            // Regional adjustments based on WKID ranges (approximate)
            if (wkid >= 2001 && wkid <= 2020) {
                // Eastern US states
                centerLon = -77;
                centerLat = 40;
                usesFeet = true; // Many eastern state plane systems use feet
            } else if (wkid >= 2021 && wkid <= 2050) {
                // Central US states  
                centerLon = -95;
                centerLat = 35;
                usesFeet = true;
            } else if (wkid >= 2051 && wkid <= 2099) {
                // Western US states
                centerLon = -115;
                centerLat = 37;
                usesFeet = false; // Many western systems use meters
            }

            // Calculate deltas from regional center
            const deltaLon = lon - centerLon;
            const deltaLat = lat - centerLat;

            // Convert to approximate projected coordinates
            const latRadians = centerLat * Math.PI / 180;
            const metersPerDegreeLon = 111320 * Math.cos(latRadians);

            let x = deltaLon * metersPerDegreeLon;
            let y = deltaLat * 110540;

            // Convert to feet if the system uses feet
            if (usesFeet) {
                x = x / 0.3048;
                y = y / 0.3048;
            }

            // Add typical state plane false easting/northing
            x += usesFeet ? 2000000 : 500000; // Typical false easting
            y += usesFeet ? 0 : 0; // Most don't have false northing

            return { x, y };
        }

        // British National Grid (EPSG:27700) - reverse conversion
        if (wkid === 27700) {
            const centerLon = -2;
            const centerLat = 54;

            const deltaLon = lon - centerLon;
            const deltaLat = lat - centerLat;

            const x = 400000 + deltaLon * 70000; // Very rough approximation
            const y = 100000 + deltaLat * 110000;

            return { x, y };
        }

        // Default fallback - assume a local coordinate system
        // Try to scale appropriately based on the WKID
        let scaleFactor = 111320; // Approximate meters per degree at equator
        let falseEasting = 0;
        let falseNorthing = 0;

        // For high WKID numbers, assume they might be in feet
        if (wkid > 10000) {
            scaleFactor = scaleFactor / 0.3048; // Convert to feet
            falseEasting = 2000000; // Common false easting in feet
        }

        const x = falseEasting + (lon + 180) * scaleFactor / 360; // Normalize longitude
        const y = falseNorthing + lat * scaleFactor / 90; // Normalize latitude

        console.log(`Applied fallback conversion with scale factor ${scaleFactor}`);

        return { x, y };
    };
    private detectImportFormat = (content: string): 'geojson' | 'legacy' | 'unknown' => {
        try {
            const parsed = JSON.parse(content);

            // Check if it's GeoJSON
            if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
                return 'geojson';
            }

            // Check if it's legacy format
            if (parsed.drawings || Array.isArray(parsed) || parsed.version) {
                return 'legacy';
            }

            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    };

    private processNewMeasurementLabel = (graphic: __esri.Graphic): boolean => {
        // Check if this is a measurement label that needs processing
        if (!graphic ||
            !graphic.attributes ||
            !graphic.attributes.isMeasurementLabel ||
            !graphic.symbol ||
            graphic.symbol.type !== 'text') {
            return false;
        }

        const graphicId = this.getGraphicId(graphic);

        // Skip if already processed
        if (this.processedMeasurementGraphics.has(graphicId)) {
            return false;
        }

        try {
            // Store the text content
            const labelText = graphic.symbol.text;

            // FIXED: Instead of creating a completely new symbol, preserve the existing symbol
            // and only update it if it's missing essential properties
            const existingSymbol = graphic.symbol as __esri.TextSymbol;

            // Check if the symbol already has proper styling - if so, don't modify it
            if (existingSymbol.color &&
                existingSymbol.font &&
                existingSymbol.haloColor !== undefined &&
                existingSymbol.haloSize !== undefined) {

                // Symbol is already properly styled, just mark as processed
                this.processedMeasurementGraphics.add(graphicId);
                if (!graphic.attributes) graphic.attributes = {};
                graphic.attributes._styleFixed = true;

                //console.log(`Measurement label already properly styled, skipping: ${graphicId}`);
                return true;
            }

            // Only apply clean symbol if the existing symbol is missing essential properties
            // This preserves styling from the measure.tsx component
            const cleanSymbol = existingSymbol.clone();

            // Only set defaults for missing properties
            if (!cleanSymbol.color) {
                cleanSymbol.color = new Color([0, 0, 0, 1]);
            }

            if (!cleanSymbol.font || !cleanSymbol.font.family) {
                cleanSymbol.font = new Font({
                    family: cleanSymbol.font?.family || "Arial",
                    size: cleanSymbol.font?.size || 12,
                    weight: cleanSymbol.font?.weight || "normal",
                    style: cleanSymbol.font?.style || "normal",
                    decoration: cleanSymbol.font?.decoration || "none"
                });
            }

            // Preserve existing halo settings or set defaults only if they don't exist
            if (cleanSymbol.haloColor === null && cleanSymbol.haloSize === null) {
                // Only set default halo if none exists
                cleanSymbol.haloColor = new Color([255, 255, 255, 1]);
                cleanSymbol.haloSize = 2;
            }

            if (!cleanSymbol.horizontalAlignment) {
                cleanSymbol.horizontalAlignment = "center";
            }

            if (!cleanSymbol.verticalAlignment) {
                cleanSymbol.verticalAlignment = "middle";
            }

            // Ensure text content is preserved
            cleanSymbol.text = labelText;

            // Replace the symbol only if we made changes
            graphic.symbol = cleanSymbol;

            // Mark this graphic as processed
            this.processedMeasurementGraphics.add(graphicId);

            // Also set the flag on the graphic itself as a backup
            if (!graphic.attributes) graphic.attributes = {};
            graphic.attributes._styleFixed = true;

            //console.log(`Applied minimal clean symbol to measurement label with ID: ${graphicId}`);
            return true;
        } catch (error) {
            console.error('Error processing measurement label:', error);
            return false;
        }
    };
    private verifyLayerState = () => {
        if (!this.props.graphicsLayer) return;

        // Count actual drawings (exclude measurement labels)
        const layerGraphics = this.props.graphicsLayer.graphics.toArray();
        const actualDrawings = layerGraphics.filter(g =>
            !g.attributes?.isMeasurementLabel &&
            !g.attributes?.hideFromList
        );

        const measurementLabels = layerGraphics.filter(g =>
            g.attributes?.isMeasurementLabel
        );

        //console.log(`📈 Layer verification:`);
        //console.log(`   - Drawings in state: ${this.state.drawings.length}`);
        //console.log(`   - Actual drawings in layer: ${actualDrawings.length}`);
        //console.log(`   - Measurement labels in layer: ${measurementLabels.length}`);
        //console.log(`   - Total graphics in layer: ${layerGraphics.length}`);

        // If there's a mismatch, force a refresh
        if (actualDrawings.length !== this.state.drawings.length) {
            console.warn(`⚠️ State mismatch detected! Forcing refresh...`);
            this.refreshDrawingsFromLayer();
        } else {
            //console.log(`✅ Layer state verified - everything matches`);
        }
    }

    private removeMeasurementLabels = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.props.graphicsLayer) return;

        //console.log(`🧹 Starting measurement cleanup for:`, graphic.attributes?.name);

        try {
            const graphicUniqueId = graphic.attributes?.uniqueId;
            let removedCount = 0;

            // 🔧 NEW: Remove attached buffer FIRST
            if (graphic.bufferGraphic) {
                //console.log(`🗑️ Removing attached buffer for graphic ${graphicUniqueId}`);
                this.props.graphicsLayer.remove(graphic.bufferGraphic);
                graphic.bufferGraphic = null;
                removedCount++;
            }

            // Clear buffer settings
            if (graphic.bufferSettings) {
                graphic.bufferSettings = null;
            }

            // Get all graphics from the layer
            const allGraphics = this.props.graphicsLayer.graphics.toArray();

            // Find measurement labels that belong to this specific graphic
            const labelsToRemove = allGraphics.filter(g => {
                const gAsExtended = g as ExtendedGraphic;

                // Check if this is a measurement label
                if (!gAsExtended.attributes?.isMeasurementLabel) return false;

                // Check various ways this label might be linked to our graphic
                return (
                    // Direct reference to the graphic object
                    gAsExtended.measureParent === graphic ||
                    // Parent ID matches
                    (graphicUniqueId && gAsExtended.attributes?.parentGraphicId === graphicUniqueId) ||
                    // Measure graphic reference
                    gAsExtended.measure?.graphic === graphic
                );
            });

            //console.log(`🔍 Found ${labelsToRemove.length} measurement labels to remove`);

            // Remove each identified label
            labelsToRemove.forEach(label => {
                try {
                    this.props.graphicsLayer.remove(label);
                    removedCount++;
                    //console.log(`🗑️ Removed measurement label`);
                } catch (err) {
                    console.error(`❌ Error removing measurement label:`, err);
                }
            });

            // Also clean up direct references stored in the graphic
            if (graphic.measure?.graphic) {
                try {
                    this.props.graphicsLayer.remove(graphic.measure.graphic);
                    removedCount++;
                    //console.log(`🗑️ Removed direct measure graphic`);
                } catch (err) {
                    console.error(`❌ Error removing direct measure graphic:`, err);
                }
            }

            // Clean up segment labels from attributes
            if (graphic.attributes?.relatedSegmentLabels && Array.isArray(graphic.attributes.relatedSegmentLabels)) {
                graphic.attributes.relatedSegmentLabels.forEach(segmentLabel => {
                    if (segmentLabel) {
                        try {
                            this.props.graphicsLayer.remove(segmentLabel);
                            removedCount++;
                            //console.log(`🗑️ Removed segment label`);
                        } catch (err) {
                            console.error(`❌ Error removing segment label:`, err);
                        }
                    }
                });
            }

            //console.log(`✅ Measurement and buffer cleanup completed. Removed ${removedCount} graphics for:`, graphic.attributes?.name);

        } catch (error) {
            console.error('❌ Error in measurement cleanup:', error);
        }
    };

    private associateMeasurementLabel = (parentGraphic: ExtendedGraphic, measurementLabel: ExtendedGraphic) => {
        if (!parentGraphic || !measurementLabel) return;

        // Ensure the measurement label has proper references to its parent
        if (!measurementLabel.attributes) {
            measurementLabel.attributes = {};
        }

        // Store multiple references to ensure we can find this label later
        measurementLabel.attributes.isMeasurementLabel = true;
        measurementLabel.attributes.parentGraphicId = parentGraphic.attributes?.uniqueId;
        measurementLabel.measureParent = parentGraphic;

        // Also store the reference in the parent graphic for easier cleanup
        if (!parentGraphic.attributes) {
            parentGraphic.attributes = {};
        }
        if (!parentGraphic.attributes.relatedMeasurementLabels) {
            parentGraphic.attributes.relatedMeasurementLabels = [];
        }
        parentGraphic.attributes.relatedMeasurementLabels.push(measurementLabel);

        //console.log(`🔗 Associated measurement label with parent graphic:`, parentGraphic.attributes?.name);
    };
    private cleanupMeasurementLabelsForGraphic = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.props.graphicsLayer) return;

        try {
            //console.log(`Starting aggressive cleanup for graphic: ${graphic.attributes?.name || 'unnamed'}`);
            //console.log(`Graphic uniqueId: ${graphic.attributes?.uniqueId}`);

            // CRITICAL: Cancel SketchViewModel FIRST and clear all selections
            if (this.sketchViewModel) {
                this.sketchViewModel.cancel();
                // Also clear any updateGraphics collection
                if (this.sketchViewModel.updateGraphics) {
                    this.sketchViewModel.updateGraphics.removeAll();
                }
            }

            // Clear any UI selection state
            this.setState({
                selectedGraphicIndex: null,
                symbolEditingIndex: null
            });

            // Add delay to ensure SketchViewModel operations complete
            setTimeout(() => {
                this.performAggressiveCleanup(graphic);
            }, 100);

        } catch (error) {
            console.error('Error in cleanup initiation:', error);
        }
    };
    private performActualCleanup = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.props.graphicsLayer) return;

        try {
            //console.log(`Performing actual cleanup for: ${graphic.attributes?.name || 'unnamed'}`);

            // Method 1: Remove the main measurement label if it exists
            if (graphic.measure?.graphic) {
                //console.log('Removing main measurement graphic');
                this.props.graphicsLayer.remove(graphic.measure.graphic);

                // Clear the reference
                graphic.measure = null;
            }

            // Method 2: Remove segment labels if they exist
            if (graphic.attributes?.relatedSegmentLabels && Array.isArray(graphic.attributes.relatedSegmentLabels)) {
                //console.log(`Removing ${graphic.attributes.relatedSegmentLabels.length} segment labels`);
                graphic.attributes.relatedSegmentLabels.forEach(segmentLabel => {
                    if (segmentLabel) {
                        this.props.graphicsLayer.remove(segmentLabel);
                    }
                });

                // Clear the array
                graphic.attributes.relatedSegmentLabels = [];
            }

            // Method 3: Search for orphaned measurement labels that might reference this graphic
            const allGraphics = this.props.graphicsLayer.graphics.toArray();
            const orphanedMeasurements = allGraphics.filter(g => {
                const extendedG = g as ExtendedGraphic;
                return (
                    extendedG.attributes?.isMeasurementLabel &&
                    (extendedG.measureParent === graphic ||
                        extendedG.attributes?.parentId === graphic.attributes?.uniqueId)
                );
            });

            if (orphanedMeasurements.length > 0) {
                //console.log(`Removing ${orphanedMeasurements.length} orphaned measurement labels`);
                orphanedMeasurements.forEach(orphan => {
                    this.props.graphicsLayer.remove(orphan);
                });
            }

            //console.log('Actual cleanup completed');

            // Force a map refresh after cleanup
            setTimeout(() => {
                this.forceMapRefresh();
            }, 100);

        } catch (error) {
            console.error('Error in actual cleanup:', error);
        }
    };
    // Fixed version with proper TypeScript types:

    private convertToGeographic = (point: __esri.Point): __esri.Point => {
        try {
            // If already in geographic coordinates, return as-is
            if (point.spatialReference && (
                point.spatialReference.wkid === 4326 ||
                (point.spatialReference as any).latestWkid === 4326
            )) {
                return point;
            }

            // Create a new point in WGS84 (Geographic)
            const geographicSR = {
                wkid: 4326
            };

            // If we have access to geometryEngineAsync, use it for projection
            if (typeof geometryEngineAsync !== 'undefined') {
                // Use webMercatorUtils for coordinate conversion instead
                try {
                    // Import webMercatorUtils if available
                    const webMercatorUtils = require('esri/geometry/support/webMercatorUtils');
                    if (webMercatorUtils && webMercatorUtils.webMercatorToGeographic) {
                        return webMercatorUtils.webMercatorToGeographic(point) as __esri.Point;
                    }
                } catch (e) {
                    // Fall through to manual conversion
                }
            }

            // Fallback: if point has longitude/latitude properties, use those
            if (point.longitude !== undefined && point.latitude !== undefined) {
                return point;
            }

            // Last resort: assume Web Mercator and convert manually
            if (point.spatialReference && (
                point.spatialReference.wkid === 3857 ||
                (point.spatialReference as any).latestWkid === 3857
            )) {
                const lon = (point.x / 20037508.34) * 180;
                const lat = (Math.atan(Math.exp((point.y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;

                return {
                    x: lon,
                    y: lat,
                    longitude: lon,
                    latitude: lat,
                    spatialReference: geographicSR
                } as __esri.Point;
            }

            // If we can't convert, return the original point but log a warning
            console.warn('Could not convert point to geographic coordinates:', point);
            return point;

        } catch (error) {
            console.error('Error converting point to geographic:', error);
            return point;
        }
    };

    private convertCoordinateToGeographic = (x: number, y: number): { longitude: number; latitude: number } => {
        try {
            // Get the spatial reference from the map view
            const mapSR = this.props.jimuMapView?.view?.spatialReference;

            // If already in geographic coordinates
            if (mapSR && (mapSR.wkid === 4326 || (mapSR as any).latestWkid === 4326)) {
                return { longitude: x, latitude: y };
            }

            // If Web Mercator, convert manually
            if (mapSR && (mapSR.wkid === 3857 || (mapSR as any).latestWkid === 3857)) {
                const lon = (x / 20037508.34) * 180;
                const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                return { longitude: lon, latitude: lat };
            }

            // For other coordinate systems, assume they're already in the correct format
            // This is a fallback that may need adjustment based on your specific use case
            return { longitude: x, latitude: y };

        } catch (error) {
            console.error('Error converting coordinate to geographic:', error);
            return { longitude: x, latitude: y };
        }
    };

    // Alternative approach using a simpler coordinate conversion method:
    private simpleCoordinateConversion = (geometry: __esri.Geometry): any => {
        if (!geometry) return null;

        try {
            switch (geometry.type) {
                case 'point':
                    const point = geometry as __esri.Point;

                    // Check if we have longitude/latitude directly
                    if (point.longitude !== undefined && point.latitude !== undefined) {
                        return {
                            type: 'Point',
                            coordinates: [point.longitude, point.latitude]
                        };
                    }

                    // Convert Web Mercator to Geographic if needed
                    let lon = point.x;
                    let lat = point.y;

                    if (point.spatialReference && point.spatialReference.wkid === 3857) {
                        lon = (point.x / 20037508.34) * 180;
                        lat = (Math.atan(Math.exp((point.y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                    }

                    return {
                        type: 'Point',
                        coordinates: [lon, lat]
                    };

                case 'polyline':
                    const polyline = geometry as __esri.Polyline;
                    const paths = polyline.paths.map(path =>
                        path.map(coord => {
                            let lon = coord[0];
                            let lat = coord[1];

                            // Convert if Web Mercator
                            if (polyline.spatialReference && polyline.spatialReference.wkid === 3857) {
                                lon = (coord[0] / 20037508.34) * 180;
                                lat = (Math.atan(Math.exp((coord[1] / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                            }

                            return [lon, lat];
                        })
                    );
                    return {
                        type: paths.length > 1 ? 'MultiLineString' : 'LineString',
                        coordinates: paths.length > 1 ? paths : paths[0]
                    };

                case 'polygon':
                    const polygon = geometry as __esri.Polygon;
                    const rings = polygon.rings.map(ring =>
                        ring.map(coord => {
                            let lon = coord[0];
                            let lat = coord[1];

                            // Convert if Web Mercator
                            if (polygon.spatialReference && polygon.spatialReference.wkid === 3857) {
                                lon = (coord[0] / 20037508.34) * 180;
                                lat = (Math.atan(Math.exp((coord[1] / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                            }

                            return [lon, lat];
                        })
                    );
                    return {
                        type: 'Polygon',
                        coordinates: rings
                    };

                case 'extent':
                    const extent = geometry as __esri.Extent;
                    let xmin = extent.xmin;
                    let ymin = extent.ymin;
                    let xmax = extent.xmax;
                    let ymax = extent.ymax;

                    // Convert if Web Mercator
                    if (extent.spatialReference && extent.spatialReference.wkid === 3857) {
                        xmin = (extent.xmin / 20037508.34) * 180;
                        ymin = (Math.atan(Math.exp((extent.ymin / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                        xmax = (extent.xmax / 20037508.34) * 180;
                        ymax = (Math.atan(Math.exp((extent.ymax / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
                    }

                    const coords = [[
                        [xmin, ymin],
                        [xmax, ymin],
                        [xmax, ymax],
                        [xmin, ymax],
                        [xmin, ymin] // Close the ring
                    ]];

                    return {
                        type: 'Polygon',
                        coordinates: coords
                    };

                default:
                    console.warn(`Unsupported geometry type: ${geometry.type}`);
                    return null;
            }
        } catch (error) {
            console.error('Error converting geometry to GeoJSON:', error);
            return null;
        }
    };

    // Replace the convertToGeoJSONGeometry method with this simpler version:
    private convertToGeoJSONGeometry = (geometry: __esri.Geometry): any => {
        return this.simpleCoordinateConversion(geometry);
    };


    private convertSymbolToStandardProperties = (symbol: __esri.Symbol): any => {
        if (!symbol) return {};

        const properties: any = {};

        try {
            switch (symbol.type) {
                case 'simple-marker':
                    const marker = symbol as __esri.SimpleMarkerSymbol;
                    properties.marker_color = marker.color?.toHex() || '#000000';
                    properties.marker_size = marker.size || 12;
                    properties.marker_symbol = marker.style || 'circle';
                    if (marker.outline) {
                        properties.stroke = marker.outline.color?.toHex() || '#000000';
                        properties.stroke_width = marker.outline.width || 1;
                    }
                    break;

                case 'simple-line':
                    const line = symbol as __esri.SimpleLineSymbol;
                    properties.stroke = line.color?.toHex() || '#000000';
                    properties.stroke_width = line.width || 1;
                    properties.stroke_opacity = line.color?.a || 1;
                    break;

                case 'simple-fill':
                    const fill = symbol as __esri.SimpleFillSymbol;
                    properties.fill = fill.color?.toHex() || '#000000';
                    properties.fill_opacity = fill.color?.a || 1;
                    if (fill.outline) {
                        properties.stroke = fill.outline.color?.toHex() || '#000000';
                        properties.stroke_width = fill.outline.width || 1;
                    }
                    break;

                case 'text':
                    const text = symbol as __esri.TextSymbol;
                    properties.text = text.text || '';
                    properties.text_color = text.color?.toHex() || '#000000';
                    properties.text_size = text.font?.size || 12;
                    properties.text_font = text.font?.family || 'Arial';
                    // Preserve font style customizations
                    if (text.font?.weight && text.font.weight !== 'normal') {
                        properties.text_weight = text.font.weight;
                    }
                    if (text.font?.style && text.font.style !== 'normal') {
                        properties.text_style = text.font.style;
                    }
                    if (text.font?.decoration && text.font.decoration !== 'none') {
                        properties.text_decoration = text.font.decoration;
                    }
                    // Preserve text alignment
                    properties.text_align = text.horizontalAlignment || 'center';
                    properties.text_baseline = text.verticalAlignment || 'middle';
                    // Preserve rotation
                    if (text.angle) {
                        properties.text_rotation = text.angle;
                    }
                    // Preserve text opacity (alpha)
                    properties.text_opacity = text.color?.a ?? 1;
                    // Preserve halo settings if any
                    const haloSize = text.haloSize;
                    if (haloSize !== null && haloSize !== undefined) {
                        properties.text_halo_size = haloSize;
                        if (haloSize > 0 && text.haloColor) {
                            properties.text_halo_color = text.haloColor.toHex?.() || '#FFFFFF';
                            properties.text_halo_opacity = text.haloColor.a ?? 1;
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error converting symbol properties:', error);
        }

        return properties;
    };
    // Add debugging to see what's happening in the conversion process

    private generateCompatibleExportData = async (drawingsToExport: ExtendedGraphic[]) => {
        //console.log('Starting export with', drawingsToExport.length, 'drawings');

        const geoJSONFeatures: any[] = [];

        // Helper: ensure we always have a stable ID to round-trip
        const getId = (g: any): string => {
            return g?.attributes?.uniqueId
                || g?.attributes?.id
                || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        };

        // Helper: extract full text symbol styling (doesn't rely solely on convertSymbolToStandardProperties)
        const extractTextSymbolProps = (sym: __esri.Symbol | any) => {
            if (!sym || sym.type !== 'text') return {};
            const ts = sym as __esri.TextSymbol;

            // Font fields
            const font = ts.font || ({} as any);
            const out: any = {
                text: ts.text ?? '',
                text_color: (ts.color && typeof (ts.color as any).toHex === 'function')
                    ? (ts.color as any).toHex()
                    : '#000000',
                text_opacity: (ts.color && typeof (ts.color as any).a === 'number')
                    ? (ts.color as any).a
                    : 1,
                text_size: typeof font.size === 'number' ? font.size : 12,
                text_font: font.family || 'Arial',
                text_weight: font.weight || 'normal',
                text_style: font.style || 'normal',
                text_decoration: font.decoration || 'none',
                text_align: ts.horizontalAlignment || 'center',
                text_baseline: ts.verticalAlignment || 'middle',
                text_rotation: typeof ts.angle === 'number' ? ts.angle : 0
            };

            // Halo (optional)
            if (typeof ts.haloSize === 'number') {
                out.text_halo_size = ts.haloSize;
                if (ts.haloSize > 0 && ts.haloColor) {
                    out.text_halo_color = (typeof (ts.haloColor as any).toHex === 'function')
                        ? (ts.haloColor as any).toHex()
                        : '#FFFFFF';
                    out.text_halo_opacity = typeof (ts.haloColor as any).a === 'number'
                        ? (ts.haloColor as any).a
                        : 1;
                }
            }

            return out;
        };

        // Helper: write one feature to array
        const pushFeature = (geometry: any, properties: any) => {
            geoJSONFeatures.push({
                type: 'Feature',
                geometry,
                properties
            });
        };

        // Helper: add the main drawing as a feature
        const exportDrawing = async (graphic: ExtendedGraphic, index: number) => {
            const geoJSONGeometry = await this.convertToStandardGeoJSON(graphic.geometry);
            //console.log(`Converted geometry for drawing ${index}:`, geoJSONGeometry);
            if (!geoJSONGeometry) {
                console.warn(`Failed to convert geometry for drawing ${index}`);
                return;
            }

            const baseProps: any = {
                id: getId(graphic),
                name: graphic.attributes?.name || `Drawing ${index + 1}`,
                description: `${this.getDrawingTypeLabel(graphic)} drawing`,
                type: this.getDrawingTypeLabel(graphic),
                created: graphic.attributes?.createdDate
                    ? new Date(graphic.attributes.createdDate).toISOString()
                    : null
            };

            // Core symbol props
            const symbolProps = this.convertSymbolToStandardProperties(graphic.symbol) || {};
            Object.assign(baseProps, symbolProps);

            // If it's a text symbol, ensure we fully capture style
            if (graphic.symbol?.type === 'text') {
                Object.assign(baseProps, extractTextSymbolProps(graphic.symbol));
            }

            // Buffer metadata (if present/enabled)
            if (graphic.bufferSettings && graphic.bufferSettings.enabled) {
                baseProps.bufferDistance = graphic.bufferSettings.distance;
                baseProps.bufferUnit = graphic.bufferSettings.unit;
                if (typeof graphic.bufferSettings.opacity === 'number') {
                    baseProps.bufferOpacity = graphic.bufferSettings.opacity; // optional, but useful
                }
            }

            pushFeature(geoJSONGeometry, baseProps);
        };

        // Helper: export one measurement label as its own GeoJSON feature
        const exportMeasurementLabel = async (labelGraphic: any, parentGraphic: any, iLabel: number) => {
            if (!labelGraphic?.geometry) return;
            const geom = await this.convertToStandardGeoJSON(labelGraphic.geometry);
            if (!geom) return;

            const labelId = getId(labelGraphic);
            const parentId = getId(parentGraphic);

            const props: any = {
                id: labelId,
                name: labelGraphic.attributes?.name || 'Measurement Label',
                description: 'Measurement label',
                type: 'Text',
                created: labelGraphic.attributes?.createdDate
                    ? new Date(labelGraphic.attributes.createdDate).toISOString()
                    : null,

                // Critical flags so restored labels behave as measurement labels
                isMeasurementLabel: true,
                hideFromList: true,
                parentGraphicId: parentId
            };

            // Units & measurement meta (if available)
            if (labelGraphic.attributes?.measurementType) {
                props.measurementType = labelGraphic.attributes.measurementType;
            }
            if (labelGraphic.attributes?.lengthUnit) {
                props.lengthUnit = labelGraphic.attributes.lengthUnit;
            }
            if (labelGraphic.attributes?.areaUnit) {
                props.areaUnit = labelGraphic.attributes.areaUnit;
            }

            // Base symbol props + complete text styling
            const symProps = this.convertSymbolToStandardProperties(labelGraphic.symbol) || {};
            Object.assign(props, symProps);
            if (labelGraphic.symbol?.type === 'text') {
                Object.assign(props, extractTextSymbolProps(labelGraphic.symbol));
            }

            pushFeature(geom, props);
        };

        // Walk each drawing and export it + its labels
        for (let index = 0; index < drawingsToExport.length; index++) {
            const graphic = drawingsToExport[index];

            // console.log(`Processing graphic ${index}:`, {
            //   hasGraphic: !!graphic,
            //   hasGeometry: !!graphic?.geometry,
            //   geometryType: graphic?.geometry?.type
            // });


            if (!graphic || !graphic.geometry) {
                console.warn(`Skipping graphic ${index}: missing graphic or geometry`);
                continue;
            }

            // 1) Export the base drawing
            await exportDrawing(graphic, index);

            // 2) Export any related measurement labels (main + per-segment)
            //    Your code elsewhere uses flags/collections like isMeasurementLabel/hideFromList
            //    and relatedSegmentLabels; we inspect those here.
            const labels: any[] = [];

            // Primary label (if managed via parent.measure.graphic)
            if (graphic.measure?.graphic && graphic.measure.graphic.attributes?.isMeasurementLabel) {
                labels.push(graphic.measure.graphic);
            }

            // Any additional/segment labels the parent tracks
            const segs = graphic.attributes?.relatedSegmentLabels;
            if (Array.isArray(segs) && segs.length) {
                for (const s of segs) {
                    if (s?.attributes?.isMeasurementLabel) labels.push(s);
                }
            }

            // Extra safety: scan the layer for labels referencing this parent by id
            const parentId = getId(graphic);
            try {
                const layer = this.props.graphicsLayer;
                const all = layer?.graphics?.toArray?.() ?? [];
                for (const g of all) {
                    if (g?.attributes?.isMeasurementLabel && g?.attributes?.parentGraphicId === parentId) {
                        if (!labels.includes(g)) labels.push(g);
                    }
                }
            } catch {
                // no-op
            }

            // Export deduped labels
            const seen = new Set<string>();
            for (let i = 0; i < labels.length; i++) {
                const lg = labels[i];
                const lid = getId(lg);
                if (seen.has(lid)) continue;
                seen.add(lid);
                try {
                    await exportMeasurementLabel(lg, graphic, i);
                } catch (e) {
                    console.warn('Failed exporting measurement label', e);
                }
            }
        }

        //console.log('Final features array:', geoJSONFeatures);

        return {
            geoJSONFormat: {
                type: 'FeatureCollection',
                features: geoJSONFeatures
            }
        };
    };

    // Convert coordinates to WGS84 (longitude/latitude)
    private getWGS84Coordinates = (x: number, y: number): { lon: number; lat: number } => {
        const mapSR = this.props.jimuMapView?.view?.spatialReference;

        // console.log('🔍 Converting coordinates:', {
        //   originalX: x,
        //   originalY: y,
        //   mapSR: mapSR?.wkid
        // });

        // If already in WGS84 (geographic coordinates)
        if (!mapSR || mapSR.wkid === 4326) {
            const result = {
                lon: Number(x.toFixed(8)),
                lat: Number(y.toFixed(8))
            };
            //console.log('🔍 Already WGS84:', result);
            return result;
        }

        // Convert from Web Mercator (most common)
        if (mapSR.wkid === 3857 || mapSR.wkid === 102100) {
            const lon = (x / 20037508.34) * 180;
            const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
            const result = {
                lon: Number(lon.toFixed(8)),
                lat: Number(lat.toFixed(8))
            };
            //console.log('🔍 Converted from Web Mercator:', result);
            return result;
        }

        // For other coordinate systems, assume they need no conversion
        const result = {
            lon: Number(x.toFixed(8)),
            lat: Number(y.toFixed(8))
        };
        //console.log('🔍 Using original coordinates (unknown SR):', result);
        return result;
    };


    // Validate that coordinates are within valid WGS84 bounds
    private isValidCoordinate = (lon: number, lat: number): boolean => {
        return !isNaN(lon) && !isNaN(lat) &&
            lon >= -180 && lon <= 180 &&
            lat >= -90 && lat <= 90;
    };

    // Convert symbol properties to standard GeoJSON-friendly properties

    private determineEsriGeometryType = (graphics: ExtendedGraphic[]): string => {
        // Determine the predominant geometry type for Esri format
        const typeCounts = graphics.reduce((acc, graphic) => {
            const type = graphic.geometry?.type;
            if (type) {
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const dominantType = Object.keys(typeCounts).reduce((a, b) =>
            typeCounts[a] > typeCounts[b] ? a : b
        );

        switch (dominantType) {
            case 'point': return 'esriGeometryPoint';
            case 'polyline': return 'esriGeometryPolyline';
            case 'polygon':
            case 'extent': return 'esriGeometryPolygon';
            default: return 'esriGeometryPoint';
        }
    };

    private getGraphicId = (graphic: __esri.Graphic): string => {
        // Try to use existing unique identifiers first
        if (graphic.attributes?.uniqueId) {
            return graphic.attributes.uniqueId;
        }

        if (graphic.attributes?.objectId) {
            return `obj_${graphic.attributes.objectId}`;
        }

        // Fall back to generating an ID based on graphic properties
        const geometryType = graphic.geometry?.type || 'unknown';
        const symbolType = graphic.symbol?.type || 'unknown';
        const text = (graphic.symbol as any)?.text || '';
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);

        return `${geometryType}_${symbolType}_${text.substring(0, 10)}_${timestamp}_${random}`;
    };
    private performFinalMeasurementCleanup = (deletedGraphic: ExtendedGraphic) => {
        if (!this.props.graphicsLayer) return;

        try {
            const allGraphics = this.props.graphicsLayer.graphics.toArray();
            const measurementLabels = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return extG.attributes?.isMeasurementLabel;
            });

            //console.log(`Final cleanup check: Found ${measurementLabels.length} measurement labels`);

            // ONLY remove measurement labels that are specifically orphaned by this deletion
            const orphanedLabels = measurementLabels.filter(label => {
                const extLabel = label as ExtendedGraphic;
                const parent = extLabel.measureParent;
                const parentId = extLabel.attributes?.parentId;
                const deletedGraphicId = deletedGraphic.attributes?.uniqueId;

                // Only consider it orphaned if it was specifically linked to the deleted graphic
                if (parent === deletedGraphic) {
                    return true; // Direct parent reference to deleted graphic
                }

                if (parentId && deletedGraphicId && parentId === deletedGraphicId) {
                    return true; // Parent ID matches deleted graphic's ID
                }

                // DO NOT remove labels that don't have a clear connection to the deleted graphic
                return false;
            });

            if (orphanedLabels.length > 0) {
                //console.log(`Removing ${orphanedLabels.length} labels that were specifically orphaned by this deletion`);
                orphanedLabels.forEach(label => {
                    //console.log(`  - Removing orphaned label: "${label.attributes?.name || 'unnamed'}"`);
                    this.props.graphicsLayer.remove(label);
                });
            } else {
                //console.log('No specifically orphaned labels found');
            }

        } catch (error) {
            console.error('Error in final measurement cleanup:', error);
        }
    };
    private createBufferSymbolFromParent = (parentGraphic: ExtendedGraphic): SimpleFillSymbol => {
        const geomType = parentGraphic.geometry?.type;
        const parentSymbol = parentGraphic.symbol;

        // 🔧 CRITICAL: Use saved opacity from buffer settings, fallback to 50%
        const savedOpacity = parentGraphic.bufferSettings?.opacity;
        const opacityToUse = savedOpacity !== undefined ? savedOpacity : 50;
        const opacityMultiplier = opacityToUse / 100;

        let fillColor = new Color([0, 0, 0, 0.15 * opacityMultiplier]);
        let outlineColor = new Color([0, 0, 0, 0.6 * opacityMultiplier]);

        try {
            if (geomType === 'polygon' && parentSymbol) {
                const fillSym = parentSymbol as __esri.SimpleFillSymbol;
                if (fillSym?.color) {
                    const rgba = fillSym.color.toRgba ? fillSym.color.toRgba() : [0, 0, 0, 1];
                    fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
                    outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
                }
                if (fillSym?.outline?.color) {
                    const rgba = fillSym.outline.color.toRgba ? fillSym.outline.color.toRgba() : [0, 0, 0, 1];
                    outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
                }
            } else if (geomType === 'polyline' && parentSymbol) {
                const lineSym = parentSymbol as __esri.SimpleLineSymbol;
                if (lineSym?.color) {
                    const rgba = lineSym.color.toRgba ? lineSym.color.toRgba() : [0, 0, 0, 1];
                    fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * 0.6 * opacityMultiplier, 1.0)]);
                    outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
                }
            } else if (geomType === 'point' && parentSymbol) {
                const markerSym = parentSymbol as __esri.SimpleMarkerSymbol;
                if (markerSym?.color) {
                    const rgba = markerSym.color.toRgba ? markerSym.color.toRgba() : [0, 0, 0, 1];
                    fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * 0.6 * opacityMultiplier, 1.0)]);
                    outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
                }
            }
        } catch (error) {
            console.warn('Error processing parent colors:', error);
        }

        //console.log(`🎨 MyDrawingsPanel: Creating buffer symbol with ${opacityToUse}% opacity`);

        return new SimpleFillSymbol({
            color: fillColor,
            outline: new SimpleLineSymbol({
                color: outlineColor,
                width: 1.5,
                style: 'dash'
            })
        });
    };

    private completeDeletion = () => {
        try {
            // ... deletion completed ...
            // **MODIFIED:** Re-enable measurement system if it was enabled before
            if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                this.props.onMeasurementSystemControl(true);
            }
            this._isDeletingGraphic = false;
            this.forceMapRefresh();
            // ... logging ...
        } catch (error) {
            console.error('❌ Error completing deletion:', error);
            this._isDeletingGraphic = false;
            // **MODIFIED:** Only re-enable measurements on error if originally on
            if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                this.props.onMeasurementSystemControl(true);
            }
        }
    }
    private finishDeletion = (graphicToDelete: ExtendedGraphic, index: number) => {
        try {
            //console.log(`Finishing deletion of: ${graphicToDelete.attributes?.name || 'unnamed'}`);

            // Mark that we're about to update the graphics layer
            this.ignoreNextGraphicsUpdate = true;

            // Remove the main graphic from the layer
            this.props.graphicsLayer.remove(graphicToDelete);

            // AGGRESSIVE: Remove any measurement labels created during the deletion process
            setTimeout(() => {
                this.performFinalMeasurementCleanup(graphicToDelete);
            }, 50);

            // Update state
            const updatedDrawings = [...this.state.drawings];
            updatedDrawings.splice(index, 1);

            const newSelected = new Set<number>();
            this.state.selectedGraphics.forEach(selectedIndex => {
                if (selectedIndex < index) {
                    newSelected.add(selectedIndex);
                } else if (selectedIndex > index) {
                    newSelected.add(selectedIndex - 1);
                }
            });

            this.setState({
                drawings: updatedDrawings,
                selectedGraphicIndex: null,
                selectedGraphics: newSelected,
                symbolEditingIndex: null
            }, () => {
                // Save to localStorage
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // Notify parent
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(updatedDrawings);
                }

                // Final cleanup and re-enable measurements
                setTimeout(() => {
                    this.completeDeletion();
                }, 300);
            });

            //console.log('Deletion process completed');
        } catch (error) {
            console.error('Error finishing deletion:', error);
            this.isDeletingGraphics = false; // Reset flag on error
            this.showLocalAlert('Error completing deletion', 'error');
            this.refreshDrawingsFromLayer();
        }
    };
    private performAggressiveCleanup = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.props.graphicsLayer) return;

        try {
            //console.log(`🗑️ PRIORITY: Removing attached buffer FIRST for: ${graphic.attributes?.name || 'unnamed'}`);

            // 🔧 CRITICAL: Remove attached buffer FIRST, before anything else
            if (graphic.bufferGraphic) {
                //console.log(`🗑️ Removing attached buffer for graphic ${graphic.attributes?.uniqueId}`);
                this.props.graphicsLayer.remove(graphic.bufferGraphic);
                graphic.bufferGraphic = null;
            }

            // Clear buffer settings immediately
            if (graphic.bufferSettings) {
                graphic.bufferSettings = null;
            }

            // Remove geometry watchers for this graphic to prevent further buffer updates
            const parentId = graphic.attributes?.uniqueId;
            if (parentId && this._positionWatchers) {
                Object.keys(this._positionWatchers).forEach(key => {
                    if (key.includes(parentId)) {
                        try {
                            this._positionWatchers[key].remove();
                            delete this._positionWatchers[key];
                            //console.log(`✅ Removed geometry watcher: ${key}`);
                        } catch (error) {
                            console.warn('Error removing geometry watcher:', error);
                        }
                    }
                });
            }

            const graphicUniqueId = graphic.attributes?.uniqueId;
            const allGraphics = this.props.graphicsLayer.graphics.toArray();

            // Remove by direct reference (measurement labels)
            if (graphic.measure?.graphic) {
                //console.log('🗑️ Removing main measurement graphic by direct reference');
                this.props.graphicsLayer.remove(graphic.measure.graphic);
                graphic.measure = null;
            }

            // Remove segment labels by direct reference
            if (graphic.attributes?.relatedSegmentLabels && Array.isArray(graphic.attributes.relatedSegmentLabels)) {
                //console.log(`🗑️ Removing ${graphic.attributes.relatedSegmentLabels.length} segment labels by direct reference`);
                graphic.attributes.relatedSegmentLabels.forEach(segmentLabel => {
                    if (segmentLabel) {
                        this.props.graphicsLayer.remove(segmentLabel);
                    }
                });
                graphic.attributes.relatedSegmentLabels = [];
            }

            // Find and remove measurement labels related to this graphic
            const measurementLabelsToRemove = [];
            allGraphics.forEach(g => {
                const extendedG = g as ExtendedGraphic;
                if (extendedG.attributes?.isMeasurementLabel) {
                    if (extendedG.measureParent === graphic ||
                        (graphicUniqueId && extendedG.attributes?.parentId === graphicUniqueId) ||
                        graphic.measure?.graphic === extendedG ||
                        graphic.attributes?.relatedSegmentLabels?.includes(extendedG) ||
                        (graphicUniqueId && extendedG.measureParent?.attributes?.uniqueId === graphicUniqueId)) {
                        measurementLabelsToRemove.push(extendedG);
                    }
                }
            });

            if (measurementLabelsToRemove.length > 0) {
                //console.log(`🗑️ Removing ${measurementLabelsToRemove.length} measurement labels SPECIFICALLY related to this graphic`);
                measurementLabelsToRemove.forEach(label => {
                    this.props.graphicsLayer.remove(label);
                });
            }

            // 🔧 NEW: Also clean up any orphaned buffers that might reference this graphic
            const orphanedBuffers = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return (extG.attributes?.isBuffer || extG.attributes?.isPreviewBuffer) &&
                    (extG.attributes?.parentId === graphicUniqueId ||
                        extG.attributes?.sourceGraphicId === graphicUniqueId);
            });

            if (orphanedBuffers.length > 0) {
                //console.log(`🗑️ Removing ${orphanedBuffers.length} orphaned buffers that reference this graphic`);
                orphanedBuffers.forEach(buffer => {
                    this.props.graphicsLayer.remove(buffer);
                });
            }

            this.forceMapRefresh();
            //console.log('✅ Selective cleanup completed with comprehensive buffer removal');

        } catch (error) {
            console.error('❌ Error in selective cleanup:', error);
        }
    };
    private isSuspiciousMeasurementLabel = (label: ExtendedGraphic, targetGraphic: ExtendedGraphic): boolean => {
        if (!label.symbol || label.symbol.type !== 'text') return false;

        try {
            const labelText = (label.symbol as any).text || '';
            const labelGeometry = label.geometry;
            const targetGeometry = targetGraphic.geometry;

            // Check if text looks like a measurement
            const measurementKeywords = ['area:', 'length:', 'perimeter:', 'radius:', 'total:', 'm²', 'ft²', 'km²', 'mi²', 'km', 'mi', 'ft', 'm'];
            const hasMetricContent = measurementKeywords.some(keyword =>
                labelText.toLowerCase().includes(keyword.toLowerCase())
            );

            if (!hasMetricContent) return false;

            // Check proximity - if label is very close to the graphic, it's probably related
            if (labelGeometry && targetGeometry && labelGeometry.extent && targetGeometry.extent) {
                const labelCenter = labelGeometry.extent.center;
                const targetCenter = targetGeometry.extent.center;

                if (labelCenter && targetCenter) {
                    const distance = Math.sqrt(
                        Math.pow(labelCenter.x - targetCenter.x, 2) +
                        Math.pow(labelCenter.y - targetCenter.y, 2)
                    );

                    // If within reasonable distance and has measurement content, consider it suspicious
                    const maxDistance = Math.max(targetGeometry.extent.width, targetGeometry.extent.height) * 2;
                    if (distance < maxDistance) {
                        //console.log(`Suspicious label found within ${distance} units of target (max: ${maxDistance})`);
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking suspicious label:', error);
            return false;
        }
    };
    private _isDeletingGraphic = false;

    // Ensure a halo exists for a point/text graphic
    private ensurePointTextOverlay = (g: ExtendedGraphic) => {
        if (!g || !this.props.graphicsLayer) {
            //console.log('ensurePointTextOverlay: missing graphic or layer');
            return;
        }
        if (!g.geometry || g.geometry.type !== "point") {
            //console.log('ensurePointTextOverlay: not a point geometry');
            return;
        }

        const layer = this.props.graphicsLayer;

        // If halo exists: sync geometry & bring to front
        if (g._selectionOverlay) {
            //console.log('ensurePointTextOverlay: updating existing overlay');
            try {
                g._selectionOverlay.geometry = g.geometry;
            } catch (e) {
                console.warn('Error updating overlay geometry:', e);
            }
            this.bringOverlayToFront(g._selectionOverlay);
            return;
        }

        //console.log('ensurePointTextOverlay: creating new overlay for', g.attributes?.name);

        // Build halo symbol (square for text, circle for markers)
        const isText = (g.symbol as any)?.type === "text";
        const overlaySymbol = new SimpleMarkerSymbol({
            style: isText ? "square" : "circle",
            size: isText ? 26 : 22,
            color: [0, 0, 0, 0], // transparent fill
            outline: { color: [255, 128, 0, 1], width: 2 } // orange outline
        });

        const overlay = new Graphic({
            geometry: g.geometry,
            symbol: overlaySymbol,
            attributes: {
                hideFromList: true,
                isMeasurementLabel: false,
                isSelectionOverlay: true
            }
        });

        try {
            layer.add(overlay);
            g._selectionOverlay = overlay;
            //console.log('ensurePointTextOverlay: successfully created and added overlay');
        } catch (error) {
            console.error('ensurePointTextOverlay: error creating overlay:', error);
        }
    };

    private continueDeleteGraphic = (index: number, graphicToDelete: ExtendedGraphic) => {
        try {
            //console.log(`➡️ Continuing deletion after SketchViewModel cancel`);

            // 🔧 STEP 1: Remove attached buffer IMMEDIATELY (before anything else)
            if (graphicToDelete.bufferGraphic) {
                //console.log(`🗑️ PRIORITY: Removing attached buffer first`);
                this.props.graphicsLayer.remove(graphicToDelete.bufferGraphic);
                graphicToDelete.bufferGraphic = null;
            }

            // Clear buffer settings
            if (graphicToDelete.bufferSettings) {
                graphicToDelete.bufferSettings = null;
            }

            // 🔧 STEP 2: Remove geometry watchers to prevent buffer recreation
            const parentId = graphicToDelete.attributes?.uniqueId;
            if (parentId && this._positionWatchers) {
                Object.keys(this._positionWatchers).forEach(key => {
                    if (key.includes(parentId)) {
                        try {
                            this._positionWatchers[key].remove();
                            delete this._positionWatchers[key];
                            //console.log(`✅ Removed geometry watcher: ${key}`);
                        } catch (error) {
                            console.warn('Error removing geometry watcher:', error);
                        }
                    }
                });
            }

            // STEP 3: Clean up measurement labels
            //console.log(`🧹 Cleaning up measurement labels for graphic`);
            this.removeMeasurementLabels(graphicToDelete);

            // STEP 4: Find and remove ONLY the specific graphic from the layer
            const uniqueId = graphicToDelete.attributes?.uniqueId;

            if (uniqueId) {
                //console.log(`🔍 Looking for graphic with uniqueId: ${uniqueId}`);

                // Find the exact graphic in the layer by uniqueId
                const layerGraphics = this.props.graphicsLayer.graphics.toArray();
                const targetGraphic = layerGraphics.find(g =>
                    g.attributes?.uniqueId === uniqueId &&
                    !g.attributes?.isMeasurementLabel &&
                    !g.attributes?.hideFromList &&
                    !g.attributes?.isBuffer && // Make sure we don't accidentally target a buffer
                    !g.attributes?.isPreviewBuffer
                );

                if (targetGraphic) {
                    //console.log(`✅ Found target graphic in layer, removing it`);

                    // Mark that we're about to update the graphics layer
                    this.ignoreNextGraphicsUpdate = true;

                    // Remove ONLY the target graphic
                    this.props.graphicsLayer.remove(targetGraphic);

                    //console.log(`🗑️ Removed graphic from layer`);
                } else {
                    console.warn(`⚠️ Could not find graphic with uniqueId ${uniqueId} in layer`);
                }
            } else {
                console.warn(`⚠️ Graphic has no uniqueId, using fallback removal`);

                // Fallback: remove by reference (less reliable)
                this.ignoreNextGraphicsUpdate = true;
                this.props.graphicsLayer.remove(graphicToDelete);
            }

            // STEP 5: Perform aggressive cleanup for any remaining related graphics
            if (uniqueId) {
                setTimeout(() => {
                    this.performAggressiveMeasurementCleanup(uniqueId);
                }, 200);
            }

            // STEP 6: Update state manually for immediate feedback
            const updatedDrawings = [...this.state.drawings];
            updatedDrawings.splice(index, 1);

            // STEP 7: Update selected graphics
            const newSelected = new Set<number>();
            this.state.selectedGraphics.forEach(selectedIndex => {
                if (selectedIndex < index) {
                    newSelected.add(selectedIndex);
                } else if (selectedIndex > index) {
                    newSelected.add(selectedIndex - 1);
                }
            });

            // STEP 8: Update state and clear selections
            this.setState({
                drawings: updatedDrawings,
                selectedGraphicIndex: null,
                selectedGraphics: newSelected,
                symbolEditingIndex: null // Also clear any symbol editing
            }, () => {
                //console.log(`📊 Updated state - ${updatedDrawings.length} drawings remaining`);

                // Save to localStorage if consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // Notify parent if needed
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(updatedDrawings);
                }

                // Clear deletion flag
                this._isDeletingGraphic = false;

                // Verify the layer state after a longer delay to allow cleanup to complete
                setTimeout(() => {
                    this.verifyLayerState();
                }, 500);
            });

            //console.log(`✅ Deletion completed successfully with buffer-first approach`);

        } catch (error) {
            console.error('❌ Error during deletion continuation:', error);
            this._isDeletingGraphic = false;
            this.showLocalAlert('Error deleting drawing', 'error');
            this.refreshDrawingsFromLayer();
        }
    }
    private restoreSketchViewModelSelection = (graphic: ExtendedGraphic) => {
        if (!this.sketchViewModel || !graphic) return;

        try {
            // Small delay to ensure layer operations complete
            setTimeout(() => {
                if (this.sketchViewModel && !this._isDeletingGraphic) {
                    this.sketchViewModel.update([graphic]);
                }
            }, 100);
        } catch (error) {
            console.warn('Could not restore SketchViewModel selection:', error);
        }
    };

    // Remove halo for a single graphic by index
    private removePointTextOverlayByIndex = (index?: number | null) => {
        if (index == null) return;
        const g = this.state.drawings?.[index] as ExtendedGraphic | undefined;
        this.removePointTextOverlay(g);
    };


    // Remove halos for all currently selected items (multi + single)
    private removeAllSelectionOverlays = () => {
        const set = this.state.selectedGraphics as Set<number> | undefined;
        if (set?.size) set.forEach(idx => this.removePointTextOverlayByIndex(idx));
        this.removePointTextOverlayByIndex(this.state.selectedGraphicIndex);
    };


    private bringOverlayToFront = (overlay?: __esri.Graphic | null) => {
        if (!overlay || !this.props.graphicsLayer) return;
        try {
            this.props.graphicsLayer.remove(overlay);
            this.props.graphicsLayer.add(overlay); // last-in draws on top
        } catch { }
    };


    // Helper: remove halo overlay if present
    private removePointTextOverlay = (g?: ExtendedGraphic | null) => {
        if (!g || !this.props.graphicsLayer) return;
        if (g._selectionOverlay) {
            try { this.props.graphicsLayer.remove(g._selectionOverlay); } catch { }
            g._selectionOverlay = null;
        }
    };


    private performAggressiveMeasurementCleanup = (deletedGraphicId: string) => {
        if (!this.props.graphicsLayer) return;

        try {
            //console.log(`🧹 Performing aggressive measurement cleanup for graphic: ${deletedGraphicId}`);

            const allGraphics = this.props.graphicsLayer.graphics.toArray();
            let removedCount = 0;

            // Find all measurement labels that might be orphaned
            const potentialOrphans = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return extG.attributes?.isMeasurementLabel;
            });

            //console.log(`🔍 Found ${potentialOrphans.length} total measurement labels in layer`);

            // For each measurement label, check if its parent still exists
            potentialOrphans.forEach(label => {
                const extLabel = label as ExtendedGraphic;
                const parentId = extLabel.attributes?.parentId;
                let shouldRemove = false;

                // Check if this label belongs to the deleted graphic
                if (parentId === deletedGraphicId) {
                    //console.log(`🎯 Found orphaned label with parentId: ${parentId}`);
                    shouldRemove = true;
                } else if (parentId) {
                    // Check if the parent still exists in the layer
                    const parentExists = allGraphics.some(g =>
                        g.attributes?.uniqueId === parentId &&
                        !g.attributes?.isMeasurementLabel
                    );

                    if (!parentExists) {
                        //console.log(`🎯 Found orphaned label - parent ${parentId} no longer exists`);
                        shouldRemove = true;
                    }
                } else {
                    // Label has no parentId - check if it has a measureParent reference
                    if (extLabel.measureParent) {
                        const parentUniqueId = extLabel.measureParent.attributes?.uniqueId;
                        if (parentUniqueId === deletedGraphicId) {
                            //console.log(`🎯 Found orphaned label via measureParent reference`);
                            shouldRemove = true;
                        } else {
                            // Check if measureParent still exists in layer
                            const parentExists = allGraphics.some(g =>
                                g.attributes?.uniqueId === parentUniqueId &&
                                !g.attributes?.isMeasurementLabel
                            );

                            if (!parentExists) {
                                //console.log(`🎯 Found orphaned label - measureParent no longer exists`);
                                shouldRemove = true;
                            }
                        }
                    } else {
                        // Label has no parent reference at all - it's likely orphaned
                        //console.log(`🎯 Found label with no parent reference - likely orphaned`);
                        shouldRemove = true;
                    }
                }

                if (shouldRemove) {
                    try {
                        this.props.graphicsLayer.remove(label);
                        removedCount++;
                        //console.log(`🗑️ Removed orphaned measurement label`);
                    } catch (err) {
                        console.warn('❌ Failed to remove orphaned label:', err);
                    }
                }
            });

            if (removedCount > 0) {
                //console.log(`✅ Aggressive cleanup completed - removed ${removedCount} orphaned measurement labels`);
            } else {
                //console.log(`✅ Aggressive cleanup completed - no orphaned labels found`);
            }

            // Force a final map refresh to ensure everything is clean
            setTimeout(() => {
                this.forceMapRefresh();
            }, 100);

        } catch (error) {
            console.error('❌ Error in aggressive measurement cleanup:', error);
        }
    };
    private measureRef: React.RefObject<any> | null = null; // Reference to measurement component
    private _measurementUpdateTimeout: any = null; // Timeout for debouncing measurement updates
    private _saveToStorageTimeout: any = null; // Debounce storage saves
    private _isUpdatingMeasurements: boolean = false; // Prevent concurrent updates
    private _measurementUpdateQueue: Set<string> = new Set(); // Queue graphics for updates
    private _processingMeasurements: boolean = false; // Prevent recursive processing
    private updateAttachedBuffer = async (parentGraphic: ExtendedGraphic) => {
        if (!parentGraphic.bufferGraphic || !parentGraphic.bufferSettings || !this.props.graphicsLayer) {
            return;
        }

        try {
            const { distance, unit } = parentGraphic.bufferSettings;

            //console.log(`🔄 Creating new buffer geometry for ${parentGraphic.attributes?.uniqueId}`);

            // Create new buffer geometry
            const newBufferGeometry = await this.createBufferGeometry(
                parentGraphic.geometry,
                distance,
                unit
            );

            if (newBufferGeometry) {
                // Update the buffer graphic's geometry immediately
                parentGraphic.bufferGraphic.geometry = newBufferGeometry;

                // Force layer refresh to ensure visual update
                this.props.graphicsLayer.remove(parentGraphic.bufferGraphic);
                this.props.graphicsLayer.add(parentGraphic.bufferGraphic);

                //console.log(`✅ Buffer geometry updated and refreshed for graphic ${parentGraphic.attributes?.uniqueId}`);
            }
        } catch (error) {
            console.error('❌ Error updating attached buffer:', error);
        }
    };
    private ensureBufferWatchersForSelectedGraphic = (graphic: ExtendedGraphic) => {
        // If the graphic has buffer settings, ensure geometry watcher is active
        if (graphic.bufferSettings && graphic.bufferSettings.enabled && graphic.bufferGraphic) {
            const parentId = graphic.attributes?.uniqueId;

            if (parentId) {
                //console.log(`🔧 MyDrawingsPanel: Ensuring buffer watcher for selected graphic: ${parentId}`);

                // Set up geometry watcher for real-time buffer updates
                const existingWatcher = this._positionWatchers[parentId + '_buffer'];
                if (existingWatcher) {
                    existingWatcher.remove();
                }

                // Create a geometry watcher specifically for buffer updates
                this._positionWatchers[parentId + '_buffer'] = graphic.watch('geometry', async (newGeometry) => {
                    //console.log(`🔄 MyDrawingsPanel: Geometry changed, updating buffer for ${parentId}`);

                    if (graphic.bufferGraphic && graphic.bufferSettings) {
                        try {
                            // Update buffer immediately
                            await this.updateAttachedBuffer(graphic);
                        } catch (error) {
                            console.error('❌ Error updating buffer from MyDrawingsPanel:', error);
                        }
                    }
                });
            }
        }
    };
    private createBufferGeometry = async (geometry: __esri.Geometry, distance: number, unit: string): Promise<__esri.Geometry | null> => {
        try {
            const view = this.props.jimuMapView?.view;
            if (!view) return null;
            const linearUnit = unit as __esri.LinearUnits;
            let bufferResult: __esri.Geometry | __esri.Geometry[] | null = null;
            if (view.spatialReference?.isGeographic || view.spatialReference?.isWebMercator) {
                bufferResult = await geometryEngineAsync.geodesicBuffer(geometry as any, distance, linearUnit);
            } else {
                bufferResult = await geometryEngineAsync.buffer(geometry as any, distance, linearUnit, true);
            }
            if (!bufferResult) {
                console.warn('Buffer operation returned null');
                return null;
            }
            if (Array.isArray(bufferResult)) {
                if (bufferResult.length === 0) {
                    console.warn('Buffer operation returned empty array');
                    return null;
                }
                return bufferResult[0];
            }
            return bufferResult;
        } catch (error) {
            console.error('Error creating buffer geometry:', error);
            return null;
        }
    };

    private _geometryWatchTimeouts: { [key: string]: any } = {}; // Debounce geometry changes
    private performActualSave = () => {
        if (this.props.allowLocalStorage === false || this.state.consentGranted !== true) return;

        try {
            // Get ALL graphics from the layer (including measurement labels and buffers)
            const currentGraphics = this.props.graphicsLayer.graphics.toArray();

            // Separate main drawings from buffers and measurement labels
            const mainDrawings = currentGraphics.filter(g =>
                !g.attributes?.isMeasurementLabel &&
                !g.attributes?.hideFromList &&
                !g.attributes?.isPreviewBuffer &&
                !g.attributes?.isBuffer && // Exclude buffer graphics from main drawings
                !g.attributes?.isBufferDrawing
            );

            const measurementLabels = currentGraphics.filter(g =>
                g.attributes?.isMeasurementLabel &&
                !g.attributes?.isPreviewBuffer
            );

            // Don't save standalone buffer graphics since they'll be recreated from parent settings
            // Instead, save buffer settings with parent graphics

            // Prepare main drawings for storage with buffer settings
            const drawingsToSave = mainDrawings.map((graphic) => {
                const extendedGraphic = asExtendedGraphic(graphic);
                const json = graphic.toJSON();

                // Ensure each graphic has a uniqueId
                if (!json.attributes) {
                    json.attributes = {};
                }
                if (!json.attributes.uniqueId) {
                    const uniqueId = `restored_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    json.attributes.uniqueId = uniqueId;
                }
                if (!json.attributes.createdDate) {
                    json.attributes.createdDate = Date.now();
                }

                // 🔧 CRITICAL: Save buffer settings INCLUDING OPACITY if this graphic has an attached buffer
                if (extendedGraphic.bufferSettings) {
                    json.attributes.bufferSettings = {
                        distance: extendedGraphic.bufferSettings.distance,
                        unit: extendedGraphic.bufferSettings.unit,
                        enabled: extendedGraphic.bufferSettings.enabled,
                        opacity: extendedGraphic.bufferSettings.opacity  // 🚨 CRITICAL: Include opacity in save
                    };
                    //console.log(`💾 MyDrawingsPanel: Saving buffer settings for graphic ${json.attributes.uniqueId}:`, json.attributes.bufferSettings);
                }

                return json;
            });

            // Prepare measurement labels for storage
            // In performActualSave() method, update the measurement labels section:
            // Prepare measurement labels for storage WITH customization data
            const measurementLabelsToSave = measurementLabels.map((label) => {
                const extendedLabel = asExtendedGraphic(label);
                const json = label.toJSON();

                if (!json.attributes) {
                    json.attributes = {};
                }

                // Store the parent graphic's uniqueId for restoration
                if (extendedLabel.measureParent?.attributes?.uniqueId) {
                    json.attributes.parentGraphicId = extendedLabel.measureParent.attributes.uniqueId;
                }

                // Ensure measurement label flags are preserved
                json.attributes.isMeasurementLabel = true;
                json.attributes.hideFromList = true;

                // CRITICAL: Save customization flags and custom position data
                if (extendedLabel.attributes?.customized) {
                    json.attributes.customized = true;
                    json.attributes.lastModified = extendedLabel.attributes.lastModified;
                }

                if (extendedLabel.attributes?.hasCustomPosition && extendedLabel.attributes?.customPosition) {
                    json.attributes.hasCustomPosition = true;
                    json.attributes.customPosition = extendedLabel.attributes.customPosition;
                }

                // Save measurement type
                if (extendedLabel.attributes?.measurementType) {
                    json.attributes.measurementType = extendedLabel.attributes.measurementType;
                }

                // Save measurement units
                if (extendedLabel.attributes?.lengthUnit) {
                    json.attributes.lengthUnit = extendedLabel.attributes.lengthUnit;
                }
                if (extendedLabel.attributes?.areaUnit) {
                    json.attributes.areaUnit = extendedLabel.attributes.areaUnit;
                }

                return json;
            });

            // Update version to 1.4
            const allGraphicsToSave = {
                drawings: drawingsToSave,
                measurementLabels: measurementLabelsToSave,
                version: "1.4" // Updated version to support measurement customization
            };

            const storageKey = this.localStorageKey;

            // Save asynchronously when the browser is idle
            const saveFn = () => {
                try {
                    const stringified = JSON.stringify(allGraphicsToSave);
                    localStorage.setItem(storageKey, stringified);
                    //console.log(`✅ Successfully saved ${drawingsToSave.length} drawing(s) with buffer settings and ${measurementLabelsToSave.length} measurement label(s) to localStorage`);
                } catch (stringifyError) {
                    console.error(`❌ Failed to stringify graphics for localStorage`, stringifyError);
                    this.showLocalAlert('Error saving drawings (stringify failed)', 'error');
                }
            };

            // Use requestIdleCallback for better performance, fallback to setTimeout
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(saveFn, { timeout: 5000 });
            } else {
                setTimeout(saveFn, 0);
            }

        } catch (err) {
            console.error(`❌ Error preparing drawings for localStorage`, err);
            this.showLocalAlert('Error saving drawings', 'error');
        }
    };
    private debouncedMeasurementUpdate = (graphic: ExtendedGraphic, delay: number = 500) => {
        if (!graphic || !graphic.attributes?.uniqueId) return;

        // CRITICAL: Prevent loops by checking if we're already updating measurements
        if (this._isUpdatingMeasurements) {
            //console.log(`⏭️ Skipping measurement update - already in progress`);
            return;
        }

        const graphicId = graphic.attributes.uniqueId;

        // Clear any existing timeout for this graphic
        if (this._geometryWatchTimeouts[graphicId]) {
            clearTimeout(this._geometryWatchTimeouts[graphicId]);
        }

        // Set a new timeout
        this._geometryWatchTimeouts[graphicId] = setTimeout(() => {
            this.performSingleMeasurementUpdate(graphic);
            delete this._geometryWatchTimeouts[graphicId];
        }, delay);
    };
    private performSingleMeasurementUpdate = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.measureRef?.current || this._isUpdatingMeasurements) {
            return;
        }

        // CRITICAL: Set flag to prevent re-entry
        this._isUpdatingMeasurements = true;

        const graphicId = graphic.attributes?.uniqueId || 'unknown';

        try {
            //console.log(`📐 Updating measurements for: ${graphic.attributes?.name || graphicId}`);

            // Call the measurement update but wrap it to handle any errors
            this.measureRef.current.updateMeasurementsForGraphic(graphic);

        } catch (error) {
            console.warn(`❌ Could not update measurements for ${graphicId}:`, error);
        } finally {
            // CRITICAL: Always clear the flag, even on error
            setTimeout(() => {
                this._isUpdatingMeasurements = false;
            }, 100); // Small delay to ensure measurement system has time to complete
        }
    };

    private cleanupOrphanedMeasurementLabels = () => {
        if (!this.props.graphicsLayer) return;

        //console.log('🧹 Starting automatic cleanup of orphaned measurement labels and buffers');

        try {
            const allGraphics = this.props.graphicsLayer.graphics.toArray();

            // Separate different types of graphics
            const actualDrawings = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return !extG.attributes?.isMeasurementLabel &&
                    !extG.attributes?.hideFromList &&
                    !extG.attributes?.isBuffer &&
                    !extG.attributes?.isPreviewBuffer; // Also exclude preview buffers
            }) as ExtendedGraphic[];

            const measurementLabels = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return extG.attributes?.isMeasurementLabel && !extG.attributes?.isBuffer;
            }) as ExtendedGraphic[];

            // 🔧 ENHANCED: Include ALL buffer types in cleanup
            const bufferGraphics = allGraphics.filter(g => {
                const extG = g as ExtendedGraphic;
                return extG.attributes?.isBuffer ||
                    extG.attributes?.isPreviewBuffer ||
                    extG.isBufferDrawing; // Legacy buffer drawings
            }) as ExtendedGraphic[];

            //console.log(`Found ${actualDrawings.length} drawings, ${measurementLabels.length} measurement labels, ${bufferGraphics.length} buffers`);

            // Create a set of valid parent IDs from actual drawings
            const validParentIds = new Set(
                actualDrawings
                    .map(drawing => drawing.attributes?.uniqueId)
                    .filter(id => id)
            );

            // Find orphaned measurement labels
            const orphanedLabels = measurementLabels.filter(label => {
                const parentId = label.attributes?.parentGraphicId ||
                    (label as any).measureParent?.attributes?.uniqueId;
                return !parentId || !validParentIds.has(parentId);
            });

            // 🔧 ENHANCED: Find orphaned buffers using multiple checks
            const orphanedBuffers = bufferGraphics.filter(buffer => {
                // Check parentId (for attached buffers)
                const parentId = buffer.attributes?.parentId;
                if (parentId && !validParentIds.has(parentId)) {
                    return true;
                }

                // Check sourceGraphicId (for legacy buffer drawings)
                const sourceId = (buffer as any).sourceGraphicId || buffer.attributes?.sourceGraphicId;
                if (sourceId && !validParentIds.has(sourceId)) {
                    return true;
                }

                // If no parent reference at all, it's likely orphaned
                if (!parentId && !sourceId) {
                    return true;
                }

                return false;
            });

            // Clean up orphaned items
            if (orphanedLabels.length > 0) {
                //console.log(`🗑️ Auto-removing ${orphanedLabels.length} orphaned measurement labels`);
                orphanedLabels.forEach(label => {
                    this.props.graphicsLayer.remove(label);
                });
            }

            if (orphanedBuffers.length > 0) {
                //console.log(`🗑️ Auto-removing ${orphanedBuffers.length} orphaned buffer graphics`);
                orphanedBuffers.forEach(buffer => {
                    this.props.graphicsLayer.remove(buffer);
                });
            }

            if (orphanedLabels.length === 0 && orphanedBuffers.length === 0) {
                //console.log('✅ No orphaned graphics found');
            } else {
                // Force a map refresh after cleanup
                this.forceMapRefresh();
                //console.log(`✅ Auto-cleanup completed - removed ${orphanedLabels.length} labels and ${orphanedBuffers.length} buffers`);
            }

        } catch (error) {
            console.error('❌ Error during automatic orphaned graphics cleanup:', error);
        }
    };
    private sessionPromptKey: string;
    private cleanupLocalStorageMeasurements = () => {
        if (this.props.allowLocalStorage === false || this.state.consentGranted !== true) return;

        try {
            const storageKey = this.localStorageKey;
            const savedData = localStorage.getItem(storageKey);

            if (!savedData) return;

            const parsedData = JSON.parse(savedData);

            // Handle new format with drawings and measurementLabels
            if (parsedData.version === "1.1" && parsedData.drawings && parsedData.measurementLabels) {
                const drawings = parsedData.drawings || [];
                const measurementLabels = parsedData.measurementLabels || [];

                // Create set of valid parent IDs from drawings
                const validParentIds = new Set(
                    drawings
                        .map(drawing => drawing.attributes?.uniqueId)
                        .filter(id => id)
                );

                // Filter out orphaned measurement labels
                const cleanedMeasurementLabels = measurementLabels.filter(label => {
                    const parentId = label.attributes?.parentGraphicId;
                    return parentId && validParentIds.has(parentId);
                });

                if (cleanedMeasurementLabels.length !== measurementLabels.length) {
                    //console.log(`🧹 Auto-cleaning localStorage: ${measurementLabels.length} -> ${cleanedMeasurementLabels.length} measurement labels`);

                    // Update localStorage with cleaned data
                    const cleanedData = {
                        ...parsedData,
                        measurementLabels: cleanedMeasurementLabels
                    };

                    localStorage.setItem(storageKey, JSON.stringify(cleanedData));
                    //console.log('✅ localStorage auto-cleaned successfully');
                }
            }

        } catch (error) {
            console.error('❌ Error auto-cleaning localStorage measurements:', error);
        }
    };

    constructor(props: MyDrawingsPanelProps) {
        super(props);

        // Build a unique, stable storage key for this app (origin + pathname)
        const fullUrl = `${window.location.origin}${window.location.pathname}`;
        const baseKey = btoa(fullUrl).replace(/[^a-zA-Z0-9]/g, '_');

        // If a key is provided via props, sanitize it; otherwise use the derived one
        const providedKey = this.props.localStorageKey
            ? String(this.props.localStorageKey).replace(/[^a-zA-Z0-9_-]/g, '_')
            : null;

        this.localStorageKey = providedKey ?? `drawings_${baseKey}`;

        // NEW: per-session flag so the restore prompt shows only once per page load
        this.sessionPromptKey = `drawings_prompt_shown_${baseKey}`;

        // Read consent flag (guard against storage errors)
        let consentGranted: boolean | null = null;
        try {
            const consentValue = localStorage.getItem('drawingConsentGranted');
            consentGranted = consentValue === 'true' ? true
                : consentValue === 'false' ? false
                    : null;
        } catch {
            consentGranted = null;
        }

        // Detect if we have saved drawings for this key (for restore prompt)
        let hasExistingDrawings = false;
        try {
            hasExistingDrawings = !!localStorage.getItem(this.localStorageKey);
        } catch {
            hasExistingDrawings = false;
        }

        // Has the prompt been shown already in THIS browser session?
        let promptAlreadyShown = false;
        try {
            promptAlreadyShown = sessionStorage.getItem(this.sessionPromptKey) === '1';
        } catch {
            promptAlreadyShown = false;
        }

        // Show the prompt only once per session (and only if there are drawings and consent isn't explicitly denied)
        const showLoadPrompt = !promptAlreadyShown && hasExistingDrawings && consentGranted !== false;

        // Mark as shown immediately so remounts (tab switches) won't re-trigger it
        if (showLoadPrompt) {
            try { sessionStorage.setItem(this.sessionPromptKey, '1'); } catch { }
        }

        this.state = {
            drawings: [],
            selectedGraphicIndex: null,
            sortOption: 'name',
            editingGraphicIndex: null,
            alertMessage: '',
            alertType: 'info',
            showAlert: false,
            consentGranted,
            graphicsWatchHandle: null,

            // Confirmation dialog
            confirmDialogOpen: false,
            confirmDialogAction: null,
            confirmDialogMessage: '',
            confirmDialogType: 'delete',
            confirmDialogItemIndex: null,

            // Import dialog
            importDialogOpen: false,
            importFile: null,
            importFileContent: null,

            // Selection
            selectedGraphics: new Set<number>(),
            symbolEditingIndex: null,
            showStorageDisclaimer: false,

            // Text input
            textValue: '',

            // Text symbol style properties
            fontColor: 'rgba(0,0,0,1)',
            fontSize: 12,
            fontFamily: 'Arial',
            fontOpacity: 1,
            fontRotation: 0,

            // Text alignment
            horizontalAlignment: 'center',
            verticalAlignment: 'middle',

            // Alignment button states
            hAlignLeftActive: false,
            hAlignCenterActive: true,
            hAlignRightActive: false,
            vAlignBaseActive: false,
            vAlignTopActive: false,
            vAlignMidActive: true,
            vAlignBotActive: false,

            // Font style button states
            fsBoldActive: false,
            fsItalicActive: false,
            fsUnderlineActive: false,

            // Font style values
            fontWeight: 'normal',
            fontStyle: 'normal',
            fontDecoration: 'none',
            isBold: false,
            isItalic: false,
            isUnderline: false,

            // Halo properties
            fontHaloEnabled: false,
            fontHaloColor: 'rgba(255,255,255,1)',
            fontHaloSize: 1,
            fontHaloOpacity: 1,

            // TextSymbol object (used by the editor)
            currentTextSymbol: new TextSymbol({
                verticalAlignment: 'middle',
                font: { family: 'Arial', size: 12, style: 'normal', weight: 'normal', decoration: 'none' },
                text: 'Text',
                color: new Color('rgba(0,0,0,1)'),
                haloColor: null,
                haloSize: 0,
                angle: 0
            }),

            // Restore prompt (now truly once per session)
            showLoadPrompt,
            hasExistingDrawings
        };

        // Holder for goTo navigation cancels
        this._goToController = null;
    }

    componentDidMount() {
        // Initialize components if consent is already granted (true)
        if (this.state.consentGranted === true && this.props.jimuMapView && this.props.graphicsLayer) {
            // Check for existing drawings first, but only if choice wasn't already made
            if (MyDrawingsPanel._drawingsLoadChoiceTimestamp > 0 || !this.checkExistingDrawings()) {
                // If choice was already made or no existing drawings, initialize normally
                this.initializeComponents();
            }
        }
    }

    private safeSketchViewModelUpdate = (graphics: __esri.Graphic[]) => {
        if (!this.sketchViewModel || !graphics || graphics.length === 0) {
            return Promise.resolve();
        }

        try {
            // Validate graphics before updating
            const validGraphics = graphics.filter(graphic => {
                return graphic &&
                    graphic.geometry &&
                    graphic.symbol &&
                    !graphic.destroyed &&
                    graphic.layer === this.props.graphicsLayer;
            });

            if (validGraphics.length === 0) {
                return Promise.resolve();
            }

            // Create the update operation with error handling
            const updatePromise = this.sketchViewModel.update(validGraphics);

            // Handle the promise to prevent uncaught errors
            if (updatePromise && typeof updatePromise.catch === 'function') {
                return updatePromise.catch(error => {
                    console.warn('SketchViewModel update error (handled):', error);
                    // Don't re-throw, just handle silently
                    return Promise.resolve();
                });
            }

            return Promise.resolve();
        } catch (error) {
            console.warn('SketchViewModel update error (caught):', error);
            return Promise.resolve();
        }
    };


    componentDidUpdate(prevProps: MyDrawingsPanelProps, prevState: MyDrawingsPanelState) {
        // If consent changed from null to true, check for existing drawings first
        if (prevState.consentGranted !== true && this.state.consentGranted === true) {
            if (this.props.jimuMapView && this.props.graphicsLayer) {
                // Check if choice was already made in this page session
                if (MyDrawingsPanel._drawingsLoadChoiceTimestamp > 0 || !this.checkExistingDrawings()) {
                    // If choice was already made or no existing drawings, initialize normally
                    this.initializeComponents();
                }
            }
        }

        // Check if the graphics layer or map view changed (only if consent is granted)
        if (this.state.consentGranted === true && !this.state.showLoadPrompt) {
            if (prevProps.graphicsLayer !== this.props.graphicsLayer && this.props.graphicsLayer) {
                // Remove previous watch handle if it exists
                if (this.state.graphicsWatchHandle) {
                    this.state.graphicsWatchHandle.remove();
                }

                this.setupGraphicsWatcher();
                this.refreshDrawingsFromLayer();
            }

            if (prevProps.jimuMapView !== this.props.jimuMapView && this.props.jimuMapView) {
                this.initializeComponents();
            }
        }

        // ✅ Enable or disable map popups based on tab activity
        //if (prevProps.isActiveTab !== this.props.isActiveTab && this.props.jimuMapView?.view) {
            //this.props.jimuMapView.view.popupEnabled = !this.props.isActiveTab;
        //}
    }

    componentWillUnmount() {
        // Clear measurement update flag
        this._isUpdatingMeasurements = false;

        // Clean up save timeout
        if (this._saveToStorageTimeout) {
            clearTimeout(this._saveToStorageTimeout);
            this._saveToStorageTimeout = null;
        }

        // Clean up measurement update timeout
        if (this._measurementUpdateTimeout) {
            clearTimeout(this._measurementUpdateTimeout);
            this._measurementUpdateTimeout = null;
        }

        // Clear geometry watch timeouts
        if (this._geometryWatchTimeouts) {
            Object.values(this._geometryWatchTimeouts).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            this._geometryWatchTimeouts = {};
        }

        // Stop the map click sync process
        this._mapClickSyncEnabled = false;

        // Clean up measurement style watcher
        if (this._measurementStyleWatcher) {
            this._measurementStyleWatcher.remove();
            this._measurementStyleWatcher = null;
        }

        // Reset the measurement styles initialization flag
        this.measurementStylesInitialized = false;

        // Clean up watch handle
        if (this.state.graphicsWatchHandle) {
            this.state.graphicsWatchHandle.remove();
        }

        // Clean up position watchers
        if (this._positionWatchers) {
            Object.values(this._positionWatchers).forEach(watcher => {
                if (watcher) watcher.remove();
            });
            this._positionWatchers = {};
        }

        // Clean up graphics watch handles
        if (this._graphicsWatchHandles) {
            this._graphicsWatchHandles.forEach(handle => {
                if (handle) handle.remove();
            });
            this._graphicsWatchHandles = [];
        }

        // Clear any pending timeouts
        if (this._savePositionTimeout) {
            clearTimeout(this._savePositionTimeout);
            this._savePositionTimeout = null;
        }

        // Clean up AbortController for goTo operations
        if (this._goToController) {
            this._goToController.abort();
            this._goToController = null;
        }

        // Clean up SketchViewModel ONLY if we created it internally
        if (this.sketchViewModel && this.internalSketchVM) {
            this.sketchViewModel.destroy();
        }

        // 🔑 Cancel any active sketch session
        try { this.sketchViewModel?.cancel(); } catch { }

        // 🔑 Remove all selection halos from point/text graphics
        if (typeof this.removeAllSelectionOverlays === 'function') {
            this.removeAllSelectionOverlays();
        }

        // Optionally re-enable popups when unmounting the component
        // if (this.props.jimuMapView?.view) {
        //   this.props.jimuMapView.view.popupEnabled = true;
        // }
    }


    recreateAttachedBuffer = async (parentGraphic: ExtendedGraphic, restored: boolean = true) => {
        if (!parentGraphic.bufferSettings || !this.props.graphicsLayer) {
            //console.log(`❌ Cannot recreate buffer - missing settings or layer`);
            return;
        }

        const { distance, unit, enabled, opacity } = parentGraphic.bufferSettings;

        if (!enabled) {
            //console.log(`⏭️ Buffer disabled for graphic ${parentGraphic.attributes?.uniqueId}`);
            return;
        }

        // 🔧 CRITICAL: Use the saved opacity from buffer settings, fallback to 50% only if undefined
        const savedOpacity = opacity !== undefined ? opacity : 50;

        try {
            //console.log(`🔄 Recreating buffer for graphic ${parentGraphic.attributes?.uniqueId} with ${savedOpacity}% opacity (restored: ${restored})`);

            const bufferGeometry = await this.createBufferGeometry(parentGraphic.geometry, distance, unit);
            if (!bufferGeometry) {
                console.warn(`❌ Failed to recreate buffer geometry for graphic ${parentGraphic.attributes?.uniqueId}`);
                return;
            }

            // 🔧 CRITICAL: Update buffer settings to include the saved opacity BEFORE creating the symbol
            parentGraphic.bufferSettings = {
                distance: distance,
                unit: unit,
                enabled: enabled,
                opacity: savedOpacity  // Ensure this is set before creating the symbol
            };

            // Create buffer symbol using parent graphic's colors AND saved opacity
            const bufferSymbol = this.createBufferSymbolFromParent(parentGraphic);

            const bufferGraphic = new Graphic({
                geometry: bufferGeometry,
                symbol: bufferSymbol,
                attributes: {
                    uniqueId: `buffer_${parentGraphic.attributes?.uniqueId}_${Date.now()}`,
                    name: `${parentGraphic.attributes?.name || 'Drawing'} Buffer`,
                    parentId: parentGraphic.attributes?.uniqueId,
                    isBuffer: true,
                    hideFromList: true,
                    isMeasurementLabel: false,
                    bufferDistance: distance,
                    bufferUnit: unit
                }
            });

            const extendedBufferGraphic = asExtendedGraphic(bufferGraphic);
            extendedBufferGraphic.isBufferDrawing = true;
            extendedBufferGraphic.sourceGraphicId = parentGraphic.attributes?.uniqueId;

            parentGraphic.bufferGraphic = extendedBufferGraphic;

            const parentIndex = this.props.graphicsLayer.graphics.indexOf(parentGraphic);
            if (parentIndex >= 0) {
                this.props.graphicsLayer.graphics.add(extendedBufferGraphic, parentIndex);
            } else {
                this.props.graphicsLayer.add(extendedBufferGraphic);
            }

            //console.log(`✅ Successfully recreated attached buffer for graphic ${parentGraphic.attributes?.uniqueId} with ${savedOpacity}% opacity`);

        } catch (error) {
            console.error('❌ Error recreating attached buffer:', error);
        }
    };

    setupInteractionManager = () => {
        if (!this.props.jimuMapView?.view) return;

        try {
            // Store original quality setting
            const view = this.props.jimuMapView.view as any;
            if (view.qualityProfile !== undefined) {
                this._originalQuality = view.qualityProfile;
            }

            // More efficient interaction handling
            const startInteraction = () => {
                if (!this._isInteracting) {
                    this._isInteracting = true;

                    // Lower quality during interaction
                    if (view.qualityProfile !== undefined) {
                        view.qualityProfile = "low";
                    }

                    // Hide measurement graphics during interaction
                    if (this.props.graphicsLayer) {
                        this.props.graphicsLayer.graphics.forEach((g: __esri.Graphic) => {
                            if (g.attributes?.isMeasurementLabel || g.attributes?.hideDuringInteraction) {
                                g.visible = false;
                            }
                        });
                    }
                }
            };

            // Debounced end interaction with longer delay
            const endInteraction = this.debounce(() => {
                if (this._isInteracting) {
                    this._isInteracting = false;

                    // Restore original quality
                    if (view.qualityProfile !== undefined) {
                        view.qualityProfile = this._originalQuality;
                    }

                    // Show hidden graphics
                    if (this.props.graphicsLayer) {
                        this.props.graphicsLayer.graphics.forEach((g: __esri.Graphic) => {
                            if (g.attributes?.isMeasurementLabel || g.attributes?.hideDuringInteraction) {
                                g.visible = true;
                            }
                        });
                    }

                    // Force a refresh after a short delay
                    setTimeout(() => this.forceMapRefresh(), 250);
                }
            }, 300); // Longer debounce for smoother transitions

            // Register all interaction events
            this.props.jimuMapView.view.on("drag", startInteraction);
            this.props.jimuMapView.view.on("drag", ["end"], endInteraction);
            this.props.jimuMapView.view.on("mouse-wheel", startInteraction);
            this.props.jimuMapView.view.on("mouse-wheel", endInteraction);
            this.props.jimuMapView.view.on("key-down", (event) => {
                const navKeys = ["+", "-", "_", "=", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
                if (navKeys.includes(event.key)) {
                    startInteraction();
                }
            });
            this.props.jimuMapView.view.on("key-up", endInteraction);

        } catch (err) {
            console.warn("Could not setup interaction manager:", err);
        }
    };

    // Track when user starts interacting
    handleInteractionStart = () => {
        this._isInteracting = true;

        try {
            const view = this.props.jimuMapView?.view as any;

            // Lower rendering quality for smoother interaction
            if (view?.qualityProfile !== undefined) {
                view.qualityProfile = "low";
            }

            // Optionally hide graphics like labels during interaction
            if (this.props.graphicsLayer) {
                this.props.graphicsLayer.graphics.forEach((g: __esri.Graphic) => {
                    if (g.attributes?.isMeasurementLabel || g.attributes?.hideDuringInteraction) {
                        g.visible = false;
                    }
                });
            }
        } catch (err) {
            console.warn("Error in interaction start handler:", err);
        }
    };

    ensureUniqueName = (name: string): string => {
        if (!name) return `Drawing_${Date.now()}`;

        // Check if this name already exists in our drawings
        const lowerCaseName = name.toLowerCase();
        const existingNames = this.state.drawings.map(d =>
            (d.attributes?.name || '').toLowerCase()
        );

        // If name doesn't exist, return as is
        if (!existingNames.includes(lowerCaseName)) {
            return name;
        }

        // Add a counter to make name unique
        let counter = 1;
        let newName = `${name} (${counter})`;
        let lowerCaseNewName = newName.toLowerCase();

        // Keep incrementing counter until we find a unique name
        while (existingNames.includes(lowerCaseNewName)) {
            counter++;
            newName = `${name} (${counter})`;
            lowerCaseNewName = newName.toLowerCase();
        }

        return newName;
    };

    // Track when user stops interacting
    handleInteractionEnd = () => {
        this._isInteracting = false;

        try {
            const view = this.props.jimuMapView?.view as any;

            // Restore rendering quality
            if (view?.qualityProfile !== undefined && this._originalQuality) {
                view.qualityProfile = this._originalQuality;
            }

            // Restore hidden graphics
            if (this.props.graphicsLayer) {
                this.props.graphicsLayer.graphics.forEach((g: __esri.Graphic) => {
                    if (g.attributes?.isMeasurementLabel || g.attributes?.hideDuringInteraction) {
                        g.visible = true;
                    }
                });
            }

            const refresh = () => this.forceMapRefresh();

            // Defer refresh until idle or next frame
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(refresh);
            } else {
                requestAnimationFrame(refresh);
            }

        } catch (err) {
            console.warn("Error in interaction end handler:", err);
        }
    };




    refreshGraphicDisplay = (graphic: ExtendedGraphic) => {
        if (!graphic) return;

        try {
            // First try direct visibility toggle for this specific graphic
            this.ensureGraphicVisibility(graphic);

            // If we have a valid graphic index, update our internal state
            const uniqueId = graphic.attributes?.uniqueId;
            if (uniqueId && this._drawingMap.has(uniqueId)) {
                const index = this._drawingMap.get(uniqueId);
                if (index !== undefined) {
                    // Update state for this specific graphic
                    const updatedDrawings = [...this.state.drawings];
                    updatedDrawings[index] = graphic;

                    this.setState({ drawings: updatedDrawings });
                }
            }
        } catch (err) {
            console.error("Error refreshing graphic display:", err);

            // Fall back to the traditional refresh as a last resort
            // But don't do it if we're interacting to avoid excessive refreshes
            if (!this._isInteracting) {
                this.forceMapRefresh();
            }
        }
    };

    forceMapRefresh = () => {
        if (!this.props.jimuMapView?.view) return;

        try {
            // Abort any ongoing navigation
            if (this._goToController) {
                this._goToController.abort();
                this._goToController = null;
            }

            // Create a new controller
            const controller = new AbortController();
            this._goToController = controller;

            // Get current center and scale
            const view = this.props.jimuMapView.view;
            const currentCenter = view.center.clone();
            const currentScale = view.scale;

            // Option 1: Stationary refresh (no motion)
            view.goTo({
                target: currentCenter,
                scale: currentScale
            }, {
                animate: false,
                duration: 0,
                signal: controller.signal
            }).catch(err => {
                if (err.name !== 'AbortError' && err.name !== 'view:goto-interrupted') {
                    console.error('Map refresh error:', err);
                }
            });

            // Option 2: Alternative approach - use updateExtent
            // view.extent = view.extent.clone();

        } catch (err) {
            console.error("Error refreshing map:", err);
        }
    };


    ensureGraphicVisibility = (graphic: ExtendedGraphic) => {
        if (!graphic || !this.props.graphicsLayer) return;

        try {
            // Store original visibility
            const wasVisible = graphic.visible !== false;

            // Toggle visibility to force a redraw of just this graphic
            // This is much lighter than refreshing the whole map
            graphic.visible = false;

            // Use setTimeout instead of requestAnimationFrame for broader compatibility
            setTimeout(() => {
                if (graphic && !graphic.destroyed) {
                    // Restore original visibility
                    graphic.visible = wasVisible;
                }
            }, 0);
        } catch (err) {
            console.error("Error ensuring graphic visibility:", err);
        }
    };

    handleLoadExistingDrawings = () => {
        // Set a timestamp to mark that we've shown the prompt in this page session
        MyDrawingsPanel._drawingsLoadChoiceTimestamp = new Date().getTime();

        //console.log('User chose to load existing drawings - choice recorded for this page session');

        this.setState({ showLoadPrompt: false }, () => {
            // Load drawings from localStorage and initialize components
            this.loadFromLocalStorage();
            this.initializeComponents();
        });
    };

    handleStartFresh = () => {
        // Set a timestamp to mark that we've shown the prompt in this page session
        MyDrawingsPanel._drawingsLoadChoiceTimestamp = new Date().getTime();

        //console.log('User chose to delete all and start new - choice recorded for this page session');

        // Remove existing drawings from localStorage
        if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
            try {
                localStorage.removeItem(this.localStorageKey);
                //console.log(`Cleared existing drawings from localStorage key: ${this.localStorageKey}`);
            } catch (err) {
                console.error(`Error clearing drawings from localStorage:`, err);
            }
        }

        // Initialize with empty drawing layer
        this.setState({
            showLoadPrompt: false,
            hasExistingDrawings: false
        }, this.initializeComponents);
    };

    // Call this in your initializeComponents method
    setupMapQualityManager = () => {
        if (!this.props.jimuMapView?.view) return;
        try {
            // Use type assertion or conditional check
            const view = this.props.jimuMapView.view as any; // Type assertion

            // Store original quality setting
            if (view.qualityProfile !== undefined) {
                this._originalQuality = view.qualityProfile;
            }

            // Rest of your code remains the same
            view.on("drag", ["start"], () => this.lowerMapQuality());
            view.on("drag", ["end"], () => this.restoreMapQuality());
            // etc...
        } catch (err) {
            console.warn("Could not setup map quality manager:", err);
        }
    };

    // Lower map quality during interactions to reduce texture warnings
    lowerMapQuality = () => {
        if (!this.props.jimuMapView?.view) return;
        try {
            // Type assertion approach
            const view = this.props.jimuMapView.view as any;

            // Lower quality during interaction
            if (view.qualityProfile !== undefined) {
                view.qualityProfile = "low";
            }
        } catch (err) {
            console.warn("Could not lower map quality:", err);
        }
    };

    restoreMapQuality = () => {
        if (!this.props.jimuMapView?.view) return;
        try {
            // Type assertion approach
            const view = this.props.jimuMapView.view as any;

            // Restore original quality
            if (view.qualityProfile !== undefined) {
                view.qualityProfile = this._originalQuality;
            }
        } catch (err) {
            console.warn("Could not restore map quality:", err);
        }
    };

    // Utility debounce function
    debounce = (func: Function, wait: number) => {
        let timeout: any;

        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    resetSessionChoice = () => {
        sessionStorage.removeItem('drawingsLoadChoiceMade');
        //console.log('Load choice session flag has been reset');
    };

    checkExistingDrawings = () => {
        const currentTime = new Date().getTime();

        // Check if we've shown this prompt recently in this specific page load
        if (MyDrawingsPanel._drawingsLoadChoiceTimestamp > 0) {
            //console.log('Load choice was already made in this page session - skipping prompt');
            return false;
        }

        if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
            try {
                // Get saved data without immediately loading it
                const savedData = localStorage.getItem(this.localStorageKey);

                if (savedData) {
                    const parsedData = JSON.parse(savedData);

                    // Handle both old format (array) and new format (object with drawings)
                    let drawingsData = [];

                    if (Array.isArray(parsedData)) {
                        // Old format - just drawings
                        drawingsData = parsedData;
                    } else if (parsedData.drawings) {
                        // New format - includes measurement labels
                        drawingsData = parsedData.drawings || [];
                    }

                    // Check if we have valid data with drawings
                    if (Array.isArray(drawingsData) && drawingsData.length > 0) {
                        // We have existing drawings, so we should show the load prompt
                        this.setState({
                            hasExistingDrawings: true,
                            showLoadPrompt: true
                        });
                        //console.log(`Found ${drawingsData.length} existing drawing(s) in localStorage - showing prompt`);
                        return true;
                    }
                }
            } catch (err) {
                console.error(`Error checking for existing drawings in localStorage:`, err);
            }
        }

        return false;
    };


    handleDrawingSelectAndScroll = (graphic: __esri.Graphic, index: number) => {
        try {
            // stop any nav/edit
            if (this._goToController) { this._goToController.abort(); this._goToController = null; }
            try { this.sketchViewModel?.cancel(); } catch { }

            // 🔑 capture previous selection BEFORE changing state
            const prevIndex = this.state.selectedGraphicIndex;

            // remove halo from the previously selected point/text (if any)
            this.removePointTextOverlayByIndex(prevIndex);

            // now set the new selection
            this.setState({ selectedGraphicIndex: index });

            // scroll into view
            const item = document.getElementById(`drawing-item-${index}`);
            if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // defer highlight a touch for UI smoothness
            setTimeout(() => {
                if (!this._isInteracting) {
                    this.highlightGraphic(graphic, index);
                    this.props.onDrawingSelect?.(graphic, index);
                }
            }, 100);
        } catch (err) {
            console.error('Error in handleDrawingSelectAndScroll:', err);
            this.showLocalAlert('Error selecting drawing from map', 'error');
        }
    };




    initializeComponents = () => {
        //console.log('🚀 initializeComponents called');
        // console.log('📊 Props check:', {
        //   hasJimuMapView: !!this.props.jimuMapView,
        //   hasGraphicsLayer: !!this.props.graphicsLayer,
        //   consentGranted: this.state.consentGranted
        // });

        if (!this.props.jimuMapView || !this.props.graphicsLayer) {
            //console.log('❌ Missing required props, exiting');
            return;
        }

        // Create SketchViewModel with proper error handling
        try {
            this.sketchViewModel = new SketchViewModel({
                view: this.props.jimuMapView.view,
                layer: this.props.graphicsLayer
            });
            this.internalSketchVM = true;
            //console.log('✅ SketchViewModel created successfully');
        } catch (error) {
            console.error('Error creating SketchViewModel:', error);
            return;
        }

        //console.log('🔧 Starting initialization managers...');

        // Initialize managers/watchers you already had
        this.setupInteractionManager();
        //console.log('✅ setupInteractionManager completed');

        this.fixMeasurementLabelStyles();
        //console.log('✅ fixMeasurementLabelStyles completed');

        this.setupGraphicsWatcher();
        //console.log('✅ setupGraphicsWatcher completed');

        this.refreshDrawingsFromLayer();
        //console.log('✅ refreshDrawingsFromLayer completed');

        if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
            this.loadFromLocalStorage();
            //console.log('✅ loadFromLocalStorage completed');
        }

        //console.log('🗺️ Building drawing map...');

        // Fast lookup map
        const rebuildDrawingMap = () => {
            this._drawingMap.clear();
            this.state.drawings.forEach((drawing, idx) => {
                const id = drawing.attributes?.uniqueId;
                if (id) this._drawingMap.set(id, idx);
            });
        };

        rebuildDrawingMap();
        //console.log('✅ Drawing map built');

        this._afterRefreshDrawings = () => {
            rebuildDrawingMap();
            this.forceMapRefresh();
        };

        this.scheduleDrawingsSyncCheck();
        //console.log('✅ Sync check scheduled');

        //console.log('🎯 Setting up SketchViewModel event handler...');

        // --- SketchViewModel update handler ---
        this.sketchViewModel.on("update", (event) => {
            try {
                if (event.state === "active" && event.graphics.length > 0) {
                    // Filter selectable graphics
                    const selectable = event.graphics.filter((gra: __esri.Graphic) =>
                        !gra.attributes?.isBuffer &&
                        !gra.attributes?.isBufferDrawing &&
                        !gra.attributes?.isPreviewBuffer &&
                        !gra.attributes?.isMeasurementLabel &&
                        !gra.attributes?.hideFromList &&
                        !gra.attributes?.uniqueId?.startsWith('buffer_') &&
                        !(gra.geometry?.type === 'point' &&
                            gra.symbol?.type === 'text' &&
                            gra.attributes?.isMeasurementLabel)
                    );

                    if (!selectable.length) return;

                    const selectedGraphic = selectable[0] as ExtendedGraphic;

                    // Ensure halo during active edit for point/text and keep it in sync
                    if (selectedGraphic.geometry?.type === 'point') {
                        this.ensurePointTextOverlay(selectedGraphic);
                        if (selectedGraphic._selectionOverlay) {
                            try { selectedGraphic._selectionOverlay.geometry = selectedGraphic.geometry; } catch { }
                        }
                    }

                    // Reflect selection in the list/state
                    const uid = selectedGraphic.attributes?.uniqueId;
                    if (uid && this._drawingMap.has(uid)) {
                        const index = this._drawingMap.get(uid)!;

                        document.querySelectorAll('.drawing-item').forEach(el => el.classList.remove('selected-drawing'));
                        const item = document.getElementById(`drawing-item-${index}`);
                        if (item) {
                            item.classList.add('selected-drawing');
                            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }

                        this.setState({
                            selectedGraphicIndex: index,
                            selectedGraphics: new Set([index])
                        });

                        this.props.onDrawingSelect?.(selectedGraphic, index);
                    }
                }

                if (event.state === "complete" && event.graphics.length > 0) {
                    setTimeout(() => {
                        this.ignoreNextGraphicsUpdate = true;
                        this.refreshDrawingsFromLayer();

                        if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                            this.saveToLocalStorage();
                        }
                    }, 50);
                }

                if (event.state === "complete") {
                    if (this._goToController) {
                        this._goToController.abort();
                        this._goToController = null;
                    }
                }
            } catch (error) {
                console.warn('SketchViewModel event handler error:', error);
            }
        });
        //console.log('✅ SketchViewModel event handler registered');

        //console.log('🎯 Setting up graphics watchers...');

        // Graphics collection watchers
        const graphicsWatchHandle = this.props.graphicsLayer.graphics.watch("length", (n, o) => {
            if (n > o) setTimeout(() => this.forceMapRefresh(), 100);
        });
        this._graphicsWatchHandles.push(graphicsWatchHandle);

        this.props.graphicsLayer.graphics.on("change", (evt) => {
            if (evt.added && evt.added.length > 0) {
                setTimeout(() => this.forceMapRefresh(), 100);
            }
        });
        //console.log('✅ Graphics watchers set up');

        // REMOVED: Duplicate map click handler that was interfering with the Widget's click handler
        // The Widget's activeViewChangeHandler already has the map click handler that integrates with this panel

        //console.log('🔄 Rebuilding final drawing map...');

        // Rebuild drawing map after initial load and after refreshes
        this._drawingMap.clear();
        this.state.drawings.forEach((drawing, idx) => {
            const id = drawing.attributes?.uniqueId;
            if (id) this._drawingMap.set(id, idx);
        });

        this._afterRefreshDrawings = () => {
            this._drawingMap.clear();
            this.state.drawings.forEach((drawing, idx) => {
                const id = drawing.attributes?.uniqueId;
                if (id) this._drawingMap.set(id, idx);
            });

            if (this.state.drawings.length > 0 && !this._isInteracting) {
                setTimeout(() => this.forceMapRefresh(), 100);
            }
        };
        //console.log('✅ Final drawing map built');

        //console.log('⏰ Starting map click sync...');
        // Start map click sync
        this.mapClickSync();
        //console.log('✅ Map click sync started');

        //console.log('🏁 initializeComponents completed successfully');
    };



    mapClickSync = () => {
        // Only run if enabled
        if (!this._mapClickSyncEnabled || !this.props.jimuMapView || !this.props.graphicsLayer) return;

        // Get currently selected graphics from the SketchViewModel
        const selectedGraphics = this.sketchViewModel?.updateGraphics?.toArray() || [];

        if (selectedGraphics.length > 0) {
            // Get the first selected graphic
            const selectedGraphic = selectedGraphics[0];

            if (selectedGraphic.attributes?.uniqueId) {
                const uniqueId = selectedGraphic.attributes.uniqueId;

                // Look up the index in our map
                if (this._drawingMap.has(uniqueId)) {
                    const index = this._drawingMap.get(uniqueId);

                    // Only update if selection has changed and index is defined
                    if (index !== undefined && this.state.selectedGraphicIndex !== index) {
                        //console.log(`Map sync found different selection: ${index}`);

                        // Update UI immediately
                        document.querySelectorAll('.drawing-item').forEach(item => {
                            item.classList.remove('selected-drawing');
                        });

                        const item = document.getElementById(`drawing-item-${index}`);
                        if (item) {
                            item.classList.add('selected-drawing');
                            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }

                        // Update state
                        this.setState({
                            selectedGraphicIndex: index
                            // MODIFIED: Remove this line to preserve multiple selections
                            // selectedGraphics: new Set([index])
                        });

                        // Notify parent
                        if (this.props.onDrawingSelect) {
                            this.props.onDrawingSelect(selectedGraphic, index);
                        }
                    }
                }
            }
        }

        // Schedule next sync
        setTimeout(this.mapClickSync, 500);
    };


    setupGraphicsWatcher = () => {
        if (!this.props.graphicsLayer) return;

        // Watch for changes to the graphics collection
        const watchHandle = this.props.graphicsLayer.graphics.on("change", (event) => {
            // Skip if we triggered this change ourselves
            if (this.ignoreNextGraphicsUpdate) {
                this.ignoreNextGraphicsUpdate = false;
                return;
            }

            // Refresh drawings from the layer
            this.refreshDrawingsFromLayer();
        });

        this.setState({ graphicsWatchHandle: watchHandle });
    }

    refreshDrawingsFromLayer = () => {
        if (!this.props.graphicsLayer) return;

        // Get all graphics from the layer
        const allGraphics = this.props.graphicsLayer.graphics.toArray();

        // Filter to include main drawings ONLY, exclude ALL buffer types
        const filteredGraphics = allGraphics.filter(g => {
            // Exclude measurement labels
            if (g.attributes?.isMeasurementLabel) return false;

            // Exclude preview buffer graphics (temporary visualizations)
            if (g.attributes?.isPreviewBuffer) return false;

            // Exclude graphics marked as hidden from list
            if (g.attributes?.hideFromList) return false;

            // 🔧 NEW: Exclude ALL buffer graphics (both attached and standalone)
            if (g.attributes?.isBuffer) return false;

            // Exclude text graphics that are measurement labels
            if (g.geometry?.type === 'point' &&
                g.symbol?.type === 'text' &&
                g.attributes?.isMeasurementLabel) return false;

            // ONLY include main drawings (no buffers)
            return true;
        }) as ExtendedGraphic[];

        // Sort and update state...
        const sortedGraphics = this.sortGraphicsArray(filteredGraphics);
        this.setState({
            drawings: sortedGraphics,
            selectedGraphics: new Set<number>(),
            symbolEditingIndex: null
        }, () => {
            if (this.props.onDrawingsUpdate) {
                this.props.onDrawingsUpdate(sortedGraphics);
            }
            if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                this.saveToLocalStorage();
            }
            if (typeof this._afterRefreshDrawings === 'function') {
                this._afterRefreshDrawings();
            }
        });
    };

    verifyDrawingsSync = () => {
        if (!this.props.graphicsLayer) return;

        // Count actual visible graphics (excluding measurement labels)
        const visibleGraphics = this.props.graphicsLayer.graphics.filter(g =>
            !g.attributes?.isMeasurementLabel &&
            !g.attributes?.hideFromList
        ).length;

        // Compare with drawings array
        if (visibleGraphics !== this.state.drawings.length) {
            console.warn(`Drawing sync issue detected: ${visibleGraphics} visible graphics vs ${this.state.drawings.length} drawings in state`);

            // Force refresh if mismatch detected
            this.forceMapRefresh();
        } else {
            //console.log(`Drawings sync verified: ${visibleGraphics} visible graphics match ${this.state.drawings.length} drawings in state`);
        }
    };

    scheduleDrawingsSyncCheck = () => {
        // Check sync 1 second after initialization
        setTimeout(() => {
            this.verifyDrawingsSync();

            // Additional check after 3 seconds to catch any lagging issues
            setTimeout(() => {
                this.verifyDrawingsSync();
            }, 3000);
        }, 1000);
    };

    sortGraphicsArray = (graphics: ExtendedGraphic[]) => {
        const { sortOption } = this.state;

        return [...graphics].sort((a, b) => {
            if (sortOption === 'name') {
                const nameA = (a.attributes?.name || '').toLowerCase();
                const nameB = (b.attributes?.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            } else if (sortOption === 'type') {
                const typeA = (a.attributes?.geometryType || a.geometry?.type || '').toLowerCase();
                const typeB = (b.attributes?.geometryType || b.geometry?.type || '').toLowerCase();
                return typeA.localeCompare(typeB);
            } else if (sortOption === 'created') {
                const createdA = a.attributes?.createdDate ? Number(a.attributes.createdDate) : 0;
                const createdB = b.attributes?.createdDate ? Number(b.attributes.createdDate) : 0;
                return createdB - createdA; // Newest first
            }
            return 0;
        });
    }

    handleConsentYes = () => {
        localStorage.setItem('drawingConsentGranted', 'true');
        this.setState({ consentGranted: true, showStorageDisclaimer: true });
    }

    handleDrawingSelect = (inGraphic: __esri.Graphic) => {
        if (!inGraphic || !inGraphic.geometry || !this.sketchViewModel) return;

        const graphic = inGraphic as ExtendedGraphic;
        //console.log('handleDrawingSelect called for:', graphic.geometry?.type, graphic.attributes?.name);

        // Are we in multi-select? (selectedGraphics holds all selected indices)
        const multiSet = this.state.selectedGraphics as Set<number> | undefined;
        // Treat multi as 2+ items, not 1+
        const isMulti = !!multiSet && multiSet.size > 1;

        // 1) Clear previous overlay more reliably
        if (!isMulti) {
            // Find and remove any existing overlays from other graphics
            this.state.drawings.forEach((drawing) => {
                const extDrawing = drawing as ExtendedGraphic;
                if (extDrawing._selectionOverlay && extDrawing !== graphic) {
                    this.removePointTextOverlay(extDrawing);
                }
            });
        }

        // 2) Cancel any active sketch interaction
        try { this.sketchViewModel.cancel(); } catch { }

        // 3) Normalize unsupported polyline symbols
        if (graphic.geometry.type === 'polyline' && graphic.symbol?.type !== 'simple-line') {
            const symbolColor = (graphic.symbol as any)?.color || [0, 0, 0, 1];
            const symbolWidth = (graphic.symbol as any)?.width || 2;
            const symbolStyle = (graphic.symbol as any)?.style || 'solid';
            graphic.symbol = new SimpleLineSymbol({ color: symbolColor, width: symbolWidth, style: symbolStyle });
        }

        const isPoint = graphic.geometry.type === 'point';
        const symbolType = (graphic.symbol as any)?.type;
        const isText = isPoint && symbolType === 'text';
        const isPictureMarker = isPoint && symbolType === 'picture-marker';

        //console.log('Graphic details - isPoint:', isPoint, 'symbolType:', symbolType, 'isText:', isText);

        const commonOptions: __esri.SketchViewModelUpdateUpdateOptions = {
            enableRotation: true,
            enableScaling: true,
            enableZ: false,
            multipleSelectionEnabled: false
        };

        const pointOptions: __esri.SketchViewModelUpdateUpdateOptions = {
            tool: 'transform',
            toggleToolOnClick: false,
            enableRotation: true,
            enableScaling: isText || isPictureMarker,
            enableZ: false,
            multipleSelectionEnabled: false
        };

        // 4) Apply selection/update to the clicked graphic
        try {
            //console.log('Applying SketchViewModel selection...');
            this.sketchViewModel.update([graphic], isPoint ? pointOptions : commonOptions);
        } catch (error) {
            console.warn('Error updating SketchViewModel for selection:', error);
            try { this.sketchViewModel.update([graphic]); } catch (fallbackError) {
                console.warn('Fallback SketchViewModel update also failed:', fallbackError);
            }
        }

        // 5) Ensure halos for all selected items in multi-select, plus this one
        try {
            if (isPoint) {
                //console.log('Setting timeout to create overlay for point graphic...');
                // Use setTimeout to ensure SketchViewModel operations complete first
                setTimeout(() => {
                    //console.log('Timeout executing - creating overlay now');
                    this.ensurePointTextOverlay(graphic);

                    // ADDITIONAL: Force a check after even more time
                    setTimeout(() => {
                        //console.log('Double-check: Does graphic have overlay?', !!graphic._selectionOverlay);
                        if (!graphic._selectionOverlay) {
                            //console.log('No overlay found - trying again');
                            this.ensurePointTextOverlay(graphic);
                        }
                    }, 200);
                }, 150); // Increased delay
            }

            if (isMulti) {
                // Ensure halo exists for each currently selected point/text
                multiSet!.forEach(idx => {
                    const g = this.state.drawings?.[idx] as ExtendedGraphic | undefined;
                    if (g && g.geometry?.type === 'point') {
                        setTimeout(() => {
                            this.ensurePointTextOverlay(g);
                        }, 150);
                    }
                });
            } else {
                // Single-select mode → only the current graphic should have a halo
                // (we already removed previous above)
            }
        } catch (e) {
            console.warn('Selection overlay management failed:', e);
        }

        // 6) Persist position changes & keep halo in sync while moving
        const graphicKey = graphic.attributes?.uniqueId || `temp_${Date.now()}`;

        if (this._positionWatchers && this._positionWatchers[graphicKey]) {
            this._positionWatchers[graphicKey].remove();
            delete this._positionWatchers[graphicKey];
        }
        if (!this._positionWatchers) this._positionWatchers = {};

        this._positionWatchers[graphicKey] = graphic.watch('geometry', (newGeometry) => {
            if (isPoint && graphic._selectionOverlay) {
                try { graphic._selectionOverlay.geometry = newGeometry; } catch { }
            }
            clearTimeout(this._savePositionTimeout as any);
            this._savePositionTimeout = setTimeout(() => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            }, 500);
        });
    };

    handleListItemClick = (graphic: ExtendedGraphic, index: number) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        // Ensure attributes / uniqueId
        try {
            if (!graphic.attributes) (graphic as any).attributes = {};
            if (!(graphic as any).attributes.uniqueId) {
                (graphic as any).attributes.uniqueId = `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            }
        } catch (e) {
            console.warn('Panel: could not ensure uniqueId on graphic:', e);
        }

        // If already selected, just re-apply selection
        if (this.state.selectedGraphicIndex === index) {
            this.props.onClearSelectionOverlays?.();

            // Wrap in try-catch for safety
            Promise.resolve(
                typeof this.props.onDrawingSelect === 'function'
                    ? this.props.onDrawingSelect(graphic, index)
                    : (this as any).handleDrawingSelect?.(graphic, index)
            ).catch(error => {
                // Silently handle SketchViewModel errors
                if (error?.name !== 'AbortError') {
                    console.warn('Re-selection encountered an issue (non-critical):', error);
                }
            });
            return;
        }

        // Abort any ongoing navigation
        if (this._goToController) {
            this._goToController.abort();
            this._goToController = null;
        }

        // Update React state
        this.setState({ selectedGraphicIndex: index });

        // Initialize symbol editor state
        this.openSymbolEditor(index);

        // Apply selection + navigate (with error handling)
        this.highlightGraphic(graphic, index).catch(error => {
            console.warn('Highlight graphic failed (non-critical):', error);
        });
    };

    highlightGraphic = async (graphic: ExtendedGraphic, index: number) => {
        if (!graphic || !this.props.jimuMapView || this.state.consentGranted !== true) return;

        try {
            // 1) Abort any ongoing navigation
            if (this._goToController) {
                this._goToController.abort();
                this._goToController = null;
            }

            // 2) Ensure uniqueId
            try {
                if (!graphic.attributes) (graphic as any).attributes = {};
                if (!(graphic as any).attributes.uniqueId) {
                    (graphic as any).attributes.uniqueId = `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                }
            } catch (e) {
                console.warn('Panel: ensure uniqueId in highlightGraphic failed:', e);
            }

            // 3) Clear existing halos first
            this.props.onClearSelectionOverlays?.();

            // 4) Delegate selection to widget with error handling wrapper
            if (typeof this.props.onDrawingSelect === 'function') {
                try {
                    await this.props.onDrawingSelect(graphic, index);
                } catch (error) {
                    // Catch SketchViewModel errors without blocking the rest of the function
                    if (error?.name !== 'AbortError' && error?.name !== 'view:goto-interrupted') {
                        console.warn('Selection update encountered an issue (non-critical):', error);
                    }
                    // Continue with navigation even if selection failed
                }
            }

            // 5) Always notify parent (if different callback)
            this.props.onDrawingSelect?.(graphic, index);

            // 6) Skip navigation if no geometry
            if (!graphic.geometry) return;

            // 7) Wait for view to be ready
            await this.props.jimuMapView.view.when();

            // 8) Build navigation target
            const controller = new AbortController();
            this._goToController = controller;

            let target: __esri.Geometry | __esri.Point = graphic.geometry as any;
            let scale: number;

            if (graphic.geometry.type !== 'point') {
                if ('centroid' in graphic.geometry) {
                    target = (graphic.geometry as any).centroid;
                } else if (graphic.geometry.extent?.center) {
                    target = graphic.geometry.extent.center;
                }
            }

            if (graphic.geometry.extent) {
                const extentWidth = graphic.geometry.extent.width;
                scale = extentWidth * 5;
                scale = Math.max(500, Math.min(50000, scale));
            } else {
                scale = 2000;
            }

            // 9) Execute navigation (catches internally)
            this.props.jimuMapView.view.goTo(
                { target, scale },
                { animate: false, duration: 0, signal: controller.signal }
            ).catch(err => {
                if (err?.name !== 'AbortError' && err?.name !== 'view:goto-interrupted') {
                    console.error('Navigation error:', err);
                }
            });

        } catch (error) {
            // Catch any other unexpected errors
            console.error('Error highlighting graphic (panel):', error);
        }
    };

    handleConsentNo = () => {
        // Set localStorage value to 'false' to remember user's choice
        localStorage.setItem('drawingConsentGranted', 'false');

        // Delete any existing stored drawings
        localStorage.removeItem(this.localStorageKey);

        // Set state to false but don't close the panel, just show the permission denied UI
        this.setState({ consentGranted: false });
    }

    handleDrawingsUpdate = (drawings: ExtendedGraphic[]) => {
        try {
            //console.log(`📊 handleDrawingsUpdate called with ${drawings.length} drawings`);

            // Notify parent component about the drawings update
            if (this.props.onDrawingsUpdate) {
                this.props.onDrawingsUpdate(drawings);
            }

            // Batch measurement updates with longer delays to prevent loops
            if (this.measureRef?.current && !this._processingMeasurements) {
                this._processingMeasurements = true;

                //console.log('🔄 Scheduling batched measurement refresh for updated drawings');

                // Process drawings in smaller batches with delays
                const batchSize = 2; // Process 2 drawings at a time
                const processBatch = (startIndex: number) => {
                    const endIndex = Math.min(startIndex + batchSize, drawings.length);
                    const batch = drawings.slice(startIndex, endIndex);

                    batch.forEach((drawing, localIndex) => {
                        const globalIndex = startIndex + localIndex;
                        if (drawing && drawing.geometry) {
                            // Stagger each measurement update with increasing delays
                            setTimeout(() => {
                                this.performSingleMeasurementUpdate(drawing);
                            }, globalIndex * 300); // 300ms delay between each drawing
                        }
                    });

                    // Process next batch if there are more drawings
                    if (endIndex < drawings.length) {
                        setTimeout(() => {
                            processBatch(endIndex);
                        }, batchSize * 300 + 200); // Extra delay between batches
                    } else {
                        // All batches processed
                        setTimeout(() => {
                            this._processingMeasurements = false;
                            //console.log('✅ Completed batched measurement processing');
                        }, batchSize * 300 + 500);
                    }
                };

                // Start processing the first batch
                setTimeout(() => {
                    processBatch(0);
                }, 1000); // Initial delay before starting
            } else {
                //console.log('📏 Measurement updates skipped - system busy or no measurement system available');
            }

            // Debounced save to localStorage
            this.saveToLocalStorage();

        } catch (error) {
            console.error('❌ Error in handleDrawingsUpdate:', error);
            this._processingMeasurements = false; // Reset flag on error
            this.showLocalAlert('Error updating drawings', 'error');
        }
    };


    loadFromLocalStorage = () => {
        if (this.props.allowLocalStorage === false || this.state.consentGranted !== true) return;

        // Clean up localStorage first
        this.cleanupLocalStorageMeasurements();

        const storageKey = this.localStorageKey;
        //console.log(`📂 Loading drawings from localStorage key: ${storageKey}`);

        const savedData = localStorage.getItem(storageKey);
        if (!savedData) {
            //console.log(`📂 No saved drawings found for key: ${storageKey}`);
            return;
        }

        const runRestore = () => {
            try {
                const parsedData = JSON.parse(savedData);

                // Handle old format (array), v1.1, v1.2, v1.3, and new v1.4 format with measurement customization
                let drawingsData = [];
                let measurementLabelsData = [];

                if (Array.isArray(parsedData)) {
                    drawingsData = parsedData;
                    //console.log('📂 Loading data in old format (drawings only)');
                } else if (parsedData.version === "1.1" && parsedData.drawings) {
                    drawingsData = parsedData.drawings || [];
                    measurementLabelsData = parsedData.measurementLabels || [];
                    //console.log('📂 Loading data in v1.1 format (drawings + measurement labels)');
                } else if (parsedData.version === "1.2" && parsedData.drawings) {
                    drawingsData = parsedData.drawings || [];
                    measurementLabelsData = parsedData.measurementLabels || [];
                    //console.log('📂 Loading data in v1.2 format (drawings + measurement labels + buffer drawings)');
                } else if (parsedData.version === "1.3" && parsedData.drawings) {
                    drawingsData = parsedData.drawings || [];
                    measurementLabelsData = parsedData.measurementLabels || [];
                    //console.log('📂 Loading data in v1.3 format (drawings + measurement labels + buffer settings)');
                } else if (parsedData.version === "1.4" && parsedData.drawings) {
                    drawingsData = parsedData.drawings || [];
                    measurementLabelsData = parsedData.measurementLabels || [];
                    //console.log('📂 Loading data in v1.4 format (drawings + measurement labels + buffer settings + measurement customization)');
                } else {
                    console.warn(`⚠️ Invalid data format in localStorage for key: ${storageKey}`);
                    return;
                }

                if (this.props.graphicsLayer && this.props.graphicsLayer.graphics.length === 0) {
                    this.props.graphicsLayer.removeAll();
                    this.ignoreNextGraphicsUpdate = true;

                    let loadedDrawingsCount = 0;
                    let loadedBufferDrawingsCount = 0;
                    let loadedLabelsCount = 0;
                    let loadedBuffersCount = 0;
                    let loadedCustomizedLabelsCount = 0;
                    const restoredGraphics = new Map<string, ExtendedGraphic>();

                    // First, restore main drawings (including permanent buffer drawings and buffer settings)
                    drawingsData.forEach((item, index) => {
                        try {
                            const graphic = asExtendedGraphic(Graphic.fromJSON(item));

                            if (!graphic.attributes) {
                                graphic.attributes = {};
                            }

                            if (!graphic.attributes.uniqueId) {
                                graphic.attributes.uniqueId = `restored_${Date.now()}_${index}`;
                            }

                            // Handle v1.2 format: Restore buffer drawing attributes if present (legacy permanent buffers)
                            if (item.attributes?.isBufferDrawing) {
                                graphic.isBufferDrawing = true;
                                graphic.sourceGraphicId = item.attributes.sourceGraphicId;
                                // Ensure buffer drawing attributes are preserved
                                graphic.attributes.isBufferDrawing = true;
                                graphic.attributes.sourceGraphicId = item.attributes.sourceGraphicId;
                                graphic.attributes.bufferDistance = item.attributes.bufferDistance;
                                graphic.attributes.bufferUnit = item.attributes.bufferUnit;
                                loadedBufferDrawingsCount++;
                            }
                            // CRITICAL: Restore buffer settings WITH opacity (v1.3+ format)
                            else if (item.attributes?.bufferSettings) {
                                graphic.bufferSettings = {
                                    distance: item.attributes.bufferSettings.distance,
                                    unit: item.attributes.bufferSettings.unit,
                                    enabled: item.attributes.bufferSettings.enabled,
                                    opacity: item.attributes.bufferSettings.opacity // Include opacity restoration
                                };

                                // Log what opacity was restored for debugging
                                //console.log(`📥 MyDrawingsPanel: Restored buffer settings for graphic ${graphic.attributes.uniqueId}:`, graphic.bufferSettings);

                                if (graphic.bufferSettings.enabled) {
                                    loadedBuffersCount++;
                                } else {
                                    loadedDrawingsCount++;
                                }
                            } else {
                                loadedDrawingsCount++;
                            }

                            this.props.graphicsLayer.add(graphic);
                            restoredGraphics.set(graphic.attributes.uniqueId, graphic);
                        } catch (err) {
                            console.warn(`⚠️ Error restoring graphic at index ${index} from localStorage:`, err);
                        }
                    });

                    // Then, restore measurement labels and re-establish relationships WITH customization support
                    measurementLabelsData.forEach((item, index) => {
                        try {
                            const labelGraphic = asExtendedGraphic(Graphic.fromJSON(item));

                            if (!labelGraphic.attributes) {
                                labelGraphic.attributes = {};
                            }

                            // Ensure measurement label flags are set
                            labelGraphic.attributes.isMeasurementLabel = true;
                            labelGraphic.attributes.hideFromList = true;

                            // CRITICAL: Restore customization flags and custom position (v1.4+ format)
                            if (item.attributes?.customized) {
                                labelGraphic.attributes.customized = true;
                                labelGraphic.attributes.lastModified = item.attributes.lastModified;
                                loadedCustomizedLabelsCount++;
                                //console.log(`📥 Restored customized measurement label: ${labelGraphic.attributes?.name || 'unnamed'}`);
                            }

                            if (item.attributes?.hasCustomPosition && item.attributes?.customPosition) {
                                labelGraphic.attributes.hasCustomPosition = true;
                                labelGraphic.attributes.customPosition = item.attributes.customPosition;
                                //console.log(`📥 Restored custom position for measurement label at: ${item.attributes.customPosition.x}, ${item.attributes.customPosition.y}`);
                            }

                            // Restore measurement type if present
                            if (item.attributes?.measurementType) {
                                labelGraphic.attributes.measurementType = item.attributes.measurementType;
                            }

                            // Restore any other measurement-specific attributes
                            if (item.attributes?.lengthUnit) {
                                labelGraphic.attributes.lengthUnit = item.attributes.lengthUnit;
                            }
                            if (item.attributes?.areaUnit) {
                                labelGraphic.attributes.areaUnit = item.attributes.areaUnit;
                            }

                            // Find the parent graphic and re-establish the relationship
                            const parentGraphicId = labelGraphic.attributes.parentGraphicId;

                            if (parentGraphicId && restoredGraphics.has(parentGraphicId)) {
                                const parentGraphic = restoredGraphics.get(parentGraphicId);

                                // Re-establish the parent-child relationship
                                labelGraphic.measureParent = parentGraphic;

                                // Set up the measure property on the parent
                                if (!parentGraphic.measure) {
                                    parentGraphic.measure = {
                                        graphic: labelGraphic,
                                        lengthUnit: labelGraphic.attributes.lengthUnit,
                                        areaUnit: labelGraphic.attributes.areaUnit
                                    };
                                }

                                // Add to related measurement labels if needed
                                if (!parentGraphic.attributes.relatedMeasurementLabels) {
                                    parentGraphic.attributes.relatedMeasurementLabels = [];
                                }
                                parentGraphic.attributes.relatedMeasurementLabels.push(labelGraphic);

                                // Add to related segment labels if this is a segment measurement
                                if (labelGraphic.attributes.measurementType === 'segment') {
                                    if (!parentGraphic.attributes.relatedSegmentLabels) {
                                        parentGraphic.attributes.relatedSegmentLabels = [];
                                    }
                                    parentGraphic.attributes.relatedSegmentLabels.push(labelGraphic);
                                }

                                this.props.graphicsLayer.add(labelGraphic);
                                loadedLabelsCount++;
                            } else {
                                console.warn(`⚠️ Auto-skipping orphaned measurement label at index ${index} - no valid parent found`);
                            }
                        } catch (err) {
                            console.warn(`⚠️ Error restoring measurement label at index ${index} from localStorage:`, err);
                        }
                    });

                    // Finally, recreate attached buffers for graphics that had them (v1.3+ format)
                    setTimeout(() => {
                        restoredGraphics.forEach((graphic, uniqueId) => {
                            if (graphic.bufferSettings && graphic.bufferSettings.enabled) {
                                // Enhanced: Log the opacity being restored for debugging
                                const opacityInfo = graphic.bufferSettings.opacity !== undefined ?
                                    `with ${graphic.bufferSettings.opacity}% opacity` :
                                    'with default opacity';
                                //console.log(`📥 MyDrawingsPanel: Restoring buffer for graphic ${uniqueId} ${opacityInfo}`);
                                //console.log(`📥 MyDrawingsPanel: Full buffer settings:`, JSON.stringify(graphic.bufferSettings, null, 2));

                                // Pass restored=true to indicate this is a restoration
                                this.recreateAttachedBuffer(graphic, true);
                            }
                        });

                        const totalLoaded = loadedDrawingsCount + loadedBufferDrawingsCount;
                        if (totalLoaded > 0) {
                            this.refreshDrawingsFromLayer();

                            let successMessage = `✅ Successfully loaded ${loadedDrawingsCount} drawing(s)`;
                            if (loadedBufferDrawingsCount > 0) {
                                successMessage += `, ${loadedBufferDrawingsCount} buffer drawing(s)`;
                            }
                            if (loadedLabelsCount > 0) {
                                successMessage += `, ${loadedLabelsCount} measurement label(s)`;
                            }
                            if (loadedCustomizedLabelsCount > 0) {
                                successMessage += ` (${loadedCustomizedLabelsCount} customized)`;
                            }
                            if (loadedBuffersCount > 0) {
                                successMessage += `, and recreated ${loadedBuffersCount} attached buffer(s)`;
                            }
                            successMessage += ` from key: ${storageKey}`;
                            //console.log(successMessage);

                            // Trigger measurement refresh after loading
                            setTimeout(() => {
                                //console.log('📏 Triggering measurement refresh after loading from localStorage');
                                this.handleDrawingsUpdate(this.state.drawings);
                            }, 500);

                            // Additional cleanup after loading
                            setTimeout(() => {
                                //console.log('🧹 Running automatic cleanup after loading');
                                this.cleanupOrphanedMeasurementLabels();
                            }, 1000);
                        } else {
                            //console.log(`📂 No valid drawings loaded from key: ${storageKey}`);
                        }
                    }, 200);
                } else {
                    //console.log(`📂 Graphics layer is not empty; skipping load from key: ${storageKey}`);
                }
            } catch (err) {
                console.error(`❌ Error parsing drawings from localStorage key: ${storageKey}`, err);
                this.showLocalAlert('Error loading saved drawings', 'error');
            }
        };

        // Defer restore until idle if possible
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(runRestore);
        } else {
            setTimeout(runRestore, 0);
        }
    };

    saveToLocalStorage = () => {
        if (this.props.allowLocalStorage === false || this.state.consentGranted !== true) return;

        // Clear any existing timeout to debounce rapid calls
        if (this._saveToStorageTimeout) {
            clearTimeout(this._saveToStorageTimeout);
        }

        // Debounce the save operation - only save after 2 seconds of inactivity
        this._saveToStorageTimeout = setTimeout(() => {
            this.performActualSave();
        }, 2000);
    };


    showLocalAlert = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        // If parent provided a showAlert function, use it
        if (this.props.showAlert) {
            this.props.showAlert(message, type as 'success' | 'error' | 'info');
            return;
        }

        // Otherwise, use internal state
        this.setState({ alertMessage: message, alertType: type, showAlert: true });
        setTimeout(() => this.setState({ showAlert: false }), 3000);
    }

    updateSymbolWithoutClosing = (symbol: any, index: number) => {
        const drawings = [...this.state.drawings];

        // Defensive check
        if (!drawings[index]) {
            console.warn(`Drawing not found at index ${index}`);
            return;
        }

        const g = drawings[index];

        try {
            // Ensure SketchViewModel exists and targets the SAME GraphicsLayer
            const view: __esri.MapView | __esri.SceneView = (this.props as any).view || (this.props as any).mapView;
            const layer: __esri.GraphicsLayer = this.props.graphicsLayer;

            if (view && layer) {
                if (!this.sketchViewModel) {
                    this.sketchViewModel = new SketchViewModel({
                        view,
                        layer,
                        defaultUpdateOptions: { enableScaling: true, enableRotation: true }
                    });
                } else if (this.sketchViewModel.layer !== layer) {
                    this.sketchViewModel.layer = layer;
                }
                // Hard reset any stale state so update() will reliably attach handles
                this.sketchViewModel.cancel();
            }

            // --- Preserve existing arrow marker for polylines so we can restore it after color/style changes ---
            let preservedArrowMarker: any = null;
            let needsArrowColorUpdate = false;

            if (g.geometry?.type === 'polyline' && g.symbol?.type === 'simple-line') {
                const orig = g.symbol as __esri.SimpleLineSymbol;
                preservedArrowMarker = (orig as any).marker || null;
                if (preservedArrowMarker) needsArrowColorUpdate = true;
            }
            // --- END preserve ---

            // Handle polyline: enforce SimpleLineSymbol
            if (g.geometry?.type === 'polyline') {
                if (!symbol || symbol.type !== 'simple-line') {
                    symbol = new SimpleLineSymbol({
                        color: symbol?.color || [0, 0, 0, 1],
                        width: symbol?.width || 2,
                        style: symbol?.style || 'solid'
                    });
                } else {
                    symbol = symbol.clone();
                }

                // Restore arrow marker (and sync its color to the line color)
                if (preservedArrowMarker) {
                    try {
                        const updatedMarker = JSON.parse(JSON.stringify(preservedArrowMarker));
                        if (needsArrowColorUpdate) (updatedMarker as any).color = (symbol as any)?.color;
                        (symbol as any).marker = updatedMarker;
                    } catch {
                        (symbol as any).marker = {
                            type: (preservedArrowMarker as any).type,
                            style: (preservedArrowMarker as any).style,
                            placement: (preservedArrowMarker as any).placement,
                            color: needsArrowColorUpdate ? (symbol as any)?.color : (preservedArrowMarker as any).color
                        };
                    }
                }

            } else {
                // For other types, ensure we're working with a clone
                if (symbol) {
                    symbol = symbol.clone();
                }
            }

            // Handle text: ensure TextSymbol has required props
            if (symbol?.type === 'text') {
                const textSymbol = symbol as TextSymbol;

                if (!textSymbol.color) {
                    textSymbol.color = new Color([0, 0, 0, 1]);
                }

                if (!textSymbol.font) {
                    textSymbol.font = new Font({ size: 12 });
                } else {
                    // Ensure required font fields exist with a new Font object
                    textSymbol.font = new Font({
                        family: textSymbol.font.family || 'Arial',
                        size: textSymbol.font.size || 12,
                        style: textSymbol.font.style || 'normal',
                        weight: textSymbol.font.weight || 'normal',
                        decoration: textSymbol.font.decoration || 'none'
                    });
                }

                if (!textSymbol.text) {
                    textSymbol.text = g.attributes?.name || 'Label';
                }

                symbol = textSymbol;
            }

            // Apply the symbol IN PLACE (keeps instance ties)
            this.ignoreNextGraphicsUpdate = true;
            g.symbol = symbol;
            drawings[index] = g;

            // Force a visual refresh of the layer record (brief remove/add), then re-select
            if (layer) {
                layer.remove(g);
                layer.add(g);
            }

            const reselect = () => {
                if (this.sketchViewModel) {
                    try {
                        this.sketchViewModel.update([g], {
                            tool: 'transform',          // shows blue handles reliably
                            enableRotation: true,
                            enableScaling: true
                        });
                    } catch (e) {
                        console.warn('SketchViewModel.update failed to reselect graphic:', e);
                    }
                }
            };
            // Try immediately and again on next frame (covers race after remove/add)
            reselect();
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(reselect);
            } else {
                setTimeout(reselect, 0);
            }

            // Update state and persist to localStorage
            this.setState({ drawings }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(drawings);
                }
            });
        } catch (err) {
            console.error('Error updating symbol:', err);
            this.showLocalAlert('Error updating symbol', 'error');
        }
    };



    isSupportedSymbol = (symbol: any, geometryType?: string): boolean => {
        if (!symbol) return false;

        // Always consider polylines as supported, regardless of symbol type
        if (geometryType === 'polyline') {
            return true; // Allow all polyline symbols
        }

        if (geometryType === 'point') {
            return symbol.type && ['simple-marker', 'picture-marker', 'text'].includes(symbol.type);
        }
        if (geometryType === 'polygon') {
            return symbol.type === 'simple-fill';
        }
        return false;
    };

    ensureMapViewReady = async () => {
        if (!this.props.jimuMapView?.view) return false;

        try {
            // Ensure view is ready
            await this.props.jimuMapView.view.when();

            // Also ensure layer view for graphics layer is ready
            if (this.props.graphicsLayer) {
                await this.props.jimuMapView.view.whenLayerView(this.props.graphicsLayer);
            }

            return true;
        } catch (err) {
            console.warn("Error ensuring map view ready:", err);
            return false;
        }
    };

    // Methods for confirmation dialog handling
    openConfirmDialog = (message: string, type: 'delete' | 'clearAll', action: () => void, itemIndex: number = -1) => {
        this.setState({
            confirmDialogOpen: true,
            confirmDialogMessage: message,
            confirmDialogAction: action,
            confirmDialogType: type,
            confirmDialogItemIndex: itemIndex >= 0 ? itemIndex : null
        });
    }

    closeConfirmDialog = () => {
        this.setState({
            confirmDialogOpen: false,
            confirmDialogAction: null,
            confirmDialogItemIndex: null
        });
    }

    executeConfirmAction = () => {
        // Execute the stored action
        if (this.state.confirmDialogAction) {
            this.state.confirmDialogAction();
        }

        // Close the dialog
        this.closeConfirmDialog();
    }

    handleCopyDrawing = (index: number, event?: React.MouseEvent) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        // Stop event propagation if provided
        if (event) {
            event.stopPropagation();
        }

        try {
            // Get the graphic to copy
            const graphicToCopy = this.state.drawings[index];
            if (!graphicToCopy) return;

            // Clone the graphic
            const graphicJson = graphicToCopy.toJSON();
            const newGraphic = Graphic.fromJSON(graphicJson) as ExtendedGraphic;

            // Modify attributes for the new copy
            if (!newGraphic.attributes) {
                newGraphic.attributes = {};
            }

            // Generate new uniqueId
            newGraphic.attributes.uniqueId = `copy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            // Update the name to indicate it's a copy
            const originalName = graphicToCopy.attributes?.name || `Drawing ${index + 1}`;
            newGraphic.attributes.name = `Copy of ${originalName}`;

            // Update creation date to now
            newGraphic.attributes.createdDate = Date.now();

            // Mark that we're about to update the graphics layer
            this.ignoreNextGraphicsUpdate = true;

            // Add to the graphics layer
            this.props.graphicsLayer.add(newGraphic);

            // Refresh drawings from layer to update the UI
            this.refreshDrawingsFromLayer();

            // FIXED: Use the new handleDrawingsUpdate method with proper state access
            setTimeout(() => {
                //console.log('📋 Graphic copied, triggering measurement refresh');

                // Get the updated drawings from state after refresh
                // Note: We need to access the updated state, so we'll use a callback approach
                this.setState((prevState) => {
                    // Trigger the measurement update with the current drawings
                    this.handleDrawingsUpdate(prevState.drawings);
                    return prevState; // Don't actually change state, just use the callback to access current state
                });
            }, 200);

        } catch (error) {
            console.error('❌ Error copying graphic:', error);
            this.showLocalAlert('Error copying drawing', 'error');
        }
    };

    handleDeleteGraphic = (index: number, event?: React.MouseEvent) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        // Stop event propagation if provided
        if (event) {
            event.stopPropagation();
        }

        // CRITICAL: Cancel any active SketchViewModel operations IMMEDIATELY
        if (this.sketchViewModel) {
            //console.log(`🛑 Canceling SketchViewModel before deletion`);
            this.sketchViewModel.cancel();
        }

        // Set deletion flag to prevent interference
        this._isDeletingGraphic = true;

        // If confirmation is required, show the custom confirmation dialog
        if (this.props.confirmOnDelete !== false) {
            const deleteAction = () => {
                this.performDeleteGraphic(index);
            };

            this.openConfirmDialog(
                'Are you sure you want to delete this drawing?',
                'delete',
                deleteAction,
                index
            );
        } else {
            // If no confirmation needed, delete directly
            this.performDeleteGraphic(index);
        }
    }

    fixMeasurementLabelStyles = () => {
        if (!this.props.graphicsLayer) return;

        // COMPLETELY DISABLE if already run once
        if (this.measurementStylesInitialized) {
            //console.log("Measurement styling disabled - already initialized");
            return;
        }

        //console.log("Running measurement label styling ONCE ONLY");

        // Process existing measurement labels ONCE and ONLY ONCE
        const existingGraphics = this.props.graphicsLayer.graphics.toArray();
        let processedCount = 0;

        existingGraphics.forEach(graphic => {
            // Only process measurement labels that haven't been fixed yet AND need fixing
            if (graphic &&
                graphic.attributes &&
                graphic.attributes.isMeasurementLabel &&
                graphic.symbol &&
                graphic.symbol.type === 'text' &&
                !graphic.attributes._styleFixed) {

                const existingSymbol = graphic.symbol as __esri.TextSymbol;

                // Check if symbol already has proper styling - if so, don't modify it
                if (existingSymbol.color &&
                    existingSymbol.font &&
                    existingSymbol.haloColor !== undefined &&
                    existingSymbol.haloSize !== undefined) {

                    // Mark as processed but don't change the symbol
                    if (!graphic.attributes) graphic.attributes = {};
                    graphic.attributes._styleFixed = true;
                    processedCount++;
                    return;
                }

                // Only apply clean symbol if it's missing essential properties
                const labelText = graphic.symbol.text;

                // Create a minimal clean symbol preserving existing properties
                const cleanSymbol = existingSymbol.clone();

                // Only set missing properties
                if (!cleanSymbol.text) cleanSymbol.text = labelText;
                if (!cleanSymbol.color) cleanSymbol.color = new Color([0, 0, 0, 1]);

                if (!cleanSymbol.font) {
                    cleanSymbol.font = new Font({
                        family: "Arial",
                        size: 12,
                        weight: "normal",
                        style: "normal",
                        decoration: "none"
                    });
                }

                // Only set halo if it doesn't exist
                if (cleanSymbol.haloColor === null && cleanSymbol.haloSize === null) {
                    cleanSymbol.haloColor = new Color([255, 255, 255, 1]);
                    cleanSymbol.haloSize = 2;
                }

                if (!cleanSymbol.horizontalAlignment) cleanSymbol.horizontalAlignment = "center";
                if (!cleanSymbol.verticalAlignment) cleanSymbol.verticalAlignment = "middle";

                // Replace the symbol
                graphic.symbol = cleanSymbol;

                // Mark this graphic as fixed so we NEVER process it again
                if (!graphic.attributes) graphic.attributes = {};
                graphic.attributes._styleFixed = true;

                processedCount++;
            }
        });

        //console.log(`Processed ${processedCount} measurement labels - WILL NEVER RUN AGAIN`);

        // Mark as initialized so we NEVER run this again
        this.measurementStylesInitialized = true;

       //console.log("Measurement label auto-styling permanently disabled");
    };

    disableMeasurementLabelStyles = () => {
        //console.log("Measurement label styling completely disabled");
        // Do nothing - let measurement labels keep their original styles
    };

    // Modified handleClearAllClick method
    handleClearAllClick = () => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        // If confirmation is required, show the custom confirmation dialog
        if (this.props.confirmOnDelete !== false) {
            const clearAllAction = () => {
                this.performClearAll();
            };

            this.openConfirmDialog(
                'Are you sure you want to delete ALL drawings?',
                'clearAll',
                clearAllAction
            );
        } else {
            // If no confirmation needed, clear all directly
            this.performClearAll();
        }
    }

    performClearAll = () => {
        //console.log(`🗑️ Starting clear all operation for ${this.state.drawings.length} drawings`);

        // ✅ Capture original measurement state (proxy = any measurement labels present)
        this._measurementWasEnabled = false;
        try {
            if (this.props.graphicsLayer) {
                const graphics = this.props.graphicsLayer.graphics.toArray();
                this._measurementWasEnabled = graphics.some(g => g?.attributes?.isMeasurementLabel === true);
            }
        } catch (e) {
            console.warn('Could not infer measurement state from layer; defaulting to off.', e);
            this._measurementWasEnabled = false;
        }

        // 🔄 Temporarily disable measurements during bulk deletion
        if (this.props.onMeasurementSystemControl) {
            //console.log('🛑 Temporarily disabling measurements for bulk deletion');
            this.props.onMeasurementSystemControl(false);
        }

        // Set deletion flag to prevent interference
        this._isDeletingGraphic = true;

        try {
            // STEP 1: Force cancel any SketchViewModel operations
            if (this.sketchViewModel) {
                //console.log(`🛑 Canceling SketchViewModel before clearing all`);
                this.sketchViewModel.cancel();
            }

            // STEP 2: Clean up measurement labels for all drawings BEFORE clearing
            //console.log(`🧹 Cleaning up measurement labels for all drawings`);
            this.state.drawings.forEach(graphic => {
                //console.log(`🧹 Cleaning measurements for: ${graphic.attributes?.name || 'unnamed'}`);
                this.removeMeasurementLabels(graphic);
            });

            // STEP 3: Mark that we're about to update the graphics layer
            this.ignoreNextGraphicsUpdate = true;

            // STEP 4: Remove all graphics from the layer
            //console.log(`🗑️ Removing all graphics from layer`);
            this.props.graphicsLayer.removeAll();

            // STEP 5: AUTOMATIC CLEANUP after clearing all
            setTimeout(() => {
                //console.log(`🧹 Running automatic orphan cleanup after clear all`);
                this.cleanupOrphanedMeasurementLabels();
            }, 200);

            // STEP 6: Update state
            this.setState({
                drawings: [],
                selectedGraphicIndex: null,
                selectedGraphics: new Set<number>(),
                symbolEditingIndex: null
            }, () => {
                //console.log(`✅ State cleared - all drawings removed`);

                // Save to localStorage if consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // Notify parent if needed
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate([]);
                }

                // ✅ Re-enable measurements ONLY if they were originally enabled
                if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                    //console.log('🟢 Restoring measurement system (was originally ON)');
                    this.props.onMeasurementSystemControl(true);
                }

                // Clear deletion flag
                this._isDeletingGraphic = false;

                // STEP 7: Final verification
                setTimeout(() => {
                    this.verifyLayerState();
                    // Final cleanup to ensure everything is clean
                    this.cleanupOrphanedMeasurementLabels();
                }, 500);
            });

            //console.log(`✅ Clear all operation completed successfully`);

        } catch (error) {
            console.error('❌ Error clearing graphics:', error);
            this._isDeletingGraphic = false; // Always clear the flag

            // ✅ Restore measurement system ONLY if it was originally enabled
            if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                this.props.onMeasurementSystemControl(true);
            }

            this.showLocalAlert('Error clearing drawings', 'error');

            // Refresh from layer to ensure state is consistent
            //console.log(`🔄 Refreshing from layer due to error`);
            this.refreshDrawingsFromLayer();
        }
    };

    // Methods for import dialog handling
    handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        // Check file extension for user feedback
        const fileName = file.name.toLowerCase();
        const isValidFile = fileName.endsWith('.json') || fileName.endsWith('.geojson');

        if (!isValidFile) {
            this.showLocalAlert('Please select a JSON or GeoJSON file', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const content = evt.target?.result as string;

                // Validate it's JSON first before showing dialog
                JSON.parse(content); // This will throw if invalid

                // Store the file content in state and open the dialog
                this.setState({
                    importFile: file,
                    importFileContent: content,
                    importDialogOpen: true
                });
            } catch (err) {
                console.error('Error parsing file:', err);
                if (fileName.endsWith('.geojson')) {
                    this.showLocalAlert('Invalid GeoJSON file format', 'error');
                } else {
                    this.showLocalAlert('Invalid JSON file format', 'error');
                }
                // Clear the file input
                e.target.value = '';
            }
        };

        reader.onerror = () => {
            this.showLocalAlert('Error reading file', 'error');
            // Clear the file input
            e.target.value = '';
        };

        reader.readAsText(file);

        // Clear the file input after reading starts
        e.target.value = '';
    }

    closeImportDialog = () => {
        this.setState({
            importDialogOpen: false,
            importFile: null,
            importFileContent: null
        });
    }

    // Handle replacing all existing drawings
    handleImportReplace = () => {
        this.processImport(true);
    }

    // Handle adding to existing drawings
    handleImportAdd = () => {
        this.processImport(false);
    }
    // Process GeoJSON imports
    // === MyDrawingsPanel.tsx ===
    private processGeoJSONImport = async (content: string, replace: boolean) => {
        try {
            const geoJSON = JSON.parse(content);
            //console.log('Processing GeoJSON import:', geoJSON);

            if (!geoJSON.features || !Array.isArray(geoJSON.features)) {
                this.showLocalAlert('Invalid GeoJSON: no features array found', 'error');
                this.closeImportDialog();
                return;
            }

            // Optionally clear existing graphics
            this.ignoreNextGraphicsUpdate = true;
            if (replace) {
                this.props.graphicsLayer.removeAll();
            }

            let successCount = 0;
            let errorCount = 0;

            // --- 1) Separate main drawings from measurement labels (by our export flags) ---
            const allFeatures: any[] = geoJSON.features;
            const mainFeatures = allFeatures.filter(f => !f?.properties?.isMeasurementLabel);
            const labelFeatures = allFeatures.filter(f => f?.properties?.isMeasurementLabel);

            // --- 2) Import main drawings first, track them by unique id for linking ---
            const parentById: Map<string, ExtendedGraphic> = new Map();

            for (let i = 0; i < mainFeatures.length; i++) {
                try {
                    const g = await this.convertGeoJSONFeatureToGraphic(mainFeatures[i], i);
                    if (g) {
                        this.props.graphicsLayer.add(g);
                        successCount++;

                        // Record parent by the unique id we assigned during import
                        const pid = g.attributes?.uniqueId;
                        if (pid) parentById.set(pid, g);
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    console.warn(`Error importing base feature ${i}:`, err);
                    errorCount++;
                }
            }

            // --- 3) Import measurement labels and link them to parents ---
            // Your measurement code expects:
            //  - attributes.isMeasurementLabel === true
            //  - attributes.hideFromList === true (keeps labels out of list)
            //  - attributes.parentGraphicId === parent's uniqueId
            //  - For segment labels: attributes.measurementType === 'segment'
            // Then it uses these relationships to enable editing. :contentReference[oaicite:2]{index=2} (isMeasurementLabel, relatedSegmentLabels)
            const pendingOrphans: ExtendedGraphic[] = [];

            for (let j = 0; j < labelFeatures.length; j++) {
                try {
                    const f = labelFeatures[j];
                    const labelGraphic = await this.convertGeoJSONFeatureToGraphic(f, j + mainFeatures.length);
                    if (!labelGraphic) {
                        errorCount++;
                        continue;
                    }

                    const parentId = labelGraphic.attributes?.parentGraphicId;
                    const parentGraphic = parentId ? parentById.get(parentId) : undefined;

                    if (parentGraphic) {
                        // Establish the parent ↔ label linkages expected by measurement logic
                        (labelGraphic as any).measureParent = parentGraphic;

                        // Single "main" measurement label for a parent
                        if (!parentGraphic.measure && labelGraphic.attributes?.measurementType !== 'segment') {
                            parentGraphic.measure = {
                                graphic: labelGraphic,
                                lengthUnit: labelGraphic.attributes?.lengthUnit,
                                areaUnit: labelGraphic.attributes?.areaUnit
                            };
                        }

                        // Track all labels for the parent so downstream tools can find them
                        if (!parentGraphic.attributes) parentGraphic.attributes = {};
                        if (!parentGraphic.attributes.relatedMeasurementLabels) {
                            parentGraphic.attributes.relatedMeasurementLabels = [];
                        }
                        parentGraphic.attributes.relatedMeasurementLabels.push(labelGraphic);

                        // Segment labels set
                        if (labelGraphic.attributes?.measurementType === 'segment') {
                            if (!parentGraphic.attributes.relatedSegmentLabels) {
                                parentGraphic.attributes.relatedSegmentLabels = [];
                            }
                            parentGraphic.attributes.relatedSegmentLabels.push(labelGraphic);
                        }

                        this.props.graphicsLayer.add(labelGraphic);
                        successCount++;
                    } else {
                        // Parent not found (e.g., missing, filtered out): add later via proximity fallback
                        pendingOrphans.push(labelGraphic);
                    }
                } catch (err) {
                    console.warn(`Error importing label feature ${j}:`, err);
                    errorCount++;
                }
            }

            // --- 4) Best-effort fallback: if any labels didn't have a parentGraphicId match, 
            // try to associate them by proximity to nearest non-text graphic so they remain editable. ---
            if (pendingOrphans.length > 0) {
                try {
                    const allImported = this.props.graphicsLayer.graphics?.toArray?.() ?? [];
                    const parentsOnly = allImported.filter(g => g?.geometry && g?.symbol?.type !== 'text');

                    for (const orphan of pendingOrphans) {
                        let closest: ExtendedGraphic | null = null;
                        let closestDist = Infinity;

                        const lp: __esri.Point = orphan.geometry as any;
                        if (!lp) continue;

                        for (const cand of parentsOnly) {
                            const cGeom = cand.geometry;
                            const center = (cGeom?.extent?.center || cGeom) as __esri.Point;
                            if (!center) continue;

                            const dx = (lp.x as number) - (center.x as number);
                            const dy = (lp.y as number) - (center.y as number);
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < closestDist) {
                                closestDist = dist;
                                closest = cand as ExtendedGraphic;
                            }
                        }

                        if (closest) {
                            (orphan as any).measureParent = closest;

                            if (!closest.attributes) closest.attributes = {};
                            if (!closest.attributes.relatedMeasurementLabels) {
                                closest.attributes.relatedMeasurementLabels = [];
                            }
                            closest.attributes.relatedMeasurementLabels.push(orphan);

                            if (orphan.attributes?.measurementType === 'segment') {
                                if (!closest.attributes.relatedSegmentLabels) {
                                    closest.attributes.relatedSegmentLabels = [];
                                }
                                closest.attributes.relatedSegmentLabels.push(orphan);
                            } else if (!closest.measure) {
                                closest.measure = {
                                    graphic: orphan,
                                    lengthUnit: orphan.attributes?.lengthUnit,
                                    areaUnit: orphan.attributes?.areaUnit
                                };
                            }

                            this.props.graphicsLayer.add(orphan);
                            successCount++;
                        } else {
                            // As a last resort, add the label (still editable as text, but not linked)
                            this.props.graphicsLayer.add(orphan);
                            successCount++;
                            console.warn('Imported label without a resolvable parent; added unlinked.');
                        }
                    }
                } catch (e) {
                    console.warn('Proximity fallback linking failed:', e);
                }
            }

            // --- 5) Refresh UI / state after a short delay so layer mutations settle ---
            setTimeout(() => {
                try {
                    this.refreshDrawingsFromLayer();
                } catch (e) {
                    console.warn('refreshDrawingsFromLayer failed:', e);
                }

                if (successCount > 0) {
                    const message = `Successfully imported ${successCount} item(s) from GeoJSON${errorCount > 0 ? ` (${errorCount} errors)` : ''}`;
                    //console.log(message);
                    // Intentionally not showing a toast as per your comment
                    // this.showLocalAlert(message, 'success');
                }
            }, 300);

        } catch (error) {
            console.error('Error processing GeoJSON import:', error);
            this.showLocalAlert('Error importing GeoJSON file', 'error');
        }

        this.closeImportDialog();
    };

    // Convert GeoJSON feature back to ArcGIS graphic
    // === MyDrawingsPanel.tsx ===
    private convertGeoJSONFeatureToGraphic = async (feature: any, index: number): Promise<ExtendedGraphic | null> => {
        try {
            if (!feature?.geometry || !feature?.properties) {
                console.warn(`Feature ${index} missing geometry or properties`);
                return null;
            }

            // 1) Geometry
            const arcgisGeometry = await this.convertGeoJSONGeometryToArcGIS(feature.geometry);
            if (!arcgisGeometry) {
                console.warn(`Failed to convert geometry for feature ${index}`);
                return null;
            }

            // 2) Symbol
            let symbol: any;
            let textString: string | null = null; // Store text content for use in attributes

            // Helper: build TextSymbol with full styling support
            const buildTextSymbol = () => {
                // Base text & font
                textString =
                    feature.properties.text ??
                    feature.properties.textContent ??
                    'Text';

                // Text color + opacity (alpha)
                const textColor = new Color(feature.properties.text_color || '#000000');
                if (typeof feature.properties.text_opacity === 'number') {
                    // Expecting 0..1; clamp just in case
                    const a = Math.max(0, Math.min(1, feature.properties.text_opacity));
                    (textColor as any).a = a;
                }

                const font = new Font({
                    size: feature.properties.text_size || 12,
                    family: feature.properties.text_font || 'Arial',
                    weight: feature.properties.text_weight || 'normal',
                    style: feature.properties.text_style || 'normal',
                    decoration: feature.properties.text_decoration || 'none'
                });

                // Alignment & rotation
                const horizontalAlignment = feature.properties.text_align || 'center';
                const verticalAlignment = feature.properties.text_baseline || 'middle';
                const angle = typeof feature.properties.text_rotation === 'number'
                    ? feature.properties.text_rotation
                    : 0;

                // Halo (optional)
                let haloColor: Color | undefined = undefined;
                let haloSize: number | undefined = undefined;

                if (typeof feature.properties.text_halo_size === 'number') {
                    const hs = feature.properties.text_halo_size;
                    if (hs > 0) {
                        haloSize = hs;
                        const hc = new Color(feature.properties.text_halo_color || '#FFFFFF');
                        if (typeof feature.properties.text_halo_opacity === 'number') {
                            (hc as any).a = Math.max(0, Math.min(1, feature.properties.text_halo_opacity));
                        }
                        haloColor = hc;
                    } else {
                        // Explicitly no halo when size is 0
                        haloSize = 0;
                        haloColor = undefined;
                    }
                } else if (feature.properties.isMeasurementLabel) {
                    // Sensible default for measurement labels if none provided
                    haloSize = 2;
                    haloColor = new Color([255, 255, 255, 1]);
                }

                return new TextSymbol({
                    text: textString,
                    color: textColor,
                    font,
                    horizontalAlignment,
                    verticalAlignment,
                    angle,
                    haloColor,
                    haloSize
                });
            };

            const isTextLike =
                !!feature.properties.text ||
                !!feature.properties.textContent ||
                feature.properties.type === 'Text';

            if (isTextLike) {
                symbol = buildTextSymbol();
            } else {
                // Fall back to your geometry-appropriate symbol builder
                symbol = this.createSymbolFromGeoJSONProperties(
                    feature.properties,
                    feature.geometry.type
                );
            }

            // 3) Attributes (incl. measurement + buffer metadata)
            // ✅ FIX: For text graphics, use the actual text content as the name
            const defaultName = isTextLike && textString
                ? textString
                : (feature.properties.name || `Imported Drawing ${index + 1}`);

            // ✅ FIX: Handle created date properly - ensure it's a valid timestamp
            let createdDate = Date.now(); // Default to now
            if (feature.properties.created) {
                // If it's already a number, use it
                if (typeof feature.properties.created === 'number') {
                    createdDate = feature.properties.created;
                }
                // If it's a string, try to parse it
                else if (typeof feature.properties.created === 'string') {
                    const parsed = Date.parse(feature.properties.created);
                    if (!isNaN(parsed)) {
                        createdDate = parsed;
                    }
                }
            }

            const attributes: any = {
                uniqueId: feature.properties.id || `imported_geojson_${Date.now()}_${index}`,
                name: defaultName,
                createdDate: createdDate, // Now guaranteed to be a valid timestamp
                geometryType: feature.geometry.type
            };

            // Ensure unique name if not replacing
            attributes.name = this.ensureUniqueName(attributes.name);

            // Measurement label flags & metadata (so editing can recognize them)
            if (feature.properties.isMeasurementLabel) {
                attributes.isMeasurementLabel = true;
                attributes.hideFromList = true; // keep it out of "My Drawings" lists
                if (feature.properties.parentGraphicId) {
                    attributes.parentGraphicId = feature.properties.parentGraphicId;
                }
                if (feature.properties.measurementType) {
                    attributes.measurementType = feature.properties.measurementType;
                }
                if (feature.properties.lengthUnit) {
                    attributes.lengthUnit = feature.properties.lengthUnit;
                }
                if (feature.properties.areaUnit) {
                    attributes.areaUnit = feature.properties.areaUnit;
                }
                // Optional: tag as text drawMode to aid downstream logic
                attributes.drawMode = 'text';
            }

            // Buffer settings (round-trip)
            if (feature.properties.bufferDistance && feature.properties.bufferUnit) {
                const bufferSettings = {
                    distance: feature.properties.bufferDistance,
                    unit: feature.properties.bufferUnit,
                    enabled: true,
                    opacity:
                        typeof feature.properties.bufferOpacity === 'number'
                            ? feature.properties.bufferOpacity
                            : 50
                };
                attributes.bufferSettings = bufferSettings;
            }

            // 4) Build the Graphic
            const graphic = new Graphic({
                geometry: arcgisGeometry,
                symbol: symbol as any,
                attributes
            }) as ExtendedGraphic;

            // Mirror buffer settings on the graphic object if present
            if (attributes.bufferSettings) {
                graphic.bufferSettings = attributes.bufferSettings;
            }

            return graphic;
        } catch (error) {
            console.error(`Error converting GeoJSON feature ${index}:`, error);
            return null;
        }
    };

    // Convert GeoJSON geometry to ArcGIS geometry
    private convertGeoJSONGeometryToArcGIS = async (geoJsonGeometry: any): Promise<__esri.Geometry | null> => {
        try {
            const currentSR = this.props.jimuMapView?.view?.spatialReference || new SpatialReference({ wkid: 4326 });

            // First convert the GeoJSON coordinates to a temporary WGS84 geometry
            let wgs84Geometry: __esri.Geometry;
            const wgs84SR = new SpatialReference({ wkid: 4326 });

            switch (geoJsonGeometry.type) {
                case 'Point':
                    const coords = geoJsonGeometry.coordinates;
                    wgs84Geometry = new Point({
                        longitude: coords[0],
                        latitude: coords[1],
                        spatialReference: wgs84SR
                    });
                    break;

                case 'LineString':
                    wgs84Geometry = {
                        type: 'polyline',
                        paths: [geoJsonGeometry.coordinates],
                        spatialReference: wgs84SR
                    } as __esri.Polyline;
                    break;

                case 'MultiLineString':
                    wgs84Geometry = {
                        type: 'polyline',
                        paths: geoJsonGeometry.coordinates,
                        spatialReference: wgs84SR
                    } as __esri.Polyline;
                    break;

                case 'Polygon':
                    wgs84Geometry = {
                        type: 'polygon',
                        rings: geoJsonGeometry.coordinates,
                        spatialReference: wgs84SR
                    } as __esri.Polygon;
                    break;

                default:
                    console.warn(`Unsupported GeoJSON geometry type: ${geoJsonGeometry.type}`);
                    return null;
            }

            // If the map is in WGS84, return the geometry as-is
            if (currentSR.wkid === 4326) {
                return wgs84Geometry;
            }

            // Project from WGS84 to the current map spatial reference
            return await this.projectGeometryFromWGS84(wgs84Geometry, currentSR);

        } catch (error) {
            console.error('Error converting GeoJSON geometry:', error);
            return null;
        }
    };

    // Helper method to convert from WGS84 back to map projection
    private convertFromWGS84ToMapProjection = (lon: number, lat: number): { x: number; y: number } => {
        const mapSR = this.props.jimuMapView?.view?.spatialReference;

        if (!mapSR || mapSR.wkid === 4326) {
            return { x: lon, y: lat };
        }

        // Convert from WGS84 to Web Mercator
        if (mapSR.wkid === 3857 || mapSR.wkid === 102100) {
            const x = lon * 20037508.34 / 180;
            const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
            return { x, y };
        }

        // For other coordinate systems, this is a rough approximation
        // In a production environment, you'd want to use proper projection libraries
        if (mapSR.wkid >= 32601 && mapSR.wkid <= 32660) {
            // UTM North - very rough approximation
            const zone = mapSR.wkid - 32600;
            const centralMeridian = (zone - 1) * 6 - 180 + 3;
            const x = 500000 + (lon - centralMeridian) * 111320;
            const y = lat * 110540;
            return { x, y };
        }

        // For State Plane and other systems, assume direct conversion
        // This is not accurate but prevents import failures
        return { x: lon, y: lat };
    };

    // Create ArcGIS symbol from GeoJSON properties
    private createSymbolFromGeoJSONProperties = (properties: any, geometryType: string): any => {
        try {
            switch (geometryType) {
                case 'Point':
                    // Ensure marker style is valid
                    const markerStyle = properties.marker_symbol || 'circle';
                    const validMarkerStyles = ['circle', 'square', 'cross', 'x', 'diamond', 'triangle', 'path'];
                    const finalMarkerStyle = validMarkerStyles.includes(markerStyle) ? markerStyle : 'circle';

                    return new SimpleMarkerSymbol({
                        style: finalMarkerStyle,
                        size: properties.marker_size || 12,
                        color: new Color(properties.marker_color || '#000000'),
                        outline: properties.stroke ? new SimpleLineSymbol({
                            color: new Color(properties.stroke || '#000000'),
                            width: properties.stroke_width || 1
                        }) : undefined
                    });

                case 'LineString':
                case 'MultiLineString':
                    return new SimpleLineSymbol({
                        style: 'solid',
                        color: new Color(properties.stroke || '#000000'),
                        width: properties.stroke_width || 2
                    });

                case 'Polygon':
                    const fillColor = new Color(properties.fill || '#000000');
                    if (properties.fill_opacity !== undefined) {
                        fillColor.a = properties.fill_opacity;
                    }

                    return new SimpleFillSymbol({
                        style: 'solid',
                        color: fillColor,
                        outline: new SimpleLineSymbol({
                            color: new Color(properties.stroke || '#000000'),
                            width: properties.stroke_width || 1
                        })
                    });

                default:
                    // Default point symbol
                    return new SimpleMarkerSymbol({
                        style: 'circle',
                        size: 8,
                        color: new Color('#FF0000')
                    });
            }
        } catch (error) {
            console.error('Error creating symbol from properties:', error);
            // Return a default symbol
            return new SimpleMarkerSymbol({
                style: 'circle',
                size: 8,
                color: new Color('#FF0000')
            });
        }
    };

    // Process legacy JSON imports (existing functionality)
    private processLegacyImport = (content: string, replace: boolean) => {
        try {
            const parsedData = JSON.parse(content);
            //console.log('Processing legacy import:', parsedData);

            // Handle old format (array), v1.1, v1.2, and v1.3 formats
            let drawingsData = [];
            let measurementLabelsData = [];

            if (Array.isArray(parsedData)) {
                drawingsData = parsedData;
            } else if (parsedData.drawings) {
                drawingsData = parsedData.drawings || [];
                measurementLabelsData = parsedData.measurementLabels || [];
            }

            if (replace) {
                this.props.graphicsLayer.removeAll();
            }

            this.ignoreNextGraphicsUpdate = true;
            let loadedDrawingsCount = 0;
            let loadedLabelsCount = 0;
            let loadedBuffersCount = 0;
            const restoredGraphics = new Map<string, ExtendedGraphic>();

            // Restore main drawings (existing logic)
            drawingsData.forEach((item, index) => {
                try {
                    const graphic = asExtendedGraphic(Graphic.fromJSON(item));

                    if (!graphic.attributes) {
                        graphic.attributes = {};
                    }

                    if (!graphic.attributes.uniqueId) {
                        graphic.attributes.uniqueId = `imported_${Date.now()}_${index}`;
                    }

                    // Ensure name is unique
                    if (!replace) {
                        graphic.attributes.name = this.ensureUniqueName(graphic.attributes.name || `Drawing ${index + 1}`);
                    }

                    // Restore buffer settings if present
                    if (item.attributes?.bufferSettings) {
                        graphic.bufferSettings = {
                            distance: item.attributes.bufferSettings.distance,
                            unit: item.attributes.bufferSettings.unit,
                            enabled: item.attributes.bufferSettings.enabled,
                            opacity: item.attributes.bufferSettings.opacity
                        };

                        if (graphic.bufferSettings.enabled) {
                            loadedBuffersCount++;
                        } else {
                            loadedDrawingsCount++;
                        }
                    } else {
                        loadedDrawingsCount++;
                    }

                    this.props.graphicsLayer.add(graphic);
                    restoredGraphics.set(graphic.attributes.uniqueId, graphic);
                } catch (err) {
                    console.warn(`Error restoring graphic at index ${index}:`, err);
                }
            });

            // Restore measurement labels (existing logic)
            measurementLabelsData.forEach((item, index) => {
                try {
                    const labelGraphic = asExtendedGraphic(Graphic.fromJSON(item));

                    if (!labelGraphic.attributes) {
                        labelGraphic.attributes = {};
                    }

                    labelGraphic.attributes.isMeasurementLabel = true;
                    labelGraphic.attributes.hideFromList = true;

                    const parentGraphicId = labelGraphic.attributes.parentGraphicId;
                    if (parentGraphicId && restoredGraphics.has(parentGraphicId)) {
                        const parentGraphic = restoredGraphics.get(parentGraphicId);
                        labelGraphic.measureParent = parentGraphic;

                        if (!parentGraphic.measure) {
                            parentGraphic.measure = {
                                graphic: labelGraphic,
                                lengthUnit: labelGraphic.attributes.lengthUnit,
                                areaUnit: labelGraphic.attributes.areaUnit
                            };
                        }

                        this.props.graphicsLayer.add(labelGraphic);
                        loadedLabelsCount++;
                    }
                } catch (err) {
                    console.warn(`Error restoring measurement label at index ${index}:`, err);
                }
            });

            // Recreate attached buffers
            setTimeout(() => {
                restoredGraphics.forEach((graphic, uniqueId) => {
                    if (graphic.bufferSettings && graphic.bufferSettings.enabled) {
                        this.recreateAttachedBuffer(graphic, true);
                    }
                });

                const totalLoaded = loadedDrawingsCount;
                if (totalLoaded > 0) {
                    this.refreshDrawingsFromLayer();

                    let successMessage = `Successfully imported ${loadedDrawingsCount} drawing(s)`;
                    if (loadedLabelsCount > 0) {
                        successMessage += ` with ${loadedLabelsCount} measurement label(s)`;
                    }
                    if (loadedBuffersCount > 0) {
                        successMessage += ` and ${loadedBuffersCount} buffer(s)`;
                    }
                    //console.log(successMessage);
                }
            }, 200);

        } catch (error) {
            console.error('Error processing legacy import:', error);
            this.showLocalAlert('Error importing legacy JSON file', 'error');
        }

        this.closeImportDialog();
    };
    // Process the import with or without replacement
    processImport = (replace: boolean) => {
        const { importFileContent } = this.state;

        if (!importFileContent) {
            this.closeImportDialog();
            return;
        }

        try {
            const format = this.detectImportFormat(importFileContent);
            //console.log(`Detected import format: ${format}`);

            if (format === 'geojson') {
                this.processGeoJSONImport(importFileContent, replace);
            } else if (format === 'legacy') {
                this.processLegacyImport(importFileContent, replace);
            } else {
                console.error('Unknown file format');
                this.showLocalAlert('Unsupported file format. Please use GeoJSON or the original JSON format.', 'error');
                this.closeImportDialog();
                return;
            }

        } catch (err) {
            console.error('Error processing import:', err);
            this.showLocalAlert('Error processing import file', 'error');
            this.closeImportDialog();
        }
    };

    handleExport = async () => {
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        if (this.state.drawings.length === 0) {
            this.showLocalAlert('No drawings to export', 'warning');
            return;
        }

        try {
            //console.log('Starting export process');

            const exportData = await this.generateCompatibleExportData(this.state.drawings);
            //console.log('Export data generated:', exportData);

            const jsonString = JSON.stringify(exportData.geoJSONFormat, null, 2);

            const blob = new Blob([jsonString], { type: 'application/geo+json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'myDrawings.geojson';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            //console.log(`Successfully exported ${this.state.drawings.length} drawings as GeoJSON`);

        } catch (error) {
            console.error('Error exporting drawings:', error);
            this.showLocalAlert('Error exporting drawings', 'error');
        }
    };


    // Toggle selection for a specific drawing
    handleToggleSelect = (index: number, event: React.MouseEvent) => {
        // Stop propagation to prevent triggering the list item click
        event.stopPropagation();

        // Cancel any active SketchViewModel operation
        if (this.sketchViewModel) {
            this.sketchViewModel.cancel();
        }

        const { selectedGraphics } = this.state;
        const newSelected = new Set(selectedGraphics);

        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }

        // Update the checkbox selection state
        this.setState({ selectedGraphics: newSelected });

        // ADDED: If this is the only selected item, also set it as the selectedGraphicIndex for editing
        if (newSelected.size === 1 && newSelected.has(index)) {
            this.setState({ selectedGraphicIndex: index });
        }
    };

    // Select/deselect all drawings
    handleToggleSelectAll = () => {
        const { drawings, selectedGraphics } = this.state;

        // If all are selected, clear the selection
        if (selectedGraphics.size === drawings.length) {
            this.setState({
                selectedGraphics: new Set<number>(),
                symbolEditingIndex: null
            });
        } else {
            // Otherwise, select all
            const allIndices = new Set<number>(drawings.map((_, index) => index));
            this.setState({ selectedGraphics: allIndices });
        }
    }

    // Export a single drawing
    handleExportSingle = async (index: number, event: React.MouseEvent) => {
        event.stopPropagation();

        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        const graphic = this.state.drawings[index] as ExtendedGraphic;
        if (!graphic) return;

        try {
            const exportData = await this.generateCompatibleExportData([graphic]);

            const jsonString = JSON.stringify(exportData.geoJSONFormat, null, 2);

            const fileName = graphic.attributes?.name
                ? `${graphic.attributes.name.replace(/\s+/g, '_')}.geojson`
                : `drawing_${index + 1}.geojson`;

            const blob = new Blob([jsonString], { type: 'application/geo+json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            //console.log(`Successfully exported single drawing "${fileName}" as GeoJSON`);

        } catch (error) {
            console.error('Error exporting single drawing:', error);
            this.showLocalAlert('Error exporting single drawing', 'error');
        }
    };


    // 🔧 ENHANCED: Export selected drawings with buffer settings support
    handleExportSelected = async () => {
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        const { drawings, selectedGraphics } = this.state;

        if (selectedGraphics.size === 0) {
            this.showLocalAlert('No drawings selected', 'warning');
            return;
        }

        try {
            const selectedDrawings = Array.from(selectedGraphics).map(index => drawings[index]);
            const exportData = await this.generateCompatibleExportData(selectedDrawings);

            const jsonString = JSON.stringify(exportData.geoJSONFormat, null, 2);

            const blob = new Blob([jsonString], { type: 'application/geo+json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `selected_drawings_${new Date().toISOString().split('T')[0]}.geojson`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            //console.log(`Successfully exported ${selectedGraphics.size} selected drawings as GeoJSON`);

        } catch (error) {
            console.error('Error exporting selected drawings:', error);
            this.showLocalAlert('Error exporting selected drawings', 'error');
        }
    };


    // Delete selected drawings
    handleDeleteSelected = () => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        const { selectedGraphics } = this.state;

        if (selectedGraphics.size === 0) {
            this.showLocalAlert('No drawings selected', 'warning');
            return;
        }

        // If confirmation is required, show custom dialog
        if (this.props.confirmOnDelete !== false) {
            const deleteAction = () => {
                this.performDeleteSelected();
            };

            this.openConfirmDialog(
                `Are you sure you want to delete ${selectedGraphics.size} selected drawing(s)?`,
                'delete',
                deleteAction
            );
        } else {
            // If no confirmation needed, delete directly
            this.performDeleteSelected();
        }
    }

    public ingestDrawings = (incoming: any[]) => {
        // You can normalize if needed; here we just replace the list
        this.setState({
            drawings: Array.isArray(incoming) ? [...incoming] : [],
            selectedGraphicIndex: null,
            selectedGraphics: new Set<number>(),
            symbolEditingIndex: null
        });
    };

    // MyDrawingsPanel.tsx — REPLACE the whole method with this version
    performDeleteGraphic = (index: number) => {
        //console.log(`🗑️ Starting deletion of graphic at index ${index}`);

        // ✅ Capture original measurement state (proxy = any measurement labels present)
        this._measurementWasEnabled = false;
        try {
            if (this.props.graphicsLayer) {
                const graphics = this.props.graphicsLayer.graphics.toArray();
                this._measurementWasEnabled = graphics.some(g => g?.attributes?.isMeasurementLabel === true);
            }
        } catch (e) {
            console.warn('Could not infer measurement state from layer; defaulting to off.', e);
            this._measurementWasEnabled = false;
        }

        // 🔒 Temporarily disable measurements during deletion to prevent interference
        if (this.props.onMeasurementSystemControl) {
            //console.log('🛑 Temporarily disabling measurements for deletion');
            this.props.onMeasurementSystemControl(false);
        }

        // 🚩 Flag: deletion in progress (prevents listeners from reacting to our own changes)
        this._isDeletingGraphic = true;
        this.ignoreNextGraphicsUpdate = true;

        // 🎯 Target graphic
        const graphicToDelete = this.state.drawings[index];
        if (!graphicToDelete) {
            console.error(`❌ No graphic found at index ${index}`);
            this._isDeletingGraphic = false;
            this.ignoreNextGraphicsUpdate = false;

            // 🔁 Restore measurements ONLY if they were originally enabled
            if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                this.props.onMeasurementSystemControl(true);
            }
            return;
        }

        //console.log(`🎯 Target graphic:`, graphicToDelete.attributes?.name || `Drawing ${index + 1}`);

        try {
            // STEP 0: Proactively clear measurement artifacts on the target
            // (removes total/area/radius/segment labels & internal refs to avoid ghosts/races)
            try {
                this.removeMeasurementLabels(graphicToDelete);
            } catch (cleanErr) {
                console.warn('⚠️ Failed pre-clean of measurement labels before delete:', cleanErr);
            }

            // STEP 1: Ensure SketchViewModel isn't touching this graphic
            if (this.sketchViewModel) {
                //console.log(`🛑 Force canceling SketchViewModel operations`);

                const isBeingEdited = this.sketchViewModel.updateGraphics?.some(
                    g => g.attributes?.uniqueId === graphicToDelete.attributes?.uniqueId
                );

                // Always cancel to flush any latent edit handles
                this.sketchViewModel.cancel();

                // Clear any selection/editing state in our UI to prevent re-selection
                this.setState({ selectedGraphicIndex: null, symbolEditingIndex: null });

                // Wait a beat to allow SVM to fully release references
                setTimeout(() => {
                    // Continue with actual deletion once SVM is settled
                    this.continueDeleteGraphic(index, graphicToDelete);
                }, isBeingEdited ? 300 : 100);

                return; // exit; we'll resume in continueDeleteGraphic
            }

            // No SVM active → proceed immediately
            this.continueDeleteGraphic(index, graphicToDelete);

        } catch (error) {
            console.error('❌ Error starting deletion:', error);

            // Always clear flags on failure paths
            this._isDeletingGraphic = false;
            this.ignoreNextGraphicsUpdate = false;

            // 🔁 Restore measurement system ONLY if it was originally enabled
            if (this.props.onMeasurementSystemControl && this._measurementWasEnabled) {
                this.props.onMeasurementSystemControl(true);
            }

            this.showLocalAlert('Error deleting drawing', 'error');
        }
    };

    performDeleteSelected = () => {
        const { drawings, selectedGraphics } = this.state;

        if (selectedGraphics.size === 0) return;

        //console.log(`🗑️ Starting deletion of ${selectedGraphics.size} selected graphics`);

        // Set deletion flag to prevent interference
        this._isDeletingGraphic = true;

        try {
            // STEP 1: Force cancel any SketchViewModel operations
            if (this.sketchViewModel) {
                //console.log(`🛑 Canceling SketchViewModel before bulk deletion`);
                this.sketchViewModel.cancel();
            }

            // STEP 2: Clean up measurement labels for all selected drawings FIRST
            const selectedIndices = Array.from(selectedGraphics);
            //console.log(`🧹 Cleaning up measurement labels for ${selectedIndices.length} graphics`);

            selectedIndices.forEach(index => {
                const graphic = drawings[index];
                if (graphic) {
                    //console.log(`🧹 Cleaning measurements for: ${graphic.attributes?.name || `Drawing ${index + 1}`}`);
                    this.removeMeasurementLabels(graphic);
                }
            });

            // STEP 3: Remove the actual drawing graphics from the layer
            // Sort indices in descending order to avoid index shifting issues
            const sortedIndices = selectedIndices.sort((a, b) => b - a);

            //console.log(`🗑️ Removing ${sortedIndices.length} graphics from layer`);

            // Mark that we're about to update the graphics layer
            this.ignoreNextGraphicsUpdate = true;

            for (const index of sortedIndices) {
                const graphic = drawings[index];
                if (!graphic) continue;

                const uniqueId = graphic.attributes?.uniqueId;
                //console.log(`🗑️ Removing graphic: ${graphic.attributes?.name || `Drawing ${index + 1}`} (${uniqueId})`);

                if (uniqueId) {
                    // Find the exact graphic in the layer by uniqueId (more reliable)
                    const layerGraphics = this.props.graphicsLayer.graphics.toArray();
                    const targetGraphic = layerGraphics.find(g =>
                        g.attributes?.uniqueId === uniqueId &&
                        !g.attributes?.isMeasurementLabel &&
                        !g.attributes?.hideFromList
                    );

                    if (targetGraphic) {
                        this.props.graphicsLayer.remove(targetGraphic);
                        //console.log(`✅ Removed graphic with uniqueId: ${uniqueId}`);
                    } else {
                        console.warn(`⚠️ Could not find graphic with uniqueId ${uniqueId} in layer`);
                        // Fallback: try to remove by reference
                        if (this.props.graphicsLayer.graphics.includes(graphic)) {
                            this.props.graphicsLayer.remove(graphic);
                            //console.log(`✅ Removed graphic by reference fallback`);
                        }
                    }
                } else {
                    // No uniqueId, use direct reference removal
                    if (this.props.graphicsLayer.graphics.includes(graphic)) {
                        this.props.graphicsLayer.remove(graphic);
                        //console.log(`✅ Removed graphic by direct reference`);
                    }
                }
            }

            // STEP 4: AUTOMATIC CLEANUP after bulk deletion
            setTimeout(() => {
                //console.log(`🧹 Running automatic orphan cleanup after bulk deletion`);
                this.cleanupOrphanedMeasurementLabels();
            }, 300);

            // STEP 5: Update state
            const updatedDrawings = drawings.filter((_, index) => !selectedGraphics.has(index));

            //console.log(`📊 Updating state: ${drawings.length} -> ${updatedDrawings.length} drawings`);

            this.setState({
                drawings: updatedDrawings,
                selectedGraphics: new Set<number>(),
                symbolEditingIndex: null,
                selectedGraphicIndex: null
            }, () => {
                //console.log(`✅ State updated - ${updatedDrawings.length} drawings remaining`);

                // Save to localStorage if consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // Notify parent if needed
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(updatedDrawings);
                }

                // Clear deletion flag
                this._isDeletingGraphic = false;

                // STEP 6: Final verification and cleanup
                setTimeout(() => {
                    this.verifyLayerState();
                    // Run final cleanup to ensure everything is clean
                    this.cleanupOrphanedMeasurementLabels();
                }, 500);
            });

            //console.log(`✅ Bulk deletion completed successfully`);

        } catch (error) {
            console.error('❌ Error deleting selected graphics:', error);
            this._isDeletingGraphic = false; // Always clear the flag
            this.showLocalAlert('Error deleting selected drawings', 'error');

            // Refresh from layer to ensure state is consistent
            //console.log(`🔄 Refreshing from layer due to error`);
            this.refreshDrawingsFromLayer();
        }
    };

    handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        const sortOption = e.target.value as 'name' | 'type' | 'created';

        this.setState({ sortOption }, () => {
            // Sort the current drawings
            const sortedDrawings = this.sortGraphicsArray(this.state.drawings);
            this.setState({ drawings: sortedDrawings });
        });
    }

    startEditing = (index: number, event?: React.MouseEvent) => {
        // Check consent
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        // Stop event propagation if provided
        if (event) {
            event.stopPropagation();
        }

        this.setState({ editingGraphicIndex: index });
    }

    handleNameChange = (index: number, newName: string) => {
        // Debugging: Log input value to see if spaces are present
        //console.log('handleNameChange received:', newName, 'contains spaces:', newName.includes(' '));

        // Check consent
        if (this.state.consentGranted !== true) return;

        const updatedDrawings = [...this.state.drawings];
        const graphic = updatedDrawings[index];

        if (!graphic) return;

        // Ensure attributes object
        if (!graphic.attributes) {
            graphic.attributes = {};
        }

        // Update name attribute - add more debugging
        graphic.attributes.name = newName;
        //console.log('Set attributes.name to:', graphic.attributes.name);

        // REMOVED: Do not automatically update text symbol content when renaming
        // This allows users to have meaningful reference names that differ from displayed text
        // if (graphic.symbol?.type === 'text') {
        //     const textSymbol = graphic.symbol as TextSymbol;
        //     textSymbol.text = newName;
        //     //console.log('Updated text symbol to:', textSymbol.text);
        // }

        // Optional: reapply the graphic to the layer to reflect name change
        this.ignoreNextGraphicsUpdate = true;
        this.props.graphicsLayer.remove(graphic);
        this.props.graphicsLayer.add(graphic);

        // Update state and persist
        this.setState({ drawings: updatedDrawings }, () => {
            // Confirm value in the updated state
            const confirmedValue = this.state.drawings[index]?.attributes?.name;
            //console.log('Name in state after update:', confirmedValue);

            if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                this.saveToLocalStorage();
            }
        });
    };


    saveNameEdit = () => {
        // Check consent
        if (this.state.consentGranted !== true || this.state.editingGraphicIndex === null) {
            if (this.state.consentGranted !== true) {
                this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            }
            return;
        }

        try {
            // Get the updated graphic
            const graphic = this.state.drawings[this.state.editingGraphicIndex];
            if (!graphic) return;

            // Mark that we're about to update the graphics layer
            this.ignoreNextGraphicsUpdate = true;

            // Update the graphic in the layer (remove and re-add to ensure update)
            this.props.graphicsLayer.remove(graphic);
            this.props.graphicsLayer.add(graphic);

            // Exit editing mode
            this.setState({ editingGraphicIndex: null }, () => {
                // Save to localStorage if consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });

            // Don't show alert - silently update
            // this.showLocalAlert('Name updated', 'success');
        } catch (error) {
            console.error('Error saving name edit:', error);

            // We'll still show an error if something goes wrong
            this.showLocalAlert('Error updating name', 'error');

            // Exit editing mode
            this.setState({ editingGraphicIndex: null });
        }
    }

    cancelNameEdit = () => {
        this.setState({ editingGraphicIndex: null });
    }

    getDrawingTypeLabel = (graphic: ExtendedGraphic): string => {
        // Try to get the draw mode from attributes
        let drawMode = graphic.attributes?.drawMode;

        // If not found, try to get geometry type
        if (!drawMode) {
            const geomTypeAttr = graphic.attributes?.geometryType;

            if (['circle', 'rectangle', 'text'].includes(geomTypeAttr)) {
                drawMode = geomTypeAttr;
            }
            // Check if it's a text symbol
            else if (
                graphic.geometry?.type === 'point' &&
                graphic.symbol?.type === 'text'
            ) {
                drawMode = 'text';
            }
            // Otherwise, determine from geometry
            else {
                drawMode = graphic.geometry?.type;
            }
        }

        // Convert technical names to user-friendly labels
        switch (drawMode) {
            case 'point':
                return 'Point';
            case 'polyline':
                return 'Line';
            case 'polygon':
                return 'Polygon';
            case 'rectangle':
            case 'extent':
                return 'Rectangle';
            case 'circle':
                return 'Circle';
            case 'text':
                return 'Text';
            default:
                return drawMode?.charAt(0).toUpperCase() + drawMode?.slice(1) || 'Unknown';
        }
    }

    formatCreatedDate = (dateValue: number | string): string => {
        if (!dateValue) return '';

        const date = new Date(Number(dateValue));
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    openSymbolEditor = (index: number, event?: React.MouseEvent | React.KeyboardEvent) => {
        if (this.state.consentGranted !== true) {
            this.showLocalAlert('My Drawings feature requires local storage permission', 'warning');
            return;
        }

        if (event) event.stopPropagation();

        const graphic = this.state.drawings[index];
        if (!graphic) {
            console.warn(`No drawing found at index ${index}`);
            return;
        }

        // CRITICAL FIX: Store current segment label state BEFORE canceling SketchViewModel
        const graphicHadSegmentLabels = graphic.attributes?.relatedSegmentLabels &&
            graphic.attributes.relatedSegmentLabels.length > 0;

        // Cancel the current SketchViewModel operation before changing the graphic in state
        if (this.sketchViewModel) {
            this.sketchViewModel.cancel();
        }

        // CRITICAL FIX: If the graphic had segment labels, preserve them after cancel
        // The cancel operation may have cleared them, so we need to ensure they persist
        if (graphicHadSegmentLabels && this.measureRef?.current) {
            // Small delay to let cancel complete, then restore segments
            setTimeout(() => {
                // Force measurement system to recreate segments if they were removed
                if (this.measureRef?.current &&
                    (!graphic.attributes?.relatedSegmentLabels ||
                        graphic.attributes.relatedSegmentLabels.length === 0)) {
                    this.measureRef.current.updateMeasurementsForGraphic(graphic);
                }
            }, 100);
        }

        // Specifically for text symbols, initialize additional text editing state
        if (graphic.symbol?.type === 'text') {
            const textSymbol = graphic.symbol as __esri.TextSymbol;
            // Get symbol color as rgba string for the color picker
            const symbolColor = textSymbol.color ?
                this.convertColorToRgba(textSymbol.color) : 'rgba(0,0,0,1)';

            // Get halo color and settings
            const haloEnabled = textSymbol.haloSize !== null && textSymbol.haloSize > 0;
            const haloColor = textSymbol.haloColor ?
                this.convertColorToRgba(textSymbol.haloColor) : 'rgba(255,255,255,1)';
            const haloSize = textSymbol.haloSize || 1;

            // Get text alignment states
            const horizontalAlignment = textSymbol.horizontalAlignment || 'center';
            const verticalAlignment = textSymbol.verticalAlignment || 'middle';

            // Get font style settings - ensure we're getting the correct values
            const fontWeight = textSymbol.font?.weight || 'normal';
            const fontStyle = textSymbol.font?.style || 'normal';
            const fontDecoration = textSymbol.font?.decoration || 'none';
            const fontSize = textSymbol.font?.size || 12;
            const fontRotation = textSymbol.angle || 0;

            // Check if styling is active - be very explicit to ensure we set correct states
            const isBold = fontWeight === 'bold';
            const isItalic = fontStyle === 'italic';
            const isUnderline = fontDecoration === 'underline';

            // Update state with all text properties
            this.setState({
                symbolEditingIndex: index,
                textValue: textSymbol.text || '',
                // Text properties
                fontColor: symbolColor,
                fontSize: fontSize,
                fontFamily: textSymbol.font?.family || 'Arial',
                fontRotation: fontRotation,
                // Opacity values (from alpha channel)
                fontOpacity: textSymbol.color?.a || 1,
                // Halo settings
                fontHaloEnabled: haloEnabled,
                fontHaloColor: haloColor,
                fontHaloSize: haloSize,
                fontHaloOpacity: textSymbol.haloColor?.a || 1,
                // Alignment settings
                horizontalAlignment: horizontalAlignment,
                verticalAlignment: verticalAlignment,
                // Font style settings
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                fontDecoration: fontDecoration,
                // Button active states - be very explicit
                hAlignLeftActive: horizontalAlignment === 'left',
                hAlignCenterActive: horizontalAlignment === 'center',
                hAlignRightActive: horizontalAlignment === 'right',
                vAlignBaseActive: verticalAlignment === 'baseline',
                vAlignTopActive: verticalAlignment === 'top',
                vAlignMidActive: verticalAlignment === 'middle',
                vAlignBotActive: verticalAlignment === 'bottom',
                fsBoldActive: isBold,
                fsItalicActive: isItalic,
                fsUnderlineActive: isUnderline,
                // Also add these boolean state values for the actual styling
                isBold: isBold,
                isItalic: isItalic,
                isUnderline: isUnderline
            });
        } else {
            // For non-text symbols, just open the standard symbol editor
            this.setState({
                symbolEditingIndex: index,
                textValue: ''
            });
        }
    };

    applyTextChangesExplicitly = (index: number) => {
        const graphic = this.state.drawings[index];
        if (!graphic || !graphic.symbol || graphic.symbol.type !== 'text') return;

        try {
            // Clone the original symbol
            const originalSymbol = graphic.symbol as __esri.TextSymbol;
            const textSymbol = originalSymbol.clone();

            // Clone and apply font settings
            const currentFont = textSymbol.font?.clone() || new Font();
            currentFont.family = this.state.fontFamily || 'Arial';
            currentFont.size = this.state.fontSize || 12;
            currentFont.weight = this.state.isBold ? 'bold' : 'normal';
            currentFont.style = this.state.isItalic ? 'italic' : 'normal';
            currentFont.decoration = this.state.isUnderline ? 'underline' : 'none';
            textSymbol.font = currentFont;

            // Update other text properties
            textSymbol.text = this.state.textValue;
            textSymbol.color = this.hexToRgba(
                this.rgbaToHex(this.state.fontColor),
                this.state.fontOpacity
            );
            textSymbol.horizontalAlignment = this.state.horizontalAlignment || 'center';
            textSymbol.verticalAlignment = this.state.verticalAlignment || 'middle';
            textSymbol.angle = this.state.fontRotation ?? 0;

            // Halo settings
            if (this.state.fontHaloEnabled) {
                textSymbol.haloSize = this.state.fontHaloSize;
                textSymbol.haloColor = this.hexToRgba(
                    this.rgbaToHex(this.state.fontHaloColor),
                    this.state.fontHaloOpacity
                );
            } else {
                textSymbol.haloSize = 0;
                textSymbol.haloColor = null;
            }

            // Clone and update the graphic
            const updatedGraphic = graphic.clone();
            updatedGraphic.symbol = textSymbol;

            // Replace graphic in layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(graphic);

            setTimeout(() => {
                this.props.graphicsLayer.add(updatedGraphic);

                // Nudge the view to force refresh
                if (this.props.jimuMapView?.view) {
                    const currentCenter = this.props.jimuMapView.view.center.clone();
                    this.props.jimuMapView.view.goTo(currentCenter, { duration: 0 });
                }

                // Re-enable editing
                if (this.sketchViewModel?.updateGraphics) {
                    this.sketchViewModel.cancel();
                    setTimeout(() => {
                        this.sketchViewModel.update([updatedGraphic]);
                    }, 50);
                }

                // Persist to local storage
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // Clear editor state and close style editor
                this.setState({
                    symbolEditingIndex: null,
                    selectedGraphicIndex: null,
                    selectedGraphics: new Set()
                });

                //console.log('Changes applied successfully, map updated, and editor closed');
            }, 50);
        } catch (error) {
            console.error('Error applying text changes:', error);
            this.showLocalAlert('Error applying changes', 'error');
            this.setState({
                symbolEditingIndex: null,
                selectedGraphicIndex: null,
                selectedGraphics: new Set()
            });
        }
    };


    // Helper method to convert ArcGIS Color to RGBA string
    convertColorToRgba = (color: __esri.Color): string => {
        if (!color) return 'rgba(0,0,0,1)';

        // Use toRgba() if available
        if (typeof color.toRgba === 'function') {
            const rgba = color.toRgba();
            return `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`;
        }

        // Fallback in case toRgba is not available
        return `rgba(${color.r || 0},${color.g || 0},${color.b || 0},${color.a || 1})`;
    };

    // Convert rgba string to hex color
    rgbaToHex = (rgba) => {
        // Handle potential errors with rgba format
        if (!rgba || typeof rgba !== 'string') {
            return '#000000'; // Default to black
        }

        // Extract RGBA values
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) {
            return '#000000'; // Default to black if format doesn't match
        }

        // Convert to hex
        const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(match[3], 10).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    };

    // Convert hex color to rgba
    hexToRgba = (hex, alpha = 1) => {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Create RGBA color object
        return new Color([r, g, b, alpha]);
    };


    applyTextChanges = (originalGraphic: ExtendedGraphic) => {
        if (!originalGraphic || !this.props.graphicsLayer) return;

        try {
            // Create a clone of the graphic to avoid modifying shared references
            const graphic = originalGraphic.clone();

            // Apply the changes immediately to the map
            this.ignoreNextGraphicsUpdate = true;

            // First remove and then re-add the graphic to ensure the changes are visible
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // If we're in edit mode with SketchViewModel, update it too
            if (this.sketchViewModel && this.sketchViewModel.updateGraphics) {
                const isBeingEdited = this.sketchViewModel.updateGraphics.some(g =>
                    g.attributes?.uniqueId === graphic.attributes?.uniqueId
                );

                if (isBeingEdited) {
                    // Cancel current edit operation and restart with updated graphic
                    this.sketchViewModel.cancel();
                    this.sketchViewModel.update([graphic]);
                }
            }

            return graphic; // Return the new graphic for potential further use
        } catch (error) {
            console.error('Error applying text changes:', error);
            this.showLocalAlert('Error updating text', 'error');
            return null;
        }
    };

    // Update each method to call applyTextChanges after modifying the text symbol

    updateTextValue = (value: string, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Update the text symbol and attributes
            textSymbol.text = value;

            if (!graphic.attributes) {
                graphic.attributes = {};
            }
            graphic.attributes.name = value;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update component state and persist
            this.setState({ drawings, textValue: value }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // 🔄 FIXED: Call parent's onDrawingsUpdate prop
                //console.log('📝 MyDrawingsPanel: Text updated, triggering measurement refresh');
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(drawings);
                }
            });
        } catch (error) {
            console.error('Error updating text value:', error);
            this.showLocalAlert('Error updating text', 'error');
        }
    };

    updateFontSize = (size: number, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];
        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Create a new Font object with updated size
            const font = textSymbol.font ? textSymbol.font.clone() : new Font({});
            font.size = size;

            // Assign the new font to the symbol
            textSymbol.font = font;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state and persist
            this.setState({
                drawings,
                fontSize: size
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }

                // 🔄 FIXED: Call parent's onDrawingsUpdate prop to trigger measurement refresh
                //console.log('📏 MyDrawingsPanel: Font size updated, triggering measurement refresh');
                if (this.props.onDrawingsUpdate) {
                    this.props.onDrawingsUpdate(drawings);
                }
            });
        } catch (error) {
            console.error('Error updating font size:', error);
            this.showLocalAlert('Error updating text size', 'error');
        }
    };



    updateFontFamily = (family: string, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Create a new Font object with updated family
            const font = textSymbol.font ? textSymbol.font.clone() : new Font({});
            font.family = family;

            // Assign the new font to the symbol
            textSymbol.font = font;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state and persist
            this.setState({
                drawings,
                fontFamily: family
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating font family:', error);
            this.showLocalAlert('Error updating text font', 'error');
        }
    };

    updateFontColor = (color: any, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Create a new Color object to ensure no shared references
            textSymbol.color = color.clone ? color.clone() : new Color(color.toRgba ? color.toRgba() : color);

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Convert the color to rgba string for state
            const rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`;

            // Update state and persist
            this.setState({
                drawings,
                fontColor: rgba,
                fontOpacity: color.a || 1
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating font color:', error);
            this.showLocalAlert('Error updating text color', 'error');
        }
    };

    updateFontOpacity = (opacity: number, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Update opacity while preserving color
            if (textSymbol.color) {
                // Create a new Color object with the updated opacity
                const rgbaValues = textSymbol.color.toRgba ? textSymbol.color.toRgba() : [0, 0, 0, opacity];
                rgbaValues[3] = opacity; // Set alpha value
                textSymbol.color = new Color(rgbaValues);
            }

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Convert color for state
            const rgba = textSymbol.color ?
                `rgba(${textSymbol.color.r},${textSymbol.color.g},${textSymbol.color.b},${opacity})` :
                `rgba(0,0,0,${opacity})`;

            // Update state and persist
            this.setState({
                drawings,
                fontOpacity: opacity,
                fontColor: rgba
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating font opacity:', error);
            this.showLocalAlert('Error updating text opacity', 'error');
        }
    };

    updateFontRotation = (rotation: number, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Update rotation
            textSymbol.angle = rotation;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state and persist
            this.setState({
                drawings,
                fontRotation: rotation
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating font rotation:', error);
            this.showLocalAlert('Error updating text rotation', 'error');
        }
    };

    // Font style methods (bold, italic, underline)
    toggleFontStyle = (styleType: 'bold' | 'italic' | 'underline', index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];

        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Create a new Font object to avoid modifying shared references
            const font = textSymbol.font ? textSymbol.font.clone() : new Font({});

            // Update the font style based on the styleType
            switch (styleType) {
                case 'bold':
                    const isBold = font.weight !== 'bold';
                    font.weight = isBold ? 'bold' : 'normal';
                    this.setState({
                        fsBoldActive: isBold,
                        isBold: isBold
                    });
                    break;
                case 'italic':
                    const isItalic = font.style !== 'italic';
                    font.style = isItalic ? 'italic' : 'normal';
                    this.setState({
                        fsItalicActive: isItalic,
                        isItalic: isItalic
                    });
                    break;
                case 'underline':
                    const isUnderline = font.decoration !== 'underline';
                    font.decoration = isUnderline ? 'underline' : 'none';
                    this.setState({
                        fsUnderlineActive: isUnderline,
                        isUnderline: isUnderline
                    });
                    break;
            }

            // Assign the new font to the symbol
            textSymbol.font = font;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state and persist
            this.setState({ drawings }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating font style:', error);
            this.showLocalAlert('Error updating text style', 'error');
        }
    };

    // Horizontal alignment method
    updateHorizontalAlignment = (alignment: 'left' | 'center' | 'right', index: number) => {
        //console.log(`Updating horizontal alignment to ${alignment} for drawing at index ${index}`);

        // Validate inputs
        if (index === undefined || index === null) {
            console.error('Invalid index provided to updateHorizontalAlignment');
            return;
        }

        // Get a copy of the drawings array
        const drawings = [...this.state.drawings];

        // Check if the graphic exists at the given index
        if (!drawings[index]) {
            console.error(`No drawing found at index ${index}`);
            return;
        }

        const originalGraphic = drawings[index];

        // Validate the graphic has a text symbol
        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') {
            console.error('Cannot update horizontal alignment: graphic has no text symbol');
            return;
        }

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Log current state before changes
            //console.log('Current symbol state:', {
            //     horizontalAlignment: textSymbol.horizontalAlignment,
            //     text: textSymbol.text,
            //     hasSymbol: !!textSymbol
            // });


            // Update horizontal alignment
            textSymbol.horizontalAlignment = alignment;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state with new alignment and button states
            this.setState({
                drawings,
                horizontalAlignment: alignment,
                hAlignLeftActive: alignment === 'left',
                hAlignCenterActive: alignment === 'center',
                hAlignRightActive: alignment === 'right'
            }, () => {
                // Log updated state
                //console.log('Horizontal alignment updated successfully:', {
                //     alignment,
                //     buttonStates: {
                //         left: this.state.hAlignLeftActive,
                //         center: this.state.hAlignCenterActive,
                //         right: this.state.hAlignRightActive
                //     }
                // });


                // Save to localStorage if enabled and consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating horizontal alignment:', error);
            this.showLocalAlert('Error updating text alignment', 'error');
        }
    };

    // Vertical alignment method
    updateVerticalAlignment = (alignment: 'baseline' | 'top' | 'middle' | 'bottom', index: number) => {
        //console.log(`Updating vertical alignment to ${alignment} for drawing at index ${index}`);

        // Validate inputs
        if (index === undefined || index === null) {
            console.error('Invalid index provided to updateVerticalAlignment');
            return;
        }

        // Get a copy of the drawings array
        const drawings = [...this.state.drawings];

        // Check if the graphic exists at the given index
        if (!drawings[index]) {
            console.error(`No drawing found at index ${index}`);
            return;
        }

        const originalGraphic = drawings[index];

        // Validate the graphic has a text symbol
        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') {
            console.error('Cannot update vertical alignment: graphic has no text symbol');
            return;
        }

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Log current state before changes
            //console.log('Current symbol state:', {
            //     verticalAlignment: textSymbol.verticalAlignment,
            //     text: textSymbol.text,
            //     hasSymbol: !!textSymbol
            // });


            // Update vertical alignment
            textSymbol.verticalAlignment = alignment;

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state with new alignment and button states
            this.setState({
                drawings,
                verticalAlignment: alignment,
                vAlignBaseActive: alignment === 'baseline',
                vAlignTopActive: alignment === 'top',
                vAlignMidActive: alignment === 'middle',
                vAlignBotActive: alignment === 'bottom'
            }, () => {
                /*
                    // Log updated state
                    //console.log('Vertical alignment updated successfully:', {
                        alignment,
                        buttonStates: {
                            baseline: this.state.vAlignBaseActive,
                            top: this.state.vAlignTopActive,
                            middle: this.state.vAlignMidActive,
                            bottom: this.state.vAlignBotActive
                        }
                    });
                */


                // Save to localStorage if enabled and consent granted
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating vertical alignment:', error);
            this.showLocalAlert('Error updating text alignment', 'error');
        }
    };

    // Halo methods
    toggleHaloEnabled = (enabled: boolean, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];
        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            if (enabled) {
                // Enable halo with default values if not set
                textSymbol.haloSize = this.state.fontHaloSize || 1;

                // Create a new Color object for halo
                const haloColor = this.state.fontHaloColor || 'rgba(255,255,255,1)';
                const colorMatch = haloColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

                if (colorMatch) {
                    const r = parseInt(colorMatch[1], 10);
                    const g = parseInt(colorMatch[2], 10);
                    const b = parseInt(colorMatch[3], 10);
                    const a = colorMatch[4] ? parseFloat(colorMatch[4]) : 1;
                    textSymbol.haloColor = new Color([r, g, b, a]);
                } else {
                    textSymbol.haloColor = new Color([255, 255, 255, 1]);
                }
            } else {
                // Disable halo
                textSymbol.haloSize = 0;
                textSymbol.haloColor = null;
            }

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Update state and persist - remove fontHalo since it's not in your state interface
            this.setState({
                drawings,
                fontHaloEnabled: enabled
                // Remove fontHalo property since it's not in your state type
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error toggling halo:', error);
            this.showLocalAlert('Error updating text halo', 'error');
        }
    };

    updateHaloSize = (size: number, index: number) => {
        const drawings = [...this.state.drawings];
        const graphic = drawings[index];

        if (!graphic || !graphic.symbol || graphic.symbol.type !== 'text') return;

        const textSymbol = graphic.symbol as __esri.TextSymbol;

        // Update halo size
        textSymbol.haloSize = size;

        // Ensure halo color is set if size is set
        if (size > 0 && !textSymbol.haloColor) {
            textSymbol.haloColor = new Color([255, 255, 255, 1]);
        }

        // Apply changes immediately
        this.applyTextChanges(graphic);

        // Update state
        this.setState({
            drawings,
            fontHaloSize: size,
            fontHaloEnabled: size > 0
        }, () => {
            if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                this.saveToLocalStorage();
            }
        });
    };

    updateHaloColor = (color: any, index: number) => {
        const drawings = [...this.state.drawings];
        const graphic = drawings[index];

        if (!graphic || !graphic.symbol || graphic.symbol.type !== 'text') return;

        const textSymbol = graphic.symbol as __esri.TextSymbol;

        // Update halo color
        textSymbol.haloColor = color;

        // Ensure halo size is set if color is set
        if (!textSymbol.haloSize || textSymbol.haloSize <= 0) {
            textSymbol.haloSize = 1;
        }

        // Apply changes immediately
        this.applyTextChanges(graphic);

        // Convert color for state
        const rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`;

        // Update state
        this.setState({
            drawings,
            fontHaloColor: rgba,
            fontHaloOpacity: color.a || 1,
            fontHaloEnabled: true
        }, () => {
            if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                this.saveToLocalStorage();
            }
        });
    };

    updateHaloOpacity = (opacity: number, index: number) => {
        const drawings = [...this.state.drawings];
        const originalGraphic = drawings[index];
        if (!originalGraphic || !originalGraphic.symbol || originalGraphic.symbol.type !== 'text') return;

        try {
            // Clone the graphic and symbol
            const graphic = originalGraphic.clone();
            const textSymbol = graphic.symbol.clone() as __esri.TextSymbol;

            // Update opacity while preserving halo color
            if (textSymbol.haloColor) {
                // Create a new Color object with the updated opacity
                const rgbaValues = textSymbol.haloColor.toRgba ? textSymbol.haloColor.toRgba() : [255, 255, 255, opacity];
                rgbaValues[3] = opacity; // Set alpha value
                textSymbol.haloColor = new Color(rgbaValues);
            } else if (this.state.fontHaloEnabled) {
                // Create a new halo color if not present but enabled
                textSymbol.haloColor = new Color([255, 255, 255, opacity]);
            }

            // Apply the updated symbol to the graphic
            graphic.symbol = textSymbol;

            // Update in the layer
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update in state
            drawings[index] = graphic;

            // Convert color for state
            const rgba = textSymbol.haloColor ?
                `rgba(${textSymbol.haloColor.r},${textSymbol.haloColor.g},${textSymbol.haloColor.b},${opacity})` :
                `rgba(255,255,255,${opacity})`;

            // Update state and persist - removed fontHalo property to fix TypeScript error
            this.setState({
                drawings,
                fontHaloOpacity: opacity,
                fontHaloColor: rgba
                // Removed fontHalo property which is causing TS error
            }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (error) {
            console.error('Error updating halo opacity:', error);
            this.showLocalAlert('Error updating text halo opacity', 'error');
        }
    };

    closeSymbolEditor = () => {
        this.setState({ symbolEditingIndex: null });
    };

    updateSymbol = (symbol: any, index: number) => {
        // Cancel any active SketchViewModel operation
        if (this.sketchViewModel) {
            this.sketchViewModel.cancel();
        }

        const drawings = [...this.state.drawings];

        // Validate drawing index
        if (!drawings[index]) {
            console.warn(`No drawing found at index ${index} in updateSymbol`);
            return;
        }

        const originalGraphic = drawings[index];

        try {
            // Create a clone of the graphic to avoid modifying shared references
            const graphic = originalGraphic.clone();

            // Clone the incoming symbol if it exists
            let finalSymbol = symbol ? symbol.clone() : null;

            // Handle polyline: enforce SimpleLineSymbol
            if (graphic.geometry?.type === 'polyline') {
                if (!finalSymbol || finalSymbol.type !== 'simple-line') {
                    finalSymbol = new SimpleLineSymbol({
                        color: finalSymbol?.color || [0, 0, 0, 1],
                        width: finalSymbol?.width || 2,
                        style: finalSymbol?.style || 'solid'
                    });
                }
            }

            // Handle text: ensure TextSymbol has required props
            if (finalSymbol?.type === 'text') {
                const textSymbol = finalSymbol as TextSymbol;

                if (!textSymbol.color) {
                    textSymbol.color = new Color([0, 0, 0, 1]);
                }

                if (!textSymbol.font) {
                    textSymbol.font = new Font({ size: 12 });
                } else {
                    // Ensure required font fields exist with a new Font object
                    textSymbol.font = new Font({
                        family: textSymbol.font.family || 'Arial',
                        size: textSymbol.font.size || 12,
                        style: textSymbol.font.style || 'normal',
                        weight: textSymbol.font.weight || 'normal',
                        decoration: textSymbol.font.decoration || 'none'
                    });
                }

                if (!textSymbol.text) {
                    textSymbol.text = graphic.attributes?.name || 'Label';
                }

                finalSymbol = textSymbol;
            }

            // Assign the final symbol to the graphic clone
            graphic.symbol = finalSymbol;

            // Update the array in state
            drawings[index] = graphic;

            // Update the graphics layer without triggering a watch event
            this.ignoreNextGraphicsUpdate = true;
            this.props.graphicsLayer.remove(originalGraphic);
            this.props.graphicsLayer.add(graphic);

            // Update state and persist to localStorage
            this.setState({ drawings }, () => {
                if ((this.props.allowLocalStorage !== false) && this.state.consentGranted === true) {
                    this.saveToLocalStorage();
                }
            });
        } catch (err) {
            console.error('Failed to update symbol:', err);
            this.showLocalAlert('Error updating symbol', 'error');
        }
    };


    render() {
        const {
            drawings, selectedGraphicIndex, sortOption, editingGraphicIndex,
            alertMessage, alertType, showAlert, consentGranted,
            confirmDialogOpen, confirmDialogMessage, confirmDialogType,
            importDialogOpen, importFile, selectedGraphics
        } = this.state;

        const verticalMap: Record<VerticalAlign, { label: string; stateKey: keyof MyDrawingsPanelState }> = {
            top: { label: 'Top', stateKey: 'vAlignTopActive' },
            middle: { label: 'Middle', stateKey: 'vAlignMidActive' },
            bottom: { label: 'Bottom', stateKey: 'vAlignBotActive' },
            baseline: { label: 'Base', stateKey: 'vAlignBaseActive' }
        };

        // Custom styles to override any gray backgrounds
        const whiteBackgroundStyle = {
            backgroundColor: '#fff',
            boxShadow: 'none'
        };

        const storageDisclaimerContent = (
            <div
                className="p-4 text-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="storageDisclaimerTitle"
                aria-describedby="storageDisclaimerDescription"
                style={{ backgroundColor: '#fff' }}
            >
                <h5 id="storageDisclaimerTitle" className="mb-3" tabIndex={-1}>
                    Important Notice
                </h5>
                <div id="storageDisclaimerDescription">
                    <p>
                        Your drawings are saved in your web browser using local storage. This means they're only available on this device and in this browser.
                    </p>
                    <p>
                        If you clear your browser data, switch to a different browser or computer, or if the application receives an update, your drawings may be lost.
                    </p>
                    <p>
                        To keep your work safe, please use the <strong>Import</strong> and <strong>Export</strong> buttons to back up and restore your drawings.
                    </p>
                </div>
                <Button
                    type="primary"
                    title="Acknowledge this notice and continue"
                    aria-label="Acknowledge disclaimer and continue to My Drawings panel"
                    onClick={() =>
                        this.setState({ showStorageDisclaimer: false }, () => {
                            this.initializeComponents();
                            setTimeout(() => {
                                document.getElementById('drawingPanelHeader')?.focus();
                            }, 100);
                        })
                    }
                >
                    Continue
                </Button>
            </div>
        );

        // Header style with !important to override any external styles
        const headerStyle = {
            backgroundColor: '#fff !important',
            boxShadow: 'none'
        };

        // Add button styling to make them equal width

        const customCss = `
  /* Force white background on potentially gray elements */
  .my-drawings-panel,
  .my-drawings-panel h5,
  .my-drawings-panel .border-bottom,
  .my-drawings-panel > div,
  .my-drawings-panel > div > div {
      background-color: #fff !important;
  }

  .my-drawings-panel .drawing-list-container {
      overflow-y: auto !important;
  }

  /* Target panel headers that might be getting styled by the framework */
  .panel-title, 
  .panel-heading,
  .widget-title,
  .widget-heading,
  .widget-header {
      background-color: #fff !important;
  }

  /* Style the main panel header specifically */
  .my-drawings {
      background-color: #fff !important;
  }

  /* SCROLLING IMPROVEMENTS */
  .my-drawings-panel {
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      overflow: hidden !important;
  }

  .accessible-tooltip-wrapper {
    position: relative !important;
    display: inline-block !important;
  }

  .accessible-tooltip-wrapper:hover .accessible-tooltip,
  .accessible-tooltip-wrapper:focus-within .accessible-tooltip {
      visibility: visible !important;
      opacity: 1 !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip {
      visibility: hidden !important;
      opacity: 0 !important;
      position: absolute !important;
      z-index: 1000 !important;
      background-color: rgba(0, 0, 0, 0.75) !important;
      color: white !important;
      text-align: center !important;
      padding: 5px 10px !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      transition: opacity 0.2s, visibility 0.2s !important;
  }

  /* Position the tooltip */
  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="top"] {
      bottom: 100% !important;
      left: 50% !important;
      transform: translateX(-50%) translateY(-6px) !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="bottom"] {
      top: 100% !important;
      left: 50% !important;
      transform: translateX(-50%) translateY(6px) !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="left"] {
      right: 100% !important;
      top: 50% !important;
      transform: translateY(-50%) translateX(-6px) !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="right"] {
      left: 100% !important;
      top: 50% !important;
      transform: translateY(-50%) translateX(6px) !important;
  }

  /* Add arrows */
  .accessible-tooltip-wrapper .accessible-tooltip::after {
      content: "" !important;
      position: absolute !important;
      border-width: 5px !important;
      border-style: solid !important;
      border-color: transparent !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="top"]::after {
      bottom: -10px !important;
      left: 50% !important;
      margin-left: -5px !important;
      border-color: rgba(0, 0, 0, 0.75) transparent transparent transparent !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="bottom"]::after {
      top: -10px !important;
      left: 50% !important;
      margin-left: -5px !important;
      border-color: transparent transparent rgba(0, 0, 0, 0.75) transparent !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="left"]::after {
      top: 50% !important;
      right: -10px !important;
      margin-top: -5px !important;
      border-color: transparent transparent transparent rgba(0, 0, 0, 0.75) !important;
  }

  .accessible-tooltip-wrapper .accessible-tooltip[data-placement="right"]::after {
      top: 50% !important;
      left: -10px !important;
      margin-top: -5px !important;
      border-color: transparent rgba(0, 0, 0, 0.75) transparent transparent !important;
  }

  /* Main scrollable container */
  .my-drawings-panel .flex-grow-1,
  .my-drawings-panel .drawing-list-container {
      overflow-y: auto !important;
      flex: 1 1 auto !important;
      height: auto !important;
      max-height: 100% !important;
  }

  /* Ensure the top controls don't shrink */
  .my-drawings-panel .border-bottom {
      flex-shrink: 0 !important;
  }

  /* ======= IMPROVED DRAWING ITEM STYLING ======= */

  /* Drawing item container styling */
  .drawing-item {
      position: relative;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.2s ease;
  }

  /* Hover effect for drawing items */
  .drawing-item:hover {
      border-color: #c0c0c0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  }

  /* Selected item styling */
  .drawing-item.selected-drawing {
      background-color: #f0f7ff !important;
      border-color: #3b82f6 !important;
      border-width: 2px !important;
      border-style: solid !important;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15) !important;
      position: relative;
      z-index: 1;
      transition: background-color 0.2s, border-color 0.25s;
  }

  /* Add a left accent bar for selected items */
  .drawing-item.selected-drawing::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: #3b82f6;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
  }

  /* Truncate text labels to prevent overflow */
  .drawing-item .font-weight-bold,
  .drawing-item .text-muted {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  /* ======= IMPROVED BUTTON STYLING ======= */

  /* Contain buttons in a proper grid layout */
  .drawing-item .d-flex.flex-column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
  }

  /* OPTIMIZED COMPACT BUTTON LAYOUT FOR 4 BUTTONS */
  .drawing-item .button-container {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 2px !important;
      width: 100% !important;
      margin-top: 8px !important;
  }

  /* Individual button styling - optimized for 4 buttons */
  .drawing-item .btn {
      flex: 1 !important;
      min-width: 65px !important;
      padding: 4px 5px !important;
      font-size: 11px !important;
      white-space: nowrap !important;
      text-align: center !important;
      justify-content: center !important;
      display: flex !important;
      align-items: center !important;
      transition: all 0.2s !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      margin: 0 !important;
  }

  /* Ensure icons have consistent spacing */
  .drawing-item .btn i {
      margin-right: 3px !important;
      font-size: 10px !important;
  }

  /* Button hover effect */
  .drawing-item .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1;
  }

  /* Ensure button action happens on click */
  .drawing-item .btn:active {
      transform: translateY(1px);
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
  }

  /* Button colors */
  .drawing-item .btn-danger {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
  }

  .drawing-item .btn-danger:hover {
      background-color: #f1c1c7;
      border-color: #efb0b9;
  }

  /* Extra compact styling for wider screens - allow to fit 4 buttons */
  @media (min-width: 651px) {
      .drawing-item .button-container {
          gap: 3px !important;
      }
  
      .drawing-item .btn {
          min-width: 70px !important;
          padding: 4px 6px !important;
          font-size: 12px !important;
      }
  
      .drawing-item .btn i {
          margin-right: 3px !important;
          font-size: 11px !important;
      }
  }

  /* ======= TEXT STYLE EDITOR IMPROVEMENTS ======= */

  /* Text editor container */
  .text-editor {
      padding: 12px;
      border-radius: 6px;
      background-color: #f9f9f9 !important;
      border: 1px solid #e0e0e0;
      margin-top: 8px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
      width: 100%;
      overflow: hidden;
  }

  /* Form groups within text editor */
  .text-editor .form-group {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .text-editor .form-group:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
  }

  /* Form controls */
  .text-editor input,
  .text-editor select,
  .text-editor .form-control {
      max-width: 100%;
      width: 100%;
  }

  .text-editor input[type="text"],
  .text-editor input[type="number"] {
      text-overflow: ellipsis;
  }

  /* Form labels */
  .text-editor label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      font-size: 12px;
      margin-bottom: 4px;
  }

  /* Color picker and number inputs */
  .text-editor input[type="color"] {
      height: 32px;
      width: 32px;
      padding: 0;
      min-width: 32px;
  }

  .text-editor input[type="number"] {
      max-width: 80px;
  }

  /* Range sliders */
  .text-editor input[type="range"] {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      width: 100%;
  }

  /* Text style button controls */
  .text-editor .text-style-btn {
      min-width: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      margin: 0 2px;
  }

  /* Active buttons style */
  .text-editor .btn-primary.text-style-btn::after {
      content: '';
      position: absolute;
      bottom: 3px;
      left: 30%;
      width: 40%;
      height: 2px;
      background-color: white;
  }

  /* ALIGNMENT BUTTON IMPROVEMENTS */
  .text-alignment-btn {
      min-width: 0 !important; 
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      padding: 6px 4px !important;
      margin: 0 2px !important;
      overflow: hidden !important;
  }

  .text-alignment-btn .alignment-label {
      font-size: 12px !important;
      font-weight: normal !important;
      margin-bottom: 2px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      width: 100% !important;
      text-align: center !important;
  }

  .text-alignment-btn .alignment-icon {
      font-size: 8px !important;
      opacity: 0.8 !important;
  }

  .text-alignment-btn.active .alignment-label {
      font-weight: bold !important;
  }

  /* Horizontal alignment specific styles */
  .horizontal-alignment-controls {
      display: flex !important;
      justify-content: space-between !important;
      margin-bottom: 12px !important;
      width: 100% !important;
  }

  .horizontal-alignment-controls .btn-group {
      width: 100% !important;
      display: flex !important;
      gap: 2% !important;
  }

  /* Vertical alignment specific styles */
  .vertical-alignment-controls {
      display: flex !important;
      justify-content: space-between !important;
      margin-bottom: 12px !important;
      width: 100% !important;
  }

  .vertical-alignment-controls .btn-group {
      width: 100% !important;
      display: flex !important;
      gap: 2% !important;
  }

  /* Alignment buttons */
  .btn-sm.alignment-button {
      flex: 1 !important;
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      font-size: 12px !important;
      padding: 4px 2px !important;
  }

  /* Improved visual indicators for alignment states */
  .alignment-label-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
  }

  /* Button group improvements */
  .alignment-btn-group {
      display: flex !important;
      width: 100% !important;
      justify-content: space-between !important;
      gap: 2% !important;
  }

  /* Apply button styling */
  .text-editor .btn-primary {
      width: 100%;
      margin-top: 12px;
      font-weight: bold;
  }

/* ======= IMPROVED RESPONSIVE TOOLBAR STYLING ======= */

/* Enhanced responsive toolbar styling */
.my-drawings-panel .top-controls {
    display: flex !important;
    flex-direction: column !important;
    padding: 8px 8px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    background-color: #fff !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
}

/* First line container with sort, select all, and delete all */
.my-drawings-panel .toolbar-first-line {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 6px !important;
    width: 100% !important;
    margin-bottom: 6px !important;
}

/* Sort dropdown container - flexible width */
.my-drawings-panel .sort-wrapper {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    flex: 1 1 auto !important;
    min-width: 150px !important;
}

.my-drawings-panel .sort-label {
    font-size: 12px !important;
    margin: 0 !important;
    white-space: nowrap !important;
    color: #555 !important;
    flex-shrink: 0 !important;
}

.my-drawings-panel .sort-select {
    font-size: 12px !important;
    height: 28px !important;
    min-width: 80px !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    border: 1px solid #ccc !important;
    flex: 1 1 auto !important;
}

/* Override Bootstrap's form-control padding */
.my-drawings-panel .form-control-sm.sort-select {
    padding: 2px 6px !important;
    height: 28px !important;
}

/* Select All button styling - CENTERED TEXT */
.my-drawings-panel .select-all-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    gap: 4px !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
    flex: 0 0 auto !important;
    min-width: fit-content !important;
}

.my-drawings-panel .select-all-btn i {
    margin-right: 4px !important;
    font-size: 12px !important;
    flex-shrink: 0 !important;
}

.my-drawings-panel .select-all-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
}

.my-drawings-panel .select-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* When all items are selected, make it primary (blue) */
.my-drawings-panel .select-all-btn.btn-primary {
    background-color: #007bff !important;
    border-color: #007bff !important;
    color: white !important;
}

.my-drawings-panel .select-all-btn.btn-primary:hover:not(:disabled) {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
}

/* Delete All button styling - CENTERED TEXT */
.my-drawings-panel .delete-all-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    gap: 4px !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
    flex: 0 0 auto !important;
    min-width: fit-content !important;
}

.my-drawings-panel .delete-all-btn i {
    margin-right: 4px !important;
    font-size: 12px !important;
    flex-shrink: 0 !important;
}

.my-drawings-panel .delete-all-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3) !important;
}

.my-drawings-panel .delete-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Second line: Action buttons - EQUAL WIDTH & CENTERED */
.my-drawings-panel .action-buttons-wrapper {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    width: 100% !important;
}

/* Action button styling - EQUAL WIDTH and CENTERED TEXT */
.my-drawings-panel .action-btn {
    flex: 1 1 calc(25% - 5px) !important;
    min-width: 90px !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
}

.my-drawings-panel .action-btn i {
    margin-right: 4px !important;
    font-size: 12px !important;
    flex-shrink: 0 !important;
}

/* Responsive behavior for extremely narrow screens */
@media (max-width: 350px) {
    .drawing-item .button-container {
        flex-direction: column !important;
    }

    .drawing-item .btn {
        width: 100% !important;
        margin-bottom: 4px !important;
    }

    .text-editor .d-flex {
        flex-wrap: wrap;
    }

    .my-drawings-panel .toolbar-first-line {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
    }

    .my-drawings-panel .sort-wrapper,
    .my-drawings-panel .select-all-btn,
    .my-drawings-panel .delete-all-btn {
        width: 100% !important;
        flex: 1 1 100% !important;
    }

    .my-drawings-panel .select-all-btn,
    .my-drawings-panel .delete-all-btn {
        justify-content: center !important;
    }

    .my-drawings-panel .sort-select {
        flex-grow: 1 !important;
        width: 100% !important;
    }

    /* Stack action buttons vertically - FULL WIDTH */
    .my-drawings-panel .action-buttons-wrapper {
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
    }

    .my-drawings-panel .action-btn {
        width: 100% !important;
        flex: 1 1 100% !important;
        min-width: 100% !important;
        justify-content: center !important;
    }
}

/* Responsive behavior for narrow screens - 2 BUTTONS PER ROW */
@media (min-width: 351px) and (max-width: 500px) {
    .drawing-item .button-container {
        gap: 2px !important;
    }

    .drawing-item .btn {
        padding: 3px 2px !important;
        font-size: 10px !important;
        min-width: 50px !important;
    }

    .drawing-item .btn i {
        margin-right: 2px !important;
        font-size: 9px !important;
    }

    .my-drawings-panel .sort-wrapper {
        flex: 1 1 100% !important;
        min-width: 100% !important;
    }

    .my-drawings-panel .select-all-btn,
    .my-drawings-panel .delete-all-btn {
        flex: 1 1 calc(50% - 3px) !important;
    }

    /* 2 EQUAL-WIDTH action buttons per row */
    .my-drawings-panel .action-btn {
        flex: 1 1 calc(50% - 3px) !important;
        min-width: calc(50% - 3px) !important;
        padding: 5px 6px !important;
        font-size: 11px !important;
        justify-content: center !important;
    }

    .my-drawings-panel .action-btn i {
        margin-right: 3px !important;
        font-size: 10px !important;
    }
}

/* Medium screens - 2 BUTTONS PER ROW expanding to 4 */
@media (min-width: 501px) and (max-width: 650px) {
    .drawing-item .button-container {
        gap: 2px !important;
    }

    .drawing-item .btn {
        padding: 4px 3px !important;
        font-size: 11px !important;
        min-width: 60px !important;
    }

    .drawing-item .btn i {
        margin-right: 2px !important;
    }

    .my-drawings-panel .sort-wrapper {
        min-width: 140px !important;
    }

    /* 2-4 EQUAL-WIDTH buttons per row */
    .my-drawings-panel .action-btn {
        flex: 1 1 calc(50% - 3px) !important;
        min-width: 110px !important;
        padding: 5px 7px !important;
        font-size: 11px !important;
        justify-content: center !important;
    }
}

/* Large screens - 4 EQUAL-WIDTH BUTTONS IN ONE ROW */
@media (min-width: 651px) {
    .drawing-item .button-container {
        gap: 3px !important;
    }

    .drawing-item .btn {
        min-width: 70px !important;
        padding: 4px 6px !important;
        font-size: 12px !important;
    }

    .drawing-item .btn i {
        margin-right: 3px !important;
        font-size: 11px !important;
    }

    .my-drawings-panel .sort-wrapper {
        min-width: 150px !important;
        flex: 1 1 auto !important;
        max-width: 300px !important;
    }

    /* 4 EQUAL-WIDTH buttons in one row */
    .my-drawings-panel .action-btn {
        flex: 1 1 calc(25% - 5px) !important;
        min-width: 0 !important;
        padding: 5px 8px !important;
        font-size: 12px !important;
        justify-content: center !important;
    }

    .my-drawings-panel .action-btn i {
        margin-right: 4px !important;
        font-size: 11px !important;
    }
}

  /* ======= SCROLLBAR STYLING ======= */

  /* Firefox scrollbar */
  .px-3 {
      scrollbar-width: thin;
      scrollbar-color: rgba(0,0,0,0.2) transparent;
  }

  /* Chrome/Safari scrollbar */
  .px-3::-webkit-scrollbar {
      width: 6px;
  }

  .px-3::-webkit-scrollbar-track {
      background: transparent;
  }

  .px-3::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.2);
      border-radius: 3px;
  }

  /* Prevent text overflow in all text elements */
  .text-truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
  }
`;

        // Custom confirmation dialog for delete/clear
        const confirmationDialog = confirmDialogOpen && (
            <div
                className="confirmation-dialog-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmationDialogTitle"
                aria-describedby="confirmationDialogMessage"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div
                    className="confirmation-dialog"
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '4px',
                        width: '80%',
                        maxWidth: '300px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div className="confirmation-dialog-header mb-3">
                        <h5 id="confirmationDialogTitle" tabIndex={-1} className="m-0">
                            Confirm {confirmDialogType === 'delete' ? 'Delete' : 'Clear All'}
                        </h5>
                    </div>
                    <div className="confirmation-dialog-body mb-3">
                        <p id="confirmationDialogMessage" className="m-0">
                            {confirmDialogMessage}
                        </p>
                    </div>
                    <div className="confirmation-dialog-footer d-flex justify-content-end" role="group" aria-label="Confirmation options">
                        <Button
                            size="sm"
                            className="mr-2"
                            onClick={this.closeConfirmDialog}
                            title="Cancel and close the dialog"
                            aria-label="Cancel"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            type="danger"
                            onClick={this.executeConfirmAction}
                            title="Confirm and proceed"
                            aria-label="Confirm and proceed"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </div>
        );

        // Import confirmation dialog
        const importDialog = importDialogOpen && (
            <div
                className="confirmation-dialog-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="importDialogTitle"
                aria-describedby="importDialogDescription"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div
                    className="confirmation-dialog"
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '4px',
                        width: '80%',
                        maxWidth: '300px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div className="confirmation-dialog-header mb-3">
                        <h5 id="importDialogTitle" tabIndex={-1} className="m-0">
                            Import Drawings
                        </h5>
                    </div>
                    <div id="importDialogDescription" className="confirmation-dialog-body mb-3">
                        <p className="m-0">{importFile && `File: ${importFile.name}`}</p>
                        <p className="mt-2 mb-0">
                            Would you like to replace existing drawings or add to them?
                        </p>
                    </div>
                    <div className="confirmation-dialog-footer d-flex justify-content-between" role="group" aria-label="Import action options">
                        <Button
                            size="sm"
                            onClick={this.closeImportDialog}
                            title="Cancel import and close dialog"
                            aria-label="Cancel import"
                        >
                            Cancel
                        </Button>
                        <div>
                            <Button
                                size="sm"
                                className="mr-2"
                                onClick={this.handleImportAdd}
                                title="Add imported drawings to existing ones"
                                aria-label="Add drawings"
                            >
                                Add
                            </Button>
                            <Button
                                size="sm"
                                type="danger"
                                onClick={this.handleImportReplace}
                                title="Replace existing drawings with imported file"
                                aria-label="Replace drawings"
                            >
                                Replace
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );

        // Content for when local storage permission is denied
        const permissionDeniedContent = (
            <div
                className="my-drawings-panel p-3"
                role="dialog"
                aria-modal="true"
                aria-labelledby="permissionDeniedTitle"
                aria-describedby="permissionDeniedDescription"
                style={{ backgroundColor: '#fff', height: '100%', boxShadow: 'none' }}
            >
                <div className="text-center mb-4">
                    <h5 id="permissionDeniedTitle" tabIndex={-1}>
                        My Drawings Feature Unavailable
                    </h5>
                    <div id="permissionDeniedDescription">
                        <p>This feature requires local storage permission to save your drawings.</p>
                    </div>
                    <div className="mt-4">
                        <Button
                            type="primary"
                            onClick={this.handleConsentYes}
                            title="Enable local storage to use the My Drawings feature"
                            aria-label="Allow local storage permission to enable My Drawings feature"
                        >
                            Allow Local Storage Permission
                        </Button>
                    </div>
                </div>

                {showAlert && (
                    <div role="alert" aria-live="assertive">
                        <Alert
                            className={`edraw-alert edraw-alert-${alertType}`}
                            withIcon
                            open
                            type={alertType}
                            text={alertMessage}
                        />
                    </div>
                )}
            </div>
        );

        // Only show consent prompt if consent status is undecided (null)
        const showConsentPrompt = consentGranted === null;

        // Consent prompt content
        const consentPromptContent = (
            <div
                className="consent-banner border p-3 mb-2 text-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="consentPromptTitle"
                aria-describedby="consentPromptDescription"
                style={{ backgroundColor: '#fff', height: '100%', boxShadow: 'none' }}
            >
                <h5 id="consentPromptTitle" className="mb-3" tabIndex={-1}>
                    Storage Permission Required
                </h5>
                <div id="consentPromptDescription">
                    <p className="mb-3">
                        To use the My Drawings panel, you must allow saving drawings in your browser's local storage.
                    </p>
                    <p className="mb-3">
                        This allows your drawings to be remembered when you return to this page later.
                    </p>
                </div>
                <div className="d-flex justify-content-center mt-3" role="group" aria-label="Consent choices">
                    <Button
                        type="primary"
                        size="sm"
                        className="mr-3"
                        onClick={this.handleConsentYes}
                        title="Allow saving drawings to your browser"
                        aria-label="Allow saving drawings to your browser"
                    >
                        Allow Local Storage
                    </Button>
                    <Button
                        type="danger"
                        size="sm"
                        onClick={this.handleConsentNo}
                        title="Do not allow saving drawings to your browser"
                        aria-label="Do not allow saving drawings to your browser"
                    >
                        Don't Allow
                    </Button>
                </div>
            </div>
        );

        const loadPromptContent = (
            <div
                className="p-4 text-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="loadPromptTitle"
                aria-describedby="loadPromptDescription"
                style={{ backgroundColor: '#fff', height: '100%' }}
            >
                <h5 id="loadPromptTitle" className="mb-3" tabIndex={-1}>
                    Existing Drawings Found
                </h5>
                <div id="loadPromptDescription">
                    <p>You have drawings saved from a previous session.</p>
                    <p>Would you like to load your existing drawings or delete all and start new?</p>
                </div>
                <div className="d-flex justify-content-center mt-4 gap-3" role="group" aria-label="Load options">
                    <Button
                        type="primary"
                        onClick={this.handleLoadExistingDrawings}
                        className="mr-3"
                        title="Load your previously saved drawings"
                        aria-label="Load previously saved drawings"
                    >
                        Load Existing Drawings
                    </Button>
                    <Button
                        type="danger"
                        onClick={this.handleStartFresh}
                        title="Delete all saved drawings and start fresh"
                        aria-label="Delete all saved drawings and start fresh"
                    >
                        Delete All and Start New
                    </Button>
                </div>
            </div>
        );

        const mainPanelContent = (
            <div className="my-drawings-panel p-2" style={{ backgroundColor: '#fff' }}>
                {/* Top controls - compact responsive layout with accessible tooltips */}
                <div className="top-controls">
                    {/* First line: Sort, Select All, and Delete All */}
                    <div className="toolbar-first-line">
                        <div className="sort-wrapper">
                            <label
                                className="sort-label"
                                id="sort-drawings-label"
                                htmlFor="sort-select"
                                title="Sort drawings by different criteria"
                            >
                                Sort By:
                            </label>
                            <select
                                id="sort-select"
                                value={sortOption}
                                onChange={this.handleSortOptionChange}
                                className="sort-select"
                                aria-labelledby="sort-drawings-label"
                                title="Sort drawings by name, type, or creation date"
                            >
                                <option value="name">Name (A → Z)</option>
                                <option value="type">Type (A → Z)</option>
                                <option value="created">Created (Newest First)</option>
                            </select>
                        </div>

                        {/* NEW: Select All as Button */}
                        <Button
                            size="sm"
                            type={selectedGraphics.size === drawings.length && drawings.length > 0 ? "primary" : "default"}
                            onClick={this.handleToggleSelectAll}
                            disabled={drawings.length === 0}
                            className="select-all-btn"
                            aria-label={selectedGraphics.size === drawings.length && drawings.length > 0 ? "Deselect all drawings" : "Select all drawings"}
                            title={selectedGraphics.size === drawings.length && drawings.length > 0 ? "Deselect all drawings" : "Select all drawings"}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                <i className={`fas ${selectedGraphics.size === drawings.length && drawings.length > 0 ? 'fa-check-square' : 'fa-square'}`} aria-hidden="true" style={{ marginRight: '4px' }}></i>
                                {selectedGraphics.size === drawings.length && drawings.length > 0 ? 'Deselect All' : 'Select All'}
                            </span>
                        </Button>

                        {/* Delete All Button */}
                        <Button
                            size="sm"
                            type="danger"
                            onClick={this.handleClearAllClick}
                            disabled={drawings.length === 0}
                            className="delete-all-btn"
                            aria-label="Delete all drawings"
                            title="Delete all drawings"
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                <i className="fas fa-trash-alt" aria-hidden="true" style={{ marginRight: '4px' }}></i>
                                Delete All
                            </span>
                        </Button>
                    </div>

                    {/* Second line: Action buttons */}
                    <div className="toolbar-second-line">
                        <div className="action-buttons-wrapper">
                            <Button
                                size="sm"
                                onClick={() => document.getElementById('import-file').click()}
                                className="action-btn"
                                aria-label="Import drawings from file"
                                title="Import drawings from file"
                            >
                                <i className="fas fa-file-import" aria-hidden="true"></i> Import
                            </Button>

                            <Button
                                size="sm"
                                onClick={this.handleExport}
                                disabled={drawings.length === 0}
                                className="action-btn"
                                aria-label="Export all drawings"
                                title="Export all drawings"
                            >
                                <i className="fas fa-file-export" aria-hidden="true"></i> Export All
                            </Button>

                            <Button
                                size="sm"
                                onClick={this.handleExportSelected}
                                disabled={selectedGraphics.size === 0}
                                className="action-btn"
                                aria-label="Export selected drawings"
                                title="Export selected drawings"
                            >
                                <i className="fas fa-file-download" aria-hidden="true"></i> Export Selected
                            </Button>

                            <Button
                                size="sm"
                                type="danger"
                                onClick={this.handleDeleteSelected}
                                disabled={selectedGraphics.size === 0}
                                className="action-btn"
                                aria-label="Delete selected drawings"
                                title="Delete selected drawings"
                            >
                                <i className="fas fa-trash-alt" aria-hidden="true"></i> Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>

                {/* FIXED HEIGHT scrollable list - as simple as possible */}
                <div
                    className="px-3 drawing-list"
                    style={{
                        height: '500px',
                        overflowY: 'scroll',
                        backgroundColor: '#fff'
                    }}
                    role="list"
                    aria-label="Drawings list"
                >
                    {drawings.length === 0 ? (
                        <div className="text-center p-3 border rounded" style={{ backgroundColor: '#fff' }}>
                            <p className="mb-0">No drawings available. Create a drawing in the Add Drawing tab.</p>
                        </div>
                    ) : (
                        drawings.map((graphic, index) => (
                            <div
                                id={`drawing-item-${index}`}
                                key={`drawing-${graphic.attributes?.uniqueId || index}`}
                                className={`drawing-item border p-2 mb-2 rounded ${selectedGraphicIndex === index ? 'selected-drawing' : ''}`}
                                onClick={() => this.handleListItemClick(graphic, index)}
                                role="listitem"
                                aria-selected={selectedGraphicIndex === index}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        this.handleListItemClick(graphic, index);
                                    }
                                }}
                            >
                                <div className="d-flex">
                                    {/* Content area */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className='d-flex'>
                                            {/* Checkbox for multi-select */}
                                            <label className="d-flex align-items-start mr-3 mt-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input mr-2 mt-1"
                                                    checked={selectedGraphics.has(index)}
                                                    onClick={(e) => this.handleToggleSelect(index, e)}
                                                    aria-label={`Select drawing: ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                    title={`Select ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                    id={`checkbox-drawing-${index}`}
                                                />
                                                <span className="sr-only">
                                                    Select {graphic.attributes?.name || `Drawing ${index + 1}`}
                                                </span>
                                            </label>
                                            {/* Name or inline rename input */}
                                            <div>
                                                {editingGraphicIndex === index ? (
                                                    <div className="form-group" onClick={(e) => e.stopPropagation()}>
                                                        <label htmlFor={`edit-name-input-${index}`} className="sr-only">Edit drawing name</label>
                                                        <input
                                                            id={`edit-name-input-${index}`}
                                                            type="text"
                                                            className="form-control mb-2 drawing-name-input"
                                                            value={graphic.attributes?.name || ''}
                                                            onChange={(e) => {
                                                                // Preserve the value exactly as typed, including spaces
                                                                const inputValue = e.target.value;
                                                                this.handleNameChange(index, inputValue);
                                                            }}
                                                            onBlur={this.saveNameEdit}
                                                            onKeyDown={(e) => {
                                                                // Prevent event from bubbling up to parent elements that might interfere
                                                                e.stopPropagation();

                                                                if (e.key === 'Enter') {
                                                                    this.saveNameEdit();
                                                                }
                                                            }}
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                            // Disable any browser features that might interfere with spaces
                                                            spellCheck="false"
                                                            autoComplete="off"
                                                            autoCorrect="off"
                                                            aria-label="Edit drawing name"
                                                            title="Edit drawing name"
                                                            // Add inline styles to ensure spaces are preserved
                                                            style={{
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'normal',
                                                                wordSpacing: 'normal',
                                                                textTransform: 'none'
                                                            }}
                                                        />
                                                        {/* Add save/cancel buttons for better UX */}
                                                        <div className="d-flex mt-1">
                                                            <Button
                                                                size="sm"
                                                                className="mr-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    this.saveNameEdit();
                                                                }}
                                                                title="Save name"
                                                                aria-label="Save drawing name"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    this.cancelNameEdit();
                                                                }}
                                                                title="Cancel editing"
                                                                aria-label="Cancel name editing"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="font-weight-bold text-truncate">
                                                            {graphic.attributes?.name || `Drawing ${index + 1}`}
                                                        </div>
                                                        <div className="text-muted small mb-2 text-truncate">
                                                            Type: {this.getDrawingTypeLabel(graphic)}
                                                            {graphic.attributes?.createdDate && ` • Created: ${this.formatCreatedDate(graphic.attributes.createdDate)}`}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="button-container drawToolbarDiv">
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleCopyDrawing(index, e);
                                                }}
                                                className="btn-light"
                                                aria-label={`Copy ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                title="Create a copy of this drawing"
                                            >
                                                <i className="fas fa-copy" aria-hidden="true"></i> Copy
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.startEditing(index, e);
                                                }}
                                                className="btn-light"
                                                aria-label={`Rename ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                title="Rename this drawing"
                                            >
                                                <i className="fas fa-pencil-alt" aria-hidden="true"></i> Rename
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleExportSingle(index, e);
                                                }}
                                                className="btn-light"
                                                aria-label={`Download ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                title="Download this drawing as a file"
                                            >
                                                <i className="fas fa-download" aria-hidden="true"></i> Download
                                            </Button>

                                            <Button
                                                size="sm"
                                                type="danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleDeleteGraphic(index, e);
                                                }}
                                                aria-label={`Delete ${graphic.attributes?.name || `Drawing ${index + 1}`}`}
                                                title="Delete this drawing"
                                            >
                                                <i className="fas fa-trash-alt" aria-hidden="true"></i> Delete
                                            </Button>
                                        </div>
                                        {/* Style Editor (SymbolSelector or TextStyleEditor) */}
                                        {selectedGraphicIndex === index && (
                                            <div
                                                className="mt-3 border"
                                                onClick={(e) => e.stopPropagation()}
                                                role="region"
                                                aria-label="Style editor"
                                            >
                                                {this.isSupportedSymbol(graphic.symbol, graphic.geometry?.type) ? (
                                                    (graphic.symbol as any)?.type === 'text' ? (
                                                        <>
                                                            {graphic && (graphic.symbol as any)?.type === 'text' && (
                                                                <>
                                                                    {/* //console.log("🧩 Opening TextStyleEditor with graphic:", graphic) */}
                                                                    {/* //console.log("🔤 graphic.symbol.text:", (graphic.symbol as TextSymbol)?.text) */}
                                                                    {/* //console.log("📦 Is TextSymbol:", graphic.symbol instanceof TextSymbol) */}
                                                                </>
                                                            )}
                                                            <TextStyleEditor
                                                                currentTextSymbol={this.state.currentTextSymbol}
                                                                graphic={graphic}
                                                                updateSymbol={(sym) => this.updateSymbolWithoutClosing(sym, index)}
                                                                show={true}
                                                                onClose={() => {
                                                                    this.setState({ selectedGraphicIndex: null, selectedGraphics: new Set() });
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <SymbolSelector
                                                            symbol={graphic.symbol as any}
                                                            jimuSymbolType={
                                                                graphic.geometry?.type === 'point'
                                                                    ? JimuSymbolType.Point
                                                                    : graphic.geometry?.type === 'polyline'
                                                                        ? JimuSymbolType.Polyline
                                                                        : JimuSymbolType.Polygon
                                                            }
                                                            onPointSymbolChanged={(sym) => this.updateSymbolWithoutClosing(sym, index)}
                                                            onPolylineSymbolChanged={(sym) => this.updateSymbolWithoutClosing(sym, index)}
                                                            onPolygonSymbolChanged={(sym) => this.updateSymbolWithoutClosing(sym, index)}
                                                        />
                                                    )
                                                ) : (
                                                    <div className="text-muted">This symbol type is not supported for style editing.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Hidden file input for import */}
                <input
                    type="file"
                    id="import-file"
                    accept=".json,.geojson,application/json,application/geo+json"
                    onChange={this.handleImport}
                    style={{ display: 'none' }}
                />
            </div>
        );

        return (
            <div
                className="my-drawings-panel p-2"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    ...whiteBackgroundStyle
                }}
            >
                {/* Screen reader alert area */}
                {showAlert && (
                    <div role="alert" aria-live="assertive">
                        <Alert
                            className={`edraw-alert edraw-alert-${alertType}`}
                            withIcon
                            open
                            type={alertType}
                            text={alertMessage}
                        />
                    </div>
                )}

                {/* Accessible dialogs */}
                {confirmationDialog && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmationDialogTitle"
                        aria-describedby="confirmationDialogDescription"
                    >
                        {confirmationDialog}
                    </div>
                )}

                {importDialog && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="importDialogTitle"
                        aria-describedby="importDialogDescription"
                    >
                        {importDialog}
                    </div>
                )}

                {/* FIXED: Conditional rendering with proper order and focus management */}
                {/* 1. First check if consent is needed */}
                {showConsentPrompt ? (
                    <div>{consentPromptContent}</div>
                ) : consentGranted === false ? (
                    <div>{permissionDeniedContent}</div>
                ) : this.state.showLoadPrompt ? (
                    /* 3. Then load prompt - THIS IS NOW IN THE CORRECT ORDER */
                    <div>{loadPromptContent}</div>
                ) : this.state.showStorageDisclaimer ? (
                    /* 2. Then storage disclaimer */
                    <div
                        className="p-4 text-center"
                        style={{ backgroundColor: '#fff' }}
                        role="region"
                        aria-labelledby="storageDisclaimerTitle"
                    >
                        <h5 id="storageDisclaimerTitle" className="mb-3" tabIndex={-1}>
                            Important Notice
                        </h5>
                        <p id="storageDisclaimerDescription">
                            Your drawings are saved in your web browser using local storage. This means they're only available on this device and in this browser.
                        </p>
                        <p>
                            If you clear your browser data, switch to a different browser or computer, or if the application receives an update, your drawings may be lost.
                        </p>
                        <p>
                            To keep your work safe, please use the <strong>Import</strong> and <strong>Export</strong> buttons to back up and restore your drawings.
                        </p>
                        <Button
                            type="primary"
                            title="Acknowledge this notice and continue"
                            aria-label="Continue to drawing panel"
                            onClick={() =>
                                this.setState({ showStorageDisclaimer: false }, () => {
                                    this.initializeComponents();
                                    setTimeout(() => {
                                        const el = document.getElementById('drawingPanelHeader');
                                        el?.focus();
                                    }, 100); // Ensure DOM is ready
                                })
                            }
                        >
                            Continue
                        </Button>
                    </div>
                ) : (
                    /* 4. Finally the main panel */
                    <div role="region" aria-labelledby="drawingPanelHeader">
                        <h2 id="drawingPanelHeader" tabIndex={-1} className="sr-only">
                            Drawing Panel
                        </h2>
                        {mainPanelContent}
                    </div>
                )}

                {/* Add a style tag with our CSS overrides */}
                <style dangerouslySetInnerHTML={{ __html: customCss }} />
            </div>
        );
    }
}

export default MyDrawingsPanel;