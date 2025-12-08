import { React } from 'jimu-core';
import { TreeSelectionStyle } from './tree-types';
export declare const TreeContext: React.Context<{
    isTree: boolean;
    uuid: string;
    selectionStyle: TreeSelectionStyle;
    multiLevel: boolean;
    isRTL: boolean;
}>;
