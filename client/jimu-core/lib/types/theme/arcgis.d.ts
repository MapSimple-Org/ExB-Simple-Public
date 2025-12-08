import type { BorderStyle } from 'jimu-ui';
import type { Color, ThemeBoxStyles, ThemeBoxStylesByState } from './common';
import type { ThemeButtonStylesByState, ThemeInput } from './components';
export interface ThemeArcGISButton {
    variants?: {
        default?: ThemeButtonStylesByState;
        secondary?: ThemeButtonStylesByState;
        tertiary?: ThemeButtonStylesByState;
    };
}
export interface ThemeArcGISInput extends ThemeInput {
}
export interface ThemeArcGISMenu extends ThemeBoxStyles {
    item?: ThemeButtonStylesByState;
}
export interface ThemeArcGISPanel extends ThemeBoxStyles {
}
export interface ThemeArcGISTable {
    root: ThemeBoxStyles;
    alterRowBg?: Color;
}
export interface ThemeArcGISUpdatingIndicator {
    bg?: Color;
    progress?: Color;
}
export interface ThemeArcGISLayerList {
    root?: ThemeBoxStyles;
    item?: ThemeBoxStylesByState;
    actionsList?: {
        root?: ThemeBoxStyles;
        item?: ThemeBoxStylesByState;
        separator?: BorderStyle;
    };
    icon?: ThemeBoxStylesByState;
}
export interface ThemeArcGISLayerLegend {
    variants?: {
        default?: {
            root?: ThemeBoxStyles;
        };
        card?: {
            root?: ThemeBoxStyles;
            carousel?: ThemeBoxStyles;
            caption?: ThemeBoxStyles;
        };
    };
}
export interface ThemeArcGISBasemapGallery {
    root?: ThemeBoxStyles;
    item?: ThemeBoxStylesByState;
}
export interface ThemeArcGISMeasure {
    root?: ThemeBoxStyles;
    measurement?: {
        bg?: Color;
        valueColor?: Color;
        disabledColor?: Color;
    };
}
export interface ThemeArcGISComponents {
    button?: ThemeArcGISButton;
    input?: ThemeArcGISInput;
    menu?: ThemeArcGISMenu;
    panel?: ThemeArcGISPanel;
    table?: ThemeArcGISTable;
    updatingIndicator?: ThemeArcGISUpdatingIndicator;
}
export interface ThemeArcGISWidgets {
    layerlist?: ThemeArcGISLayerList;
    legend?: ThemeArcGISLayerLegend;
    basemapGallery?: ThemeArcGISBasemapGallery;
    measure?: ThemeArcGISMeasure;
}
export interface ThemeArcGIS {
    boxShadow?: string;
    components?: ThemeArcGISComponents;
    widgets?: ThemeArcGISWidgets;
}
