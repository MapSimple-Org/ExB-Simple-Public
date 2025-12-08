/** @jsx jsx */
import { React, type IMThemeVariables, type IMLayoutItemJson } from 'jimu-core';
import { type LayoutItemProps } from 'jimu-layouts/layout-runtime';
interface OwnProps {
    itemIndex: number;
    isFirst: boolean;
    isLast: boolean;
    layoutItem: IMLayoutItemJson;
    theme: IMThemeVariables;
    formatMessage: (id: string) => string;
}
export declare function ScreenGroup(props: LayoutItemProps & OwnProps): React.JSX.Element;
export {};
