import type { ThemeArcGIS, ThemeComponents } from 'jimu-core';
import type { ThemeVariable } from '../type';
export declare const createComponentsVariables: (theme: ThemeVariable, override?: ThemeComponents) => ThemeComponents;
export declare const createArcGISVariables: (theme: ThemeVariable, components: ThemeComponents, override?: ThemeArcGIS) => ThemeArcGIS;
