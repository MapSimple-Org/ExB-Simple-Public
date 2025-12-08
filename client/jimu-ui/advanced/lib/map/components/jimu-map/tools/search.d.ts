/** @jsx jsx */
import { React } from 'jimu-core';
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool';
export default class Search extends BaseTool<BaseToolProps, unknown> {
    toolName: string;
    getTitle(): string;
    getIcon(): IconType;
    getExpandPanel(): React.JSX.Element;
}
