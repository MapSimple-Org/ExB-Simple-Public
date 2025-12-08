import * as React from 'react';
import { type Subscription, type KeyboardListener, type KeyboardEventHandler, type Monitor } from './create-listener';
interface Props {
    eventName: 'keydown' | 'keyup';
    bindings: {
        [eventName: string]: KeyboardEventHandler;
    };
    monitor?: Monitor;
    element?: HTMLElement;
    onKeyboardTrigger?: KeyboardEventHandler;
}
declare class Keyboard extends React.PureComponent<Props> {
    subs: Subscription[];
    keyboardListener: KeyboardListener;
    static defaultProps: {
        eventName: string;
        bindings: {};
        monitor: any;
    };
    constructor(props: Props);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): any;
}
export default Keyboard;
