import { type IMPageJson, type IntlShape, type LayoutItemConstructorProps, type IconResult } from 'jimu-core';
export declare function getDefaultTocPageIcon(pageJson: IMPageJson, formatMessage?: any, pagelabel?: string): IconResult;
export declare function getDefaultTocDialogIcon(): React.ComponentClass<React.SVGAttributes<SVGElement>>;
export declare function getDefaultSectionIcon(): React.ComponentClass<React.SVGAttributes<SVGElement>>;
/**
 * Get related page id by dialog's id.
 */
export declare function getPageListByDialogId(pages: any, dialogId: string): any[];
export declare function fetchCommonWidgetList(): Promise<LayoutItemConstructorProps[]>;
/**
 * Fetch remote custom widgets from AGOL or portal.
 */
export declare function fetchRemoteCustomWidgetList(): Promise<LayoutItemConstructorProps[]>;
export declare function getWidgetsGroupLabel(group: number, intl: IntlShape): string;
export declare function getSectionItemForWidgetsList(intl: IntlShape): LayoutItemConstructorProps;
export declare function getPlaceholderItemForWidgetsList(intl: IntlShape): LayoutItemConstructorProps;
export declare function showRemoteCustomWidgets(): boolean;
export declare function showCustomWidgets(commonWidgetList: LayoutItemConstructorProps[]): boolean;
export declare function getBuilderUrl(id: string, isExpressMode?: boolean): string;
export declare function getHomePageUrl(isExpressMode?: boolean, views?: string): string;
export declare const CUSTOM_GROUP = 7;
export declare function undo(): void;
export declare function redo(): void;
