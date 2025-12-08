import { CreateToolActions } from '..';
import { JimuSymbolType } from '../../../../../../';
export declare const setAttrJimuDrawId: (graphics: __esri.Graphic[], forceUpgrade?: boolean) => void;
export declare const getAttrJimuDrawId: (graphic: __esri.Graphic) => number;
export declare const getAttrJimuDrawIds: (graphics: __esri.Graphic[]) => number[];
export declare const clearGraphics: (layer: any) => void;
export declare const getSymbolModeBySymbol: (symbol: any) => JimuSymbolType;
export declare const areGraphicsSameType: (graphics: __esri.Graphic[]) => boolean;
export declare const getEditGraphicType: (graphic: __esri.Graphic) => CreateToolActions;
