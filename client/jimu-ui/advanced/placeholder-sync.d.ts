/** @jsx jsx */
import { React, type BrowserSizeMode } from 'jimu-core';
interface Props extends React.HtmlHTMLAttributes<HTMLElement> {
    layoutId: string;
    layoutItemId: string;
    sizemode: BrowserSizeMode;
    onSyncChange: (placeholderId: number) => void;
}
export declare function PlaceholderSync(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
