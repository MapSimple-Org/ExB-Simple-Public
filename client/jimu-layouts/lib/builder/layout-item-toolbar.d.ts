/** @jsx jsx */
import { type IMLayoutItemJson, type IMThemeVariables } from 'jimu-core';
import { type Placement, type ShiftOptions, type FlipOptions } from 'jimu-ui';
import type { ToolbarConfig } from 'jimu-layouts/layout-runtime';
export interface LayoutItemToolbarProps {
    layoutId: string;
    layoutItem: IMLayoutItemJson;
    placement?: Placement;
    refElement: HTMLElement;
    shiftOptions?: ShiftOptions;
    flipOptions?: FlipOptions;
    builderTheme: IMThemeVariables;
    formatMessage: (string: any, values?: any) => string;
    toolItems?: ToolbarConfig;
    showDefaultTools?: boolean;
}
export declare function LayoutItemToolbar(props: LayoutItemToolbarProps): import("@emotion/react/jsx-runtime").JSX.Element;
