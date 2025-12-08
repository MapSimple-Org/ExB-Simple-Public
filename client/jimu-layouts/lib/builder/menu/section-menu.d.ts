import { type IMLayoutItemJson } from 'jimu-core';
import { type ToolItemConfig, type SectionProps } from 'jimu-layouts/layout-runtime';
export declare function findSectionInfo(layoutItem: IMLayoutItemJson): SectionProps;
export declare function findActiveViewId(props: SectionProps): string;
export declare const sectionMenuItems: ToolItemConfig[];
export declare const viewMenuItems: ToolItemConfig[];
