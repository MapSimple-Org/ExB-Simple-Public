import { type BrandFunctionColors, type SchemeColor } from 'jimu-theme';
import type { StandardComponentProps } from 'jimu-ui/lib/components/types';
interface SchemeColorSwatchProps extends StandardComponentProps {
    value?: string;
    colors: SchemeColor;
    'aria-label'?: string;
    name: BrandFunctionColors;
    onChange?: (value: string) => void;
}
export declare const SchemeColorSwatch: (props: SchemeColorSwatchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
