/** @jsx jsx */
import { type IMPageJson, BrowserSizeMode } from 'jimu-core';
import { type PageContextProps } from '../builder/page-context';
export interface PageBodyProps {
    pageJson: IMPageJson;
    pageContext: PageContextProps;
    visible: boolean;
    browserSizeMode: BrowserSizeMode;
    isPrintPreview: boolean;
    headerFooterHeight: number;
}
export declare function PageBody(props: PageBodyProps): import("@emotion/react/jsx-runtime").JSX.Element;
