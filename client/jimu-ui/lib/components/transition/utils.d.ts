import type { IMThemeVariables } from 'jimu-core';
import { type TransitionEasingOption, type TransitionDurationOption } from 'jimu-theme';
interface ComponentProps {
    easing: TransitionEasingOption;
    style: React.CSSProperties | undefined;
    timeout: TransitionDurationOption | 'auto';
}
interface TransitionProps {
    duration: string | number;
    easing: string | undefined;
    delay: string | undefined;
}
export declare const reflow: (node: Element) => number;
export declare function getTransitionProps(props: ComponentProps, mode: 'enter' | 'exit', theme: IMThemeVariables): TransitionProps;
export {};
