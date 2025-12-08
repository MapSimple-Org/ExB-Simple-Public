import type { PageContextProps } from 'jimu-layouts/layout-runtime';
export interface ActionBlockProps {
    layoutId: string;
    pageContext: PageContextProps;
    onTemplateSelected: (templateBlockJson: any) => void;
    onPageTemplateSelected: (templatePageJson: any) => void;
}
export declare function ActionBlock(props: ActionBlockProps): import("@emotion/react/jsx-runtime").JSX.Element;
