/** @jsx jsx */
import { React } from 'jimu-core';
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool';
import type { InitialMapState } from '../config';
export default class Home extends BaseTool<BaseToolProps, unknown> {
    toolName: string;
    getTitle(): string;
    getIcon(): IconType;
    getHomeContent: (initialMapState: InitialMapState) => import("@emotion/react/jsx-runtime").JSX.Element;
    getExpandPanel(): React.JSX.Element;
}
