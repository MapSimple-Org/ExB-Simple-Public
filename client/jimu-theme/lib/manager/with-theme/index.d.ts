import { React, type IMThemeVariables } from 'jimu-core';
import type { DistributiveOmit, PropsOf } from '../../__emotion__';
type ThemedComponent<C extends React.ComponentType<React.ComponentProps<C>>> = React.ForwardRefExoticComponent<DistributiveOmit<PropsOf<C>, 'theme'> & {
    theme?: IMThemeVariables;
}>;
/**
 * A higher-order component that provides the current theme as a prop to the wrapped child and listens for changes.
 * If the theme is updated, the child component will be re-rendered accordingly.
 *
 * @example
 * ```tsx
 * import { withTheme } from 'jimu-theme'
 *
 * const MyComponent = ({ theme }) => (
 *   <div style={{ backgroundColor: theme.sys.color.surface.paper }}>
 *     Hello World
 *   </div>
 * )
 *
 * export default withTheme(MyComponent)
 * ```
 */
export declare function withTheme<C extends React.ComponentType<React.ComponentProps<C>>>(Component: C, multiTheme?: boolean): ThemedComponent<C>;
/**
* A higher-order component that provides the theme2 as a prop to the wrapped child and listens for changes.
* @param Component
* @internal
*/
export declare function withTheme2<C extends React.ComponentType<React.ComponentProps<C>>>(Component: C): ThemedComponent<C>;
/**
 * A higher-order component that provides the builder theme as a prop to the
 * wrapped child and listens for changes.
 * @param Component
 * @internal
 */
export declare const withBuilderTheme: typeof withTheme2;
export {};
