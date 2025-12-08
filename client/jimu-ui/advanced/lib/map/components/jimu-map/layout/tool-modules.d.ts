import type { BaseTool, BaseToolProps } from './base/base-tool';
declare const ToolModules: {
    [ModuleName: string]: new (props: BaseToolProps, deprecatedLegacyContext?: any) => BaseTool<BaseToolProps, any>;
};
export default ToolModules;
