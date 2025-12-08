interface WrapImageSelectorProps {
    display: 'inline' | 'float' | 'block';
    value?: 'left' | 'right';
    onChange?: (display: 'inline' | 'float' | 'block', value?: 'left' | 'right') => void;
}
export declare const WrapImageSelector: (props: WrapImageSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
