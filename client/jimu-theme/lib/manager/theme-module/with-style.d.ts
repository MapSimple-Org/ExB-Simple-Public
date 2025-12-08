import type { React } from 'jimu-core';
import type { StyledComponent, StyledOptions } from '../../__emotion__';
/**
 * A higher-order component that links the registered component style.
 * @param Component
 * @param name
 * @param options
 * @internal
 */
export declare function withStyles<C extends React.ComponentType<React.ComponentProps<C>>>(Component: C, name?: string, inputOptions?: StyledOptions): StyledComponent<React.ComponentProps<C>>;
