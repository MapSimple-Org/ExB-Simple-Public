import { type IMPageJson } from 'jimu-core';
export declare const DEFAULT_HEADER_HEIGHT = 75;
export declare const DEFAULT_FOOTER_HEIGHT = 75;
export declare function computePageHeight(pageJson: IMPageJson, headerFooterHeight: number): number | string;
