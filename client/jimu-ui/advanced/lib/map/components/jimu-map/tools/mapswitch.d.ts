import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool';
export default class MapSwitch extends BaseTool<BaseToolProps, unknown> {
    toolName: string;
    static getIsNeedSetting(): boolean;
    getStyle(): import("jimu-core").SerializedStyles;
    getTitle(): string;
    getIcon(): IconType;
    switchMap: () => any;
    getExpandPanel(): React.JSX.Element;
    handleKeyDown: (e: React.KeyboardEvent<any>, onClick: any) => void;
    getContent: (isShowMapSwitchBtn: boolean, dataSourceIds: string[], activeDataSourceId: string, switchMap: any, mapComponentId: any) => import("@emotion/react/jsx-runtime").JSX.Element;
    getIconContent: (isShowMapSwitchBtn: boolean, dataSourceIds: string[], activeDataSourceId: string, switchMap: any) => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
