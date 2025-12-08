/** @jsx jsx */
import { React } from 'jimu-core';
export interface ProjectionTools {
    project: (geometries: __esri.Geometry[]) => Promise<__esri.Geometry[]>;
}
export interface Props {
    onLoad: (projectionTools: ProjectionTools) => void;
}
export declare const ProjectionConverterProvider: React.MemoExoticComponent<(props: Props) => any>;
