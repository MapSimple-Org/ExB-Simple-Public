import { React } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
interface ThemeColorSectionProps extends StandardComponentProps {
    label?: string;
    tooltip?: string;
    children?: React.ReactNode;
}
export declare const ThemeColorSection: (props: ThemeColorSectionProps) => React.ReactElement;
export {};
