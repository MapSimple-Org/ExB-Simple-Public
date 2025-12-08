/** @jsx jsx */
import { PagePart, type IMHeaderJson, type BrowserSizeMode, type ImmutableObject } from 'jimu-core';
import { type PageContextProps } from 'jimu-layouts/layout-runtime';
export interface PageHeaderProps {
    header: IMHeaderJson;
    activePagePart: PagePart;
    browserSizeMode: BrowserSizeMode;
    mainSizeMode: BrowserSizeMode;
    pageContext: ImmutableObject<PageContextProps>;
    showClassification?: boolean;
    onResizeStart: () => void;
    onHeightChange: (height: number) => void;
    onResizeEnd: () => void;
}
export declare function PageHeader(props: PageHeaderProps): import("@emotion/react/jsx-runtime").JSX.Element;
