import type { ThemeVariable } from '../../type';
interface ClassicThemeAdapterProps {
    uri: string;
    theme: ThemeVariable;
}
export declare const ClassicThemeAdapter: (props: ClassicThemeAdapterProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export { getClassicVarsMapping } from './css-vars';
