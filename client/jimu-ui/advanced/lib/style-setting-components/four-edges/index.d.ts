import { type EdgesNumberProps } from './edges-number';
/**
 * The `FourEdges` component props.
 */
export interface FourEdgesProps extends Omit<EdgesNumberProps, 'onActivatedChange' | 'detached'> {
    /**
     * Defines the style added to the element.
     */
    style?: any;
    /**
     * Whether to allow the values of the four sides to be set separately.
     * @ignore
     */
    separated?: boolean;
}
/**
 * The `FourEdges` component allows users to set the values of four edges or four corners of the box.
 *
 * ```ts
 * import { FourEdges } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const FourEdges: (props: FourEdgesProps) => import("@emotion/react/jsx-runtime").JSX.Element;
