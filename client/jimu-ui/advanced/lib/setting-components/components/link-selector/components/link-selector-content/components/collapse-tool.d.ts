import { React } from 'jimu-core';
interface State {
    collapse: boolean;
}
interface Prop {
    title: string;
    isOpen?: boolean;
    className?: string;
    children?: React.ReactNode;
}
export default class CollapseTool extends React.PureComponent<Prop, State> {
    componentWillMount(): void;
    onCollapseClick: (e: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
