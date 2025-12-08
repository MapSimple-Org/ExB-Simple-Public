import { React, type ImmutableObject } from 'jimu-core';
import 'arcgis-charts-components';
import type { WebChart, ArcgisChartProps } from 'arcgis-charts-components';
export interface ChartProps extends Omit<ArcgisChartProps, 'model' | 'className'> {
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * ArcGIS Chart Specification that defines the chart component
     */
    config?: WebChart | ImmutableObject<WebChart>;
}
export declare const Chart: React.NamedExoticComponent<Omit<ChartProps, "ref"> & React.RefAttributes<globalThis.HTMLArcgisChartElement>>;
export * from './utils';
export type * from 'arcgis-charts-components';
