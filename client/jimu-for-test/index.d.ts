import { initGlobal, getInitState, getDefaultAppConfig } from './lib/init-state';
import * as mockData from './lib/mock-data';
export * from './lib/widget-wrapper';
export * from './lib/widget-setting-wrapper';
export * from './lib/test-utils';
export * from './lib/mock-service';
export * from './lib/mock-item';
export * from './lib/mock-get-selections';
export * from './lib/mock-systemjs';
export * from './lib/mock-numeric-input';
export { mockData, initGlobal, getInitState, getDefaultAppConfig };
export * from './lib/mock-js-api';
export declare function updateStore(storeItem: any): void;
/**
 * Init extensions. Will init `DependencyDefine` and `DataSourceFactoryUri`.
 */
export declare function initExtensions(): void;
/** Init store with default app config. */
export declare function initStore(): void;
export { default as mockTheme } from './lib/theme-mock';
