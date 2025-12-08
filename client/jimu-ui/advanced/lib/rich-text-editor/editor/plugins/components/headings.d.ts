import { type IMThemeVariables } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import { HeaderValue } from '../../../type';
interface Props extends StandardComponentProps {
    title?: string;
    disabled?: boolean;
    /**
     * The theme to get colors. The default value is the theme in the theme context.
     */
    specificTheme?: IMThemeVariables;
    value?: HeaderValue;
    'aria-label'?: string;
    onChange?: (value: HeaderValue) => void;
}
export declare const Headings: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
