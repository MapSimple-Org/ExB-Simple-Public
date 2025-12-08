/** @jsx jsx */
import { type IMHeaderJson, type BrowserSizeMode, type IMThemeVariables } from 'jimu-core';
import { type PageContextProps } from '../builder/page-context';
export interface PageFooterProps {
    footerJson: IMHeaderJson;
    pageContext: PageContextProps;
    browserSizeMode: BrowserSizeMode;
    mainSizeMode: BrowserSizeMode;
    theme: IMThemeVariables;
    onHeightChange: (height: number) => void;
}
export declare function PageFooter(props: PageFooterProps): import("@emotion/react/jsx-runtime").JSX.Element;
