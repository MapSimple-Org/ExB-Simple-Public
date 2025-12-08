/** @jsx jsx */
import { React } from 'jimu-core';
export interface GraphicsUndoRedoProps {
    sketchContextStates: any;
    dispatchSketchActions: any;
    graphicsUndoRedoContextStates: any;
    dispatchGraphicsUndoRedoActions: any;
}
export declare const GraphicsUndoRedo: React.MemoExoticComponent<(props: GraphicsUndoRedoProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
