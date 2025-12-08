import { type TabProps } from 'jimu-ui';
interface DraggableTabProps {
    layoutId: string;
    layoutItemId: string;
    onDragStart: (layoutItemId: string) => void;
}
export declare function DraggableTab(props: DraggableTabProps & TabProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
