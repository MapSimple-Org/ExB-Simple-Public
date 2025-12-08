import type { DataSourceItemProps } from '../types';
interface DataSourceErrorItemProps extends Omit<DataSourceItemProps, 'isRenameInputShown' | 'isMappingIconShown' | 'onMappingIconClick' | 'onRename'> {
}
export declare const DataSourceErrorItem: import("@emotion/styled").StyledComponent<DataSourceErrorItemProps, {}, {}>;
export {};
