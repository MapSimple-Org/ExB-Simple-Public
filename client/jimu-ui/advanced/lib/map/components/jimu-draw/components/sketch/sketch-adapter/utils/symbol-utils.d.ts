import { JimuSymbolType, type JimuSymbol } from '../../../../../../';
import { CreateToolActions } from '..';
import type { JimuSymbolsGroup } from '../..';
export declare const setCurrentSymbolToSketch: (currentActiveTool: CreateToolActions, newActiveTool: CreateToolActions, sketch: __esri.Sketch, currentSymbols: JimuSymbolsGroup) => void;
export declare const getCurrentSymbol: (newActiveTool: CreateToolActions, currentSymbols: JimuSymbolsGroup, getDefaultSymbol: any) => JimuSymbol;
export declare const getSymbolTypeByActiveTool: (newActiveTool: CreateToolActions) => JimuSymbolType;
