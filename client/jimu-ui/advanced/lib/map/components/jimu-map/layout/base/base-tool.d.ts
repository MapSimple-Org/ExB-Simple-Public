/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { type ShiftOptions, type FlipOptions } from 'jimu-ui';
import { UIComponent, type UIComponentProps } from './ui-component';
import type { ToolJson } from '../config';
import type { ToolShellProps } from './base-tool-shell';
export interface BaseToolProps extends UIComponentProps {
    toolJson: ToolJson;
    toolName: string;
    isMobile?: boolean;
    intl?: IntlShape;
    mapComponentsLoaded: boolean;
    activeToolName: string;
    onActiveToolNameChange: (activeToolName: string) => void;
}
export interface IconType {
    icon: React.ComponentClass<React.SVGAttributes<SVGElement>>;
    onIconClick?: (evt?: React.MouseEvent<any>) => void;
}
export declare abstract class BaseTool<P extends BaseToolProps, S> extends UIComponent<P, S> {
    iconContainer: HTMLElement;
    toolName: string;
    isContainedToMobilePanel: boolean;
    generation?: number;
    shiftOptions: ShiftOptions;
    flipOptions: FlipOptions;
    exbMapUiRef: React.RefObject<HTMLDivElement>;
    constructor(props: any);
    abstract getTitle(): string;
    abstract getIcon(): IconType;
    abstract getExpandPanel(): React.JSX.Element;
    focusDefaultElement(): void;
    onShowPanel(): void;
    onClosePanel(): void;
    destroy(): void;
    static getIsNeedSetting(): boolean;
    /**
     * Return true if the tool should be rendered on the map, otherwise return false.
     * e.g.
     * 1. ScaleBar only supports map view, so ScaleBarTool.isAvailable() will return false if the map is scene view.
     * 2. NavigationToggle only supports scene view, so NavigationTool.isAvailable() will return false is the map is map view.
     */
    static isAvailable(toolShellProps: ToolShellProps): boolean;
    private onPopperToggle;
    private _onKeyDown;
    private _onIconClick;
    private readonly _getContent;
    private _initIconContainer;
    private readonly onResize;
    private _renderPCTool;
    private _renderMobileTool;
    private getExpandPanelPlacementClassName;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
