/** @jsx jsx */
import { React } from 'jimu-core';
import { type PageContextProps, type LayoutItemProps, type WidgetProps } from 'jimu-layouts/layout-runtime';
type Props = LayoutItemProps & WidgetProps;
export declare class WidgetRendererInBuilder extends React.PureComponent<Props> {
    pageContext: PageContextProps;
    mask(): import("@emotion/react/jsx-runtime").JSX.Element;
    getStyle(): import("jimu-core").SerializedStyles;
    getPlaceholderStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
