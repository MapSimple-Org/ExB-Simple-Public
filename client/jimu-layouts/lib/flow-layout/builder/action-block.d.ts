/** @jsx jsx */
import { BrowserSizeMode } from 'jimu-core';
import type { PageContextProps } from 'jimu-layouts/layout-runtime';
export interface ActionBlockProps {
    pageContext: PageContextProps;
    browserSizeMode: BrowserSizeMode;
    blockOnly?: boolean;
    onPageTemplateSelected: (templatePageJson: any) => void;
    onBlockTemplateSelected: (templateBlockJson: any) => void;
    onScreenTemplateSelected: (templateScreenJson: any) => void;
}
export declare function ActionBlock(props: ActionBlockProps): import("@emotion/react/jsx-runtime").JSX.Element;
