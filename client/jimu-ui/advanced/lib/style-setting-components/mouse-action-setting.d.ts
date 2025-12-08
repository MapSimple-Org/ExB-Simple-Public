/** @jsx jsx */
import { HoverType } from 'jimu-core';
interface Props {
    type: HoverType;
    setting: any;
    onChange: (hoverSetting: any) => void;
    onPreviewClick: () => void;
}
export declare function MouseActionSetting(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
