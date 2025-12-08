/** @jsx jsx */
import { BrowserSizeMode } from 'jimu-core';
interface Props {
    itemIndex: number;
    activeScreenIndex: number;
    total: number;
    screenGroupId: string;
    layoutId: string;
    layoutItemId: string;
    hasPanel: boolean;
    browserSizeMode: BrowserSizeMode;
    formatMessage: (id: string) => string;
}
export declare function ScreenGroupMenu(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
