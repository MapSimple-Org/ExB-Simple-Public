import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { BasicProgressProps } from './type';
/**
 * The Progress component props.
 */
export interface ProgressProps extends BasicProgressProps, StandardComponentProps {
    /**
     * UI types of progress, including linear or circular.
     * @default linear
     */
    type?: 'linear' | 'circular';
    /**
     * The size of the component.
     * @default 100
     * Note: only valid when `type` is `circular`.
     */
    size?: number;
    /**
     * Defines the size of the circular progress.
     * @default 100
     * @deprecated Use `size` instead.
     */
    circleSize?: number;
}
/**
 * The Progress component indicators commonly known as spinners, express an unspecified wait time or display the length of a process.
 *
 * ```ts
 * import { Progress } from 'jimu-ui'
 * ```
 */
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
