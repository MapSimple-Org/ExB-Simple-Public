/** @jsx jsx */
import { React } from 'jimu-core';
import { type LayoutItemProps, type SectionProps, type LayoutProps, type StateToLayoutItemProps } from '../types';
interface OwnProps {
    layoutEntryComponent: React.ComponentClass<LayoutProps>;
}
type Props = LayoutItemProps & StateToLayoutItemProps & SectionProps & OwnProps;
export declare function SectionRendererBase(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
