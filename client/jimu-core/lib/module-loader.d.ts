import type * as jimuForBuilderModules from 'jimu-for-builder';
export declare function getModuleSync<T = any>(module: string): T;
export declare function loadModule<T = any>(module: string, parentUrl?: string): Promise<T>;
export declare function loadModules<T = any[]>(modules: string[], parentUrl?: string): Promise<T>;
/**
 * return http://....
 * @param module
 */
export declare function resolveModuleFullUrl(module: string): string;
/**
 * return /abc/123
 * @param module
 */
export declare function resolveModuleFullPath(module: string): string;
export declare function getJimuForBuilderModules(): typeof jimuForBuilderModules;
export declare function deleteModule(module: any): void;
