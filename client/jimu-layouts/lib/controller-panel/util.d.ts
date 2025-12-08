import { React, type IMControllerPanelJson, type IMAppConfig, type BrowserSizeMode } from 'jimu-core';
export declare function findPageRelatedControllerIds(appConfig: IMAppConfig, pageId: string, browserSizeMode: BrowserSizeMode): string;
export declare function panelTransformStyle(panelJson: IMControllerPanelJson): any;
export declare function convertToStyle(panelJson: IMControllerPanelJson): import("jimu-core").SerializedStyles;
/**
 *
 * @param container The container element
 * @param firstClass The first focusable element's distinct class name
 * @param lastVirtualClass The last virtual focusable element's distinct class name
 * @returns An keyboard event handler of the last virtual node, which passes the browser's focus
 * to the firstClass element (Tab) or the real last element(Shift + Tab)
 */
export declare const useHandleLastVirtualNodeFocus: (container: HTMLElement, firstClass: string, lastVirtualClass: string) => (e: React.KeyboardEvent<HTMLButtonElement>) => void;
