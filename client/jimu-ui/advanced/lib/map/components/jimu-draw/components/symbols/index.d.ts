/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuSymbol, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol } from '../../../../';
import type { JimuMapView } from 'jimu-arcgis';
import { Arrangement } from '../layouts/constraints';
export type { JimuSymbol, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol };
export interface Props {
    jimuMapView: JimuMapView;
    isShow: boolean;
    isAutoWidth?: boolean;
    sketchContainer?: HTMLElement;
    arrangement?: Arrangement;
    onA11yFocus?: () => void;
    isCustomEditingFlag: boolean;
}
export declare const SymbolListWithMeasurements: React.MemoExoticComponent<(props: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
