/** @jsx jsx */
import { React } from 'jimu-core';
import type { LayoutProps } from '../types';
interface Props {
    viewId: string;
    isActive: boolean;
    layoutEntryComponent: React.ComponentClass<LayoutProps>;
}
export declare function ViewContent(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
