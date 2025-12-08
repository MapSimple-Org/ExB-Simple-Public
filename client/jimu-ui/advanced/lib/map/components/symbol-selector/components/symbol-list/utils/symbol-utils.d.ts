import type { JimuSymbol } from '../index';
export declare const preserveDecimalPlaces: (num: number, decimalPlaces: number) => number;
export declare const convertSymbolColorToColorPickerValue: (symbolColor: __esri.Color) => string;
export declare const getOpacityInSymbol: (symbol: JimuSymbol) => number;
export declare const formatI18nOpacityPctInfo: (nls: string, opacity: string) => string;
export declare const rgbaToTextSymbolColor: (esriColor: __esri.Color) => number[];
export declare const textSymbolColorToRgba: (symbolColors: number[]) => number[];
export declare const getFontFamilyStr: (symbolJson: any) => string;
export declare const getFontInfo: () => {
    'Abril Fatface Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya SC Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya SC Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya SC Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Alegreya Sans Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Amarante Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Amatic SC Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Unicode MS Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Arial Unicode MS Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Atomic Age Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Audiowide Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Demi Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Light': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Light Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Medium Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Medium Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Avenir Next LT Pro Regular Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'BellTopo Sans Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'BellTopo Sans Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'BellTopo Sans Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'BellTopo Sans Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Belleza Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Black Ops One Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Cabin Sketch Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Cabin Sketch Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Coming Soon Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'FGDC GeoAge Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Homemade Apple Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'IM FELL DW Pica PRO Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'IM FELL DW Pica PRO Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Sans Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Sans Semibold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Bold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Light Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Semibold Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Josefin Slab Thin Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Just Another Hand Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Muli Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Muli Light': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Muli Light Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Muli Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Oswald Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Pacifico Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Raleway Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Raleway Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Raleway Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Reenie Beanie Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Roboto Light Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Roboto Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Sacramento Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Source Sans Pro Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Source Sans Pro Italic': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Source Sans Pro Light': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Source Sans Pro Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Special Elite Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Vollkorn Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Vollkorn Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Vollkorn SC Bold': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Vollkorn SC Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
    'Waiting for the Sunrise Regular': {
        font: {
            family: string;
            style: string;
            weight: string;
        };
    };
};
export declare const getPreviewTextSymbol: (symbol: JimuSymbol, Color: typeof __esri.Color) => JimuSymbol;
