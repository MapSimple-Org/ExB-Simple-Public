import type { StandardComponentProps } from '../types';
export declare enum LoadingType {
    Primary = "PRIMARY",
    Secondary = "SECONDARY",
    Donut = "DONUT",
    Bar = "BAR",
    DotsPrimary = "DOTS_PRIMARY",
    DotsSecondary = "DOTS_SECONDARY",
    Skeleton = "SKELETON"
}
/**
 * The Loading Component Props.
 */
export interface LoadingProps extends StandardComponentProps {
    /**
     * The type of the loading indicator.
     * @default LoadingType.Primary
     */
    type?: LoadingType;
    /**
     * The width of the loading indicator.
     * Unit is px.
     */
    width?: number;
    /**
     * The height of the loading indicator.
     * Unit is px.
     */
    height?: number;
    /**
     * The string to show in the loading indicator.
     */
    text?: string;
}
/**
 * The `Loading` component can show loading state and disable interactions.
 *
 * ```ts
 * import { Loading } from 'jimu-ui'
 * ```
 */
export declare const Loading: {
    (props: LoadingProps): import("@emotion/react/jsx-runtime").JSX.Element;
    count: number;
};
