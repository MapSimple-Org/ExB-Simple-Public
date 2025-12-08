import type { ThemeModule } from './type';
export declare const ThemeStore: {
    setModule: (module: ThemeModule) => void;
    setModules: (uri: string, module: ThemeModule) => void;
    getModule: (uri?: string, showWarning?: boolean) => ThemeModule;
    setModule2: (module: ThemeModule) => void;
    getModule2: (showWarning?: boolean) => ThemeModule;
    subscribe: (listener: (module?: ThemeModule, fromTheme2?: boolean) => void) => () => void;
};
