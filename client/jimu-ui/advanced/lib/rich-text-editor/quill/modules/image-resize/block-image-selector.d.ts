interface BlockImageSelectorProps {
    display: 'inline' | 'float' | 'block';
    value?: 'left' | 'right' | 'center';
    onChange?: (display: 'inline' | 'float' | 'block', value?: 'left' | 'right' | 'center') => void;
}
export declare const BlockImageSelector: (props: BlockImageSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
