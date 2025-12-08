/** @jsx jsx */
import { React } from 'jimu-core';
interface Props {
    theme?: any;
    isCardSkeleton: boolean;
    createOnly?: boolean;
}
export declare class ListSkeleton extends React.PureComponent<Props, unknown> {
    getStyle(): import("jimu-core").SerializedStyles;
    renderCardSkeleton: () => import("@emotion/react/jsx-runtime").JSX.Element;
    renderListSkeleton: () => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
