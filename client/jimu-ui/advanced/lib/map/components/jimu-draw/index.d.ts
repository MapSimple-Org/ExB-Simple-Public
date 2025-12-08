/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuDrawProps } from './contexts-bridge';
import { Arrangement } from './components/layouts';
import { JimuDrawCreationMode, DrawingElevationMode3D, SnappingMode } from './components/sketch';
import type { JimuDrawingOptions, JimuDrawCreatedDescriptor, DrawingUpdatedDescriptor, JimuDrawVisibleElements, DrawOptionsInfo } from './components/sketch';
import { useMeasurementsUnitsInfos } from './components/measurements';
import type { MeasurementsUnitsInfo, MeasurementsPropsInfo, MDecimalPlaces } from './components/measurements';
export { type JimuDrawProps, type JimuDrawingOptions, JimuDrawCreationMode, Arrangement, DrawingElevationMode3D, type JimuDrawVisibleElements, type JimuDrawCreatedDescriptor, type DrawingUpdatedDescriptor, type DrawOptionsInfo, SnappingMode, useMeasurementsUnitsInfos, type MDecimalPlaces };
export type { MeasurementsPropsInfo, MeasurementsUnitsInfo };
export declare const JimuDraw: React.MemoExoticComponent<(props: JimuDrawProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
