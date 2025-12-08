/** @jsx jsx */
import { React } from 'jimu-core';
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool';
interface States {
    activeTabIndex: number;
}
export default class Layers extends BaseTool<BaseToolProps, States> {
    toolName: string;
    constructor(props: any);
    getTitle(): string;
    getIcon(): IconType;
    getExpandPanel(): React.JSX.Element;
    handleTabIndexChange: (activeTabIndex: number) => void;
    handleKeyDown: (e: React.KeyboardEvent<any>, index: number) => void;
}
export {};
