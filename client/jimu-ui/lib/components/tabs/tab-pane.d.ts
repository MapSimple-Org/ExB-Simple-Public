import { React } from 'jimu-core';
export interface TabPaneProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
    /**
     * If `true`, the panel will appear as active.
     */
    active?: boolean;
    keepMount?: boolean;
}
export declare const TabPane: (props: TabPaneProps) => import("@emotion/react/jsx-runtime").JSX.Element;
