import type * as jimuLayoutBuilderModule from 'jimu-layouts/layout-builder';
import type * as jimuLayoutRuntimeModule from 'jimu-layouts/layout-runtime';
export declare function clearSelection(dispatch: any): void;
export declare function clearLocalStore(runtimeMode: string, timestamp: string): void;
export declare function loadLayoutEntry(): Promise<typeof jimuLayoutBuilderModule | typeof jimuLayoutRuntimeModule>;
