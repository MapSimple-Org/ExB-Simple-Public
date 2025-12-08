export interface ArrowStyle {
    background?: string;
    border?: {
        type?: 'solid' | 'dashed' | 'dotted' | 'double';
        color?: string;
        width?: string | number;
    };
    size?: number;
}
export declare function popperPointer(arrowStyle?: ArrowStyle): import("jimu-core").SerializedStyles;
