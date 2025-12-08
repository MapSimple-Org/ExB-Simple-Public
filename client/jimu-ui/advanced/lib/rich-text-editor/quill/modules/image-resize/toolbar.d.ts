interface ToolbarComponentProps {
    reference: Element;
    container: Element;
    display: 'inline' | 'float' | 'block';
    float?: 'left' | 'right';
    alignment?: 'left' | 'center' | 'right';
    alt?: string;
    onDelete?: () => void;
    onAltChange?: (alt: string) => void;
    onDisplayChange?: (display: 'inline' | 'float' | 'block', option?: any) => void;
}
export declare const ToolbarComponent: (props: ToolbarComponentProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
