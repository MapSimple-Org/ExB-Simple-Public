import { type LayoutInfo, type LayoutItemConstructorProps, type IMAppConfig } from 'jimu-core';
export declare function canDropAtPlaceholder(draggingItem: LayoutItemConstructorProps): boolean;
export declare function canDeleteInExpressMode(layoutInfo: LayoutInfo, appConfig: IMAppConfig): boolean;
export declare function dropAtPlaceholder(placeholderLayoutInfo: LayoutInfo, draggingItem: LayoutItemConstructorProps): void;
export declare function addSectionInPlaceholder(placeholderLayoutInfo: LayoutInfo): void;
export declare function addWidgetInPlaceholder(placeholderLayoutInfo: LayoutInfo, draggingItem: LayoutItemConstructorProps): Promise<void>;
export declare function appendItemToApp(item: LayoutItemConstructorProps): Promise<void>;
