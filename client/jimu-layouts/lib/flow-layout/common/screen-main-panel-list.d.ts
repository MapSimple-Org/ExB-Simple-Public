/** @jsx jsx */
import { React, ScreenTransitionType, type ImmutableArray, type IMThemeVariables } from 'jimu-core';
import type { LayoutProps } from 'jimu-layouts/layout-runtime';
export interface Props {
    rootLayoutId: string;
    activeIndex: number;
    viewHeight?: number;
    headerHeight: number;
    screens: ImmutableArray<string>;
    isSmallSize: boolean;
    transitionType: ScreenTransitionType;
    layoutEntry: React.ComponentType<LayoutProps>;
    isDesignMode?: boolean;
    formatMessage?: (id: string) => string;
    builderTheme?: IMThemeVariables;
}
export declare function ScreenMainPanelList(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
