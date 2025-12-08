/** @jsx jsx */
import { PagePart, BrowserSizeMode, type IMPageJson, type ImmutableObject } from 'jimu-core';
import { type PageContextProps } from 'jimu-layouts/layout-runtime';
export interface PageBodyProps {
    pageJson: IMPageJson;
    renderedPageId: string;
    activePagePart: PagePart;
    browserSizeMode: BrowserSizeMode;
    pageContext: ImmutableObject<PageContextProps>;
    visible: boolean;
    isResizing: boolean;
    headerFooterHeight: number;
}
export declare function PageBody(props: PageBodyProps): import("@emotion/react/jsx-runtime").JSX.Element;
