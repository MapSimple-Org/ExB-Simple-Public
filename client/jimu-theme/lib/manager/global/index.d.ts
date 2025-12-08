import type { ThemeModule } from '../theme-module/type';
interface GlobalStyleProps {
    isRTL?: boolean;
    module: ThemeModule;
    module2?: ThemeModule;
}
export declare const GlobalStyles: (props: GlobalStyleProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export * from './font-loader';
export * from './constant';
export { getClassicVarsMapping } from './classic-adapter';
