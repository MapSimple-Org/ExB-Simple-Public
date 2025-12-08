export declare const getLoadingStyles: (width: any, height: any, color: any, name: any) => {
    [x: string]: string | {
        '0%,80%,100%': {
            opacity: number;
            boxShadow: string;
            height: any;
        };
        '40%': {
            opacity: number;
            boxShadow: string;
            height: any;
        };
        background?: undefined;
        animation?: undefined;
        width?: undefined;
        height?: undefined;
        position?: undefined;
        top?: undefined;
        content?: undefined;
        left?: undefined;
        animationDelay?: undefined;
    } | {
        background: any;
        animation: string;
        width: any;
        height: any;
        '0%,80%,100%'?: undefined;
        '40%'?: undefined;
        position?: undefined;
        top?: undefined;
        content?: undefined;
        left?: undefined;
        animationDelay?: undefined;
    } | {
        position: string;
        top: number;
        content: string;
        '0%,80%,100%'?: undefined;
        '40%'?: undefined;
        background?: undefined;
        animation?: undefined;
        width?: undefined;
        height?: undefined;
        left?: undefined;
        animationDelay?: undefined;
    } | {
        left: string;
        '0%,80%,100%'?: undefined;
        '40%'?: undefined;
        background?: undefined;
        animation?: undefined;
        width?: undefined;
        height?: undefined;
        position?: undefined;
        top?: undefined;
        content?: undefined;
        animationDelay?: undefined;
    } | {
        left: any;
        animationDelay: string;
        '0%,80%,100%'?: undefined;
        '40%'?: undefined;
        background?: undefined;
        animation?: undefined;
        width?: undefined;
        height?: undefined;
        position?: undefined;
        top?: undefined;
        content?: undefined;
    };
    textIndent: string;
    margin: string;
    position: string;
    right: string;
    top: string;
    animationDelay: string;
    '&:before,&:after,&': {
        background: any;
        animation: string;
        width: any;
        height: any;
    };
    '&:before,&:after': {
        position: string;
        top: number;
        content: string;
    };
    '&:before': {
        left: string;
    };
    '&:after': {
        left: any;
        animationDelay: string;
    };
};
