import type { DataSourceFactoryUriExtension } from '../extension-spec/extension-spec';
export declare class JimuCoreDataSourceFactoryUriExtension implements DataSourceFactoryUriExtension {
    id: string;
    getFactoryUri(dataSourceType: any): string;
}
