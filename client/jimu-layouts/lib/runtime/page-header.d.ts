/** @jsx jsx */
import { type IMHeaderJson, type BrowserSizeMode, type IMThemeVariables } from 'jimu-core';
import { type PageContextProps } from '../builder/page-context';
export interface PageHeaderProps {
    headerJson: IMHeaderJson;
    pageContext: PageContextProps;
    browserSizeMode: BrowserSizeMode;
    mainSizeMode: BrowserSizeMode;
    theme: IMThemeVariables;
    showClassification?: boolean;
    onHeightChange: (height: number) => void;
}
export declare function PageHeader(props: PageHeaderProps): import("@emotion/react/jsx-runtime").JSX.Element;
