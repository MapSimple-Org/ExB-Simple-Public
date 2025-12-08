import { React } from 'jimu-core';
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool';
import type { ToolShellProps } from '../layout/base/base-tool-shell';
export default class Navigation extends BaseTool<BaseToolProps, unknown> {
    toolName: string;
    getTitle(): string;
    getIcon(): IconType;
    getExpandPanel(): React.JSX.Element;
    /**
     * Navigation only supports scene view, so NavigationTool.isAvailable() will return false if the map is map view.
     */
    static isAvailable(toolShellProps: ToolShellProps): boolean;
}
