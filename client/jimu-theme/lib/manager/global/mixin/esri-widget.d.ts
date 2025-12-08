import type { ThemeVariable } from '../../type';
export declare const esriWidgetCommonStyle: (theme: ThemeVariable) => {
    'body.calcite-mode-light, body.calcite-mode-dark': {
        '.esri-widget': {
            fontSize: string | number;
            fontFamily: string;
            color: string;
            backgroundColor: string;
            'h4, h5, h6': {
                fontFamily: string;
            };
        };
        '.esri-button': {
            color: string;
            backgroundColor: string;
            border: string;
            '@media (hover: hover)': {
                '&:hover': {
                    backgroundColor: string;
                };
            };
            '&:disabled, &.esri-disabled': {
                color: string;
                backgroundColor: string;
                borderColor: string;
            };
        };
        '.esri-button--secondary': {
            color: string;
            backgroundColor: string;
            border: string;
            '@media (hover: hover)': {
                '&:hover': {
                    color: string;
                    backgroundColor: any;
                    borderColor: string;
                };
            };
            '&:disabled, &.esri-disabled': {
                color: string;
                backgroundColor: string;
                borderColor: string;
            };
        };
        '.esri-input, .esri-select': {
            color: string;
            backgroundColor: string;
            border: string;
            boxShadow: string;
            borderRadius: string;
            '&:focus': {
                borderColor: string;
                boxShadow: string;
            };
            '&::placeholder': {
                color: string;
            };
        };
        '.esri-widget__heading': {
            color: string;
        };
        'h1.esri-widget__heading': {
            fontSize: string;
        };
        'h2.esri-widget__heading': {
            fontSize: string;
        };
        'h3.esri-widget__heading, h4.esri-widget__heading, h5.esri-widget__heading, h6.esri-widget__heading': {
            fontSize: string;
        };
        'arcgis-basemap-gallery': {
            width: string;
            overflow: string;
            fontFamily: string;
            '--calcite-color-foreground-1': string;
            '--calcite-color-brand-underline': string;
            '--calcite-color-status-info': string;
            '--calcite-color-foreground-3': string;
            '--calcite-color-background-inverse': string;
            '--calcite-color-border-1': string;
            '--calcite-color-text-1': string;
            '--calcite-color-text-3': string;
            '--calcite-chip-background-color': string;
            '--calcite-chip-text-color': string;
        };
        'arcgis-search': {
            '--calcite-color-status-warning': string;
        };
        '.esri-identity-modal': {
            '.esri-identity-modal__info': {
                color: string;
            };
            '--calcite-label-text-color': string;
        };
    };
    ':root, :host': {
        '--arcgis-charts-default-width': string;
        '--arcgis-charts-default-height': string;
    };
    '.jimu-rtl arcgis-arcade-editor': {
        textAlign: string;
    };
};
