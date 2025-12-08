import { type ImmutableArray } from 'jimu-core';
import type { JimuMapView } from '../views/jimu-map-view';
import type { AdvancedSelectItem } from 'jimu-ui';
export declare function getAllSnappingLayerItems(jimuMapViews: JimuMapView[]): AdvancedSelectItem[];
export declare const getSnappingFeatureSourcesCollection: (jimuMapView: JimuMapView, defaultSnapLayers: ImmutableArray<string>) => Promise<__esri.Collection<any>>;
export declare const useGetTipsForSnappingOptions: (jimuUiDefaultMessages: any, jimuCoreDefaultMessages: any) => import("@emotion/react/jsx-runtime").JSX.Element;
