import { React } from 'jimu-core';
/**
 * Add keys, values of `defaultProps` that does not exist in `props`
 * @param {object} defaultProps
 * @param {object} props
 * @returns {object} resolved props
 */
export declare const resolveProps: <T extends {
    [key: string]: any;
}>(defaultProps: T, props: T) => T;
/**
 * Gets only the valid children of a component,
 * and ignores any nullish or falsy child.
 *
 * @param children the children
 */
export declare const getValidReactChildren: (children: React.ReactNode) => Array<React.ReactElement<any>>;
export * from './timeout';
export * from './use-notification-state';
