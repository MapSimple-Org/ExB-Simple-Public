import type { IMDialogJson } from '../../types/app-config';
import type { BrowserSizeMode } from '../../types/common';
export declare const RESIZE_HANDLER_SIZE = "4px";
export declare function bindResizeHandler(interact: any, resizeRef: HTMLDivElement, dialogJson: IMDialogJson, browserSizeMode: BrowserSizeMode, getAppConfigAction: any): Interact.Interactable;
