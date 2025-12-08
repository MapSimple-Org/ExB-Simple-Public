import type { SupportedUtilityType, OrgGeocodeSetting, OrgPrintSetting } from 'jimu-core';
export { predefinedOrgUtilities } from 'jimu-ui/basic/lib/runtime-components';
export interface UtilityTreeItem {
    id: string;
    label: string;
    type: SupportedUtilityType;
    name?: string;
    index?: number;
    url?: string;
    rootId?: string;
    task?: string;
    children?: UtilityTreeItem[];
    setting?: OrgGeocodeSetting | OrgPrintSetting;
}
