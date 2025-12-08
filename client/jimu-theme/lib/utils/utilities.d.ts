export declare const getSpacingUtilities: (key: number | string, value: any) => {};
export declare const getTypeColorUtilities: (color: string, value: string) => {
    [x: string]: {
        backgroundColor: string;
        borderColor?: undefined;
        color?: undefined;
    } | {
        borderColor: string;
        backgroundColor?: undefined;
        color?: undefined;
    } | {
        color: string;
        backgroundColor?: undefined;
        borderColor?: undefined;
    };
};
export declare const getBorderColorUtilities: (borderColor: string, borderWidth?: string, whiteColor?: string) => {
    [x: string]: any;
};
export declare const getShadowUtilities: <T extends object>(shadows: T) => {};
export declare const getShapeUtilities: <T extends object>(shape: T) => {};
