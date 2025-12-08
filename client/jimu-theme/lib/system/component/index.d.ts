import type { IMThemeVariables } from 'jimu-core';
import type { Theme } from '../create-theme';
import type { ComponentsVarsOverridesJson, ComponentsOverrides, ComponentOverridesRules, ComponentStyleOverrides } from './overrides';
import type { ComponentNameToPartKey } from './parts';
import type { ComponentsStyleStateList } from './style-states';
import type { ComponentsVarsList } from './vars';
export interface ThemeComponents<T = Theme> extends ComponentsOverrides<T> {
}
export type { ComponentNameToPartKey, ComponentsVarsList, ComponentsStyleStateList, ComponentOverridesRules };
export interface ThemeCompOptions extends ThemeComponents {
}
export interface ThemeVariableCompOptions extends ComponentsVarsOverridesJson {
}
/**
 * The components styles defined in the `theme/style.ts` file to override the component style.
 *
 * @example
 * ```ts
 * // your-theme/style.ts
 * export const Button: ThemeComponentStyleOptions['Button'] = {
 *   root: ({ styleState, theme }) => {
 *     return {
 *       // Your custom styles here
 *     }
 *   }
 * }
 * ```
 */
export type ThemeComponentStyleOptions = {
    [Name in keyof ComponentNameToPartKey]?: ComponentStyleOverrides<Name, IMThemeVariables>;
};
export type * from './overrides';
