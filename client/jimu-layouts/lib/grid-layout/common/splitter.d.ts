interface Props {
    referenceItemId: string;
    direction: 'row' | 'col';
    layoutId: string;
    onResizeEnd?: (id: string, dx: number, dy: number) => void;
}
export declare function Splitter(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
