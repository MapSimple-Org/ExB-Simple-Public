interface Props {
    controllerId: string;
    layoutId: string;
    layoutItemId: string;
    minimized: boolean;
    onClose: (e: any, string: any) => void;
    onToggle: () => void;
}
export declare function Panel(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
