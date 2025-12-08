import { React } from 'jimu-core';
export type Record = __esri.Graphic[];
export interface GraphicsUndoRedoStates {
    _MAX_RECORDS_NUM: number;
    _currentIdx: number;
    _graphicsRecords: [Record];
    currentRecord: Record;
    version: number;
    canUndo: boolean;
    canRedo: boolean;
    canClear: boolean;
}
export declare const actionType: {
    Undo: string;
    Redo: string;
    Clear: string;
    PushRecord: string;
};
export declare const UndoAction: () => {
    type: string;
};
export declare const RedoAction: () => {
    type: string;
};
export declare const ClearAction: () => {
    type: string;
};
export declare const PushRecordAction: (record: Record) => {
    type: string;
    payload: Record;
};
export declare const init: (initStates?: GraphicsUndoRedoStates) => GraphicsUndoRedoStates;
export declare const pushRecord: (record: Record, state: GraphicsUndoRedoStates) => {
    _graphicsRecords: [Record];
    _currentIdx: number;
    currentRecord: Record;
    canUndo: boolean;
    canRedo: boolean;
    canClear: boolean;
    _MAX_RECORDS_NUM: number;
    version: number;
};
export declare const reducer: (state: GraphicsUndoRedoStates, action: any) => {
    _graphicsRecords: [Record];
    _currentIdx: number;
    currentRecord: Record;
    canUndo: boolean;
    canRedo: boolean;
    canClear: boolean;
    _MAX_RECORDS_NUM: number;
    version: number;
};
export declare const GraphicsUndoRedoReducerContext: React.Context<any>;
export declare const GraphicsUndoRedoContextProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
