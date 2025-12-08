import type { StandardComponentProps } from '../types';
export interface ImageDotsProps extends StandardComponentProps {
    imageCount: number;
    currentIndex: number;
    onChange: (index: number) => void;
}
export declare const ImageDots: (props: ImageDotsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
