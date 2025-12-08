import type { ThemeMixin } from 'jimu-theme';
import type { StandardComponentProps } from 'jimu-ui';
interface SharedThemeColorSwatchProps extends StandardComponentProps {
    value?: string;
    colors: ThemeMixin['sharedTheme'];
    'aria-label'?: string;
    size?: number;
    onChange?: (value: string) => void;
}
export declare const SharedThemeColorSwatch: (props: SharedThemeColorSwatchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
