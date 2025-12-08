import type { IMThemeVariables } from 'jimu-core';
import createStyled from './create-styled';
/**
 * The styled function for creating styled components.
 *
 * @example
 * ```tsx
 * import { styled } from 'jimu-theme'
 *
 * const StyledButton = styled('button')(({ theme }) => ({
 *   backgroundColor: theme.sys.color.primary.main,
 *   color: theme.sys.color.primary.text,
 *   borderRadius: theme.sys.shape.shape1,
 *   padding: theme.sys.spacing(1, 2),
 *   // ...
 * }))
 * ```
 */
export declare const styled: import("./create-styled").CreatedStyled<IMThemeVariables>;
export { createStyled };
