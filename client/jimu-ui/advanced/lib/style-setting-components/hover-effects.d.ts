/** @jsx jsx */
import { HoverType } from 'jimu-core';
interface Props {
    type: HoverType;
    setting?: {
        skewX?: number;
        skewY?: number;
        scaleX?: number;
        scaleY?: number;
        rotate?: number;
        offsetX?: number;
        offsetY?: number;
        opacity?: number;
    };
    onTypeChange: (type: HoverType) => void;
    onSettingChange: (props: any) => void;
}
export declare function HoverEffect(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
