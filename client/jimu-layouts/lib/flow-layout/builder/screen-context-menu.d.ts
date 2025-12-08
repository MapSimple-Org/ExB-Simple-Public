/** @jsx jsx */
import { type IMThemeVariables, type IMLayoutItemJson } from 'jimu-core';
interface Props {
    layoutId: string;
    layoutItemId: string;
    layoutItem: IMLayoutItemJson;
    isFirst: boolean;
    isLast: boolean;
    builderTheme: IMThemeVariables;
    formatMessage: (string: any, values?: any) => string;
}
export declare function ScreenContextMenu(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
