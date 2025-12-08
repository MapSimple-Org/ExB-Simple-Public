import type { DataSource, DataRecord } from '../data-sources';
export declare function removeLinebreaks(content: string): string;
export declare function getUniqueAttr(attribute: string, fieldNames: string[], aliasNames: string[]): string;
export declare function toCSV(dataSource: DataSource, records: DataRecord[], outFields?: string[]): Blob;
