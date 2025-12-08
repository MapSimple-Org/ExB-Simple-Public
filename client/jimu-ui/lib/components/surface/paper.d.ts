import { React } from 'jimu-core';
import { type SurfaceProps } from './surface';
/**
 * The `Paper` component props.
 */
export interface PaperProps extends Omit<SurfaceProps, 'level'> {
    /**
     * The variant to use.
     * @default flat
     */
    variant?: 'flat' | 'elevation' | 'outlined';
    /**
     * Whether the background is transparent.
     * If `true`, the default text color is `inherit`.
     * @default false
     */
    transparent?: boolean;
}
/**
 * The `Paper` component is a container for displaying content on a `paper` surface.
 *
 * ```ts
 * import { Paper } from 'jimu-ui'
 * ```
 */
export declare const Paper: React.ForwardRefExoticComponent<PaperProps & React.RefAttributes<any>>;
