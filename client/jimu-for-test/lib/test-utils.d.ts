import { type IMState, type I18nMessages, type IMThemeVariables } from 'jimu-core';
import { type RenderOptions, queries as _queries, type RenderResult as _RenderResult } from '@testing-library/react';
import type { Store } from 'redux';
import type { MockItemData } from './mock-item';
declare const queries: {
    queryAllBySelector: (...args: any[]) => HTMLElement[];
    queryBySelector: import("@testing-library/react").QueryBy<any[]>;
    getAllBySelector: import("@testing-library/react").GetAllBy<any[]>;
    getBySelector: import("@testing-library/react").GetBy<any[]>;
    findBySelector: import("@testing-library/react").FindAllBy<any[]>;
    getByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.GetByText<T>>;
    getAllByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.AllByText<T>>;
    queryByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.QueryByText<T>>;
    queryAllByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.AllByText<T>>;
    findByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByText<T>>;
    findAllByLabelText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByText<T>>;
    getByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.GetByBoundAttribute<T>>;
    getAllByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    queryByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.QueryByBoundAttribute<T>>;
    queryAllByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    findByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByBoundAttribute<T>>;
    findAllByPlaceholderText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByBoundAttribute<T>>;
    getByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.GetByText<T>>;
    getAllByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.AllByText<T>>;
    queryByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.QueryByText<T>>;
    queryAllByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions): ReturnType<_queries.AllByText<T>>;
    findByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByText<T>>;
    findAllByText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").SelectorMatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByText<T>>;
    getByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.GetByBoundAttribute<T>>;
    getAllByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    queryByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.QueryByBoundAttribute<T>>;
    queryAllByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    findByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByBoundAttribute<T>>;
    findAllByAltText<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByBoundAttribute<T>>;
    getByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.GetByBoundAttribute<T>>;
    getAllByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    queryByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.QueryByBoundAttribute<T>>;
    queryAllByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    findByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByBoundAttribute<T>>;
    findAllByTitle<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByBoundAttribute<T>>;
    getByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.GetByBoundAttribute<T>>;
    getAllByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    queryByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.QueryByBoundAttribute<T>>;
    queryAllByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    findByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByBoundAttribute<T>>;
    findAllByDisplayValue<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByBoundAttribute<T>>;
    getByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions): ReturnType<_queries.GetByRole<T>>;
    getAllByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions): ReturnType<_queries.AllByRole<T>>;
    queryByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions): ReturnType<_queries.QueryByRole<T>>;
    queryAllByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions): ReturnType<_queries.AllByRole<T>>;
    findByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByRole<T>>;
    findAllByRole<T extends HTMLElement = HTMLElement>(container: HTMLElement, role: import("@testing-library/react").ByRoleMatcher, options?: _queries.ByRoleOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByRole<T>>;
    getByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.GetByBoundAttribute<T>>;
    getAllByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    queryByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.QueryByBoundAttribute<T>>;
    queryAllByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions): ReturnType<_queries.AllByBoundAttribute<T>>;
    findByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindByBoundAttribute<T>>;
    findAllByTestId<T extends HTMLElement = HTMLElement>(container: HTMLElement, id: import("@testing-library/react").Matcher, options?: import("@testing-library/react").MatcherOptions, waitForElementOptions?: import("@testing-library/react").waitForOptions): ReturnType<_queries.FindAllByBoundAttribute<T>>;
};
/** The RenderResult type */
export type RenderResult = _RenderResult<typeof queries>;
/** The render result type */
export type WithRenderResult = (ui: any, options?: RenderOptions<typeof queries>) => RenderResult;
/** The render method used to render components. */
export declare const render: WithRenderResult;
export declare const getStoreWithInitState: (needInit: boolean) => Store<IMState, import("redux").UnknownAction, unknown>;
/**
 * Create a wrapper with `ThemeProvider` and `IntlProvider`.
 * @param theme
 * @param locale
 * @param messages
 */
export declare const ThemeIntlWrapper: (theme: IMThemeVariables, locale: string, messages: I18nMessages, theme2?: IMThemeVariables) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `ThemeProvider`.
 * @param theme
 */
export declare const ThemeWrapper: (theme: IMThemeVariables, theme2?: IMThemeVariables) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `IntlProvider`.
 * @param locale
 * @param messages
 */
export declare const IntlWrapper: (locale: string, messages: I18nMessages) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `ReactRedux.Provider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 */
export declare const StoreWrapper: (store: Store<IMState>) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `ReactRedux.Provider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param locale
 * @param messages
 */
export declare const StoreIntlWrapper: (store: Store<IMState>, locale: string, messages: I18nMessages) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `ReactRedux.Provider` and `ThemeProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 */
export declare const StoreThemeWrapper: (store: Store<IMState>, theme: IMThemeVariables, theme2?: IMThemeVariables) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a wrapper with `ReactRedux.Provider`, `ThemeProvider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 * @param locale
 * @param messages
 */
export declare const StoreThemeIntlWrapper: (store: Store<IMState>, theme: IMThemeVariables, locale: string, messages: I18nMessages, theme2?: IMThemeVariables) => ({ children }: {
    children: any;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Create a custom render function with `ThemeProvider` and `IntlProvider`.
 * @param theme
 * @param locale
 * @param messages
 */
export declare const withThemeIntlRender: (theme?: IMThemeVariables, locale?: string, messages?: I18nMessages, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Create a custom render function with `ThemeProvider`.
 * @param theme
 */
export declare const withThemeRender: (theme?: IMThemeVariables, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Create a custom render function with `IntlProvider`.
 * @param locale
 * @param messages
 */
export declare const withIntlRender: (locale?: string, messages?: {}) => WithRenderResult;
/**
 * Create a custom render function with `ReactRedux.Provider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 */
export declare const withStoreRender: (needsStoreInit?: boolean) => WithRenderResult;
/**
 * Create a custom render function with `ReactRedux.Provider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param locale
 * @param messages
 */
export declare const withStoreIntlRender: (needsStoreInit?: boolean, locale?: string, messages?: I18nMessages) => WithRenderResult;
/**
 * Create a custom render function with `ReactRedux.Provider` and `ThemeProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 */
export declare const withStoreThemeRender: (needsStoreInit?: boolean, theme?: IMThemeVariables, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Create a custom render function with `ReactRedux.Provider`, `ThemeProvider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 * @param locale
 * @param messages
 */
export declare const withStoreThemeIntlRender: (needsStoreInit?: boolean, theme?: IMThemeVariables, locale?: string, messages?: I18nMessages, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Used to render a widget component.
 */
export declare const widgetRender: (needsStoreInit?: boolean, theme?: IMThemeVariables, locale?: string, messages?: I18nMessages, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Used to render a widget setting component.
 */
export declare const widgetSettingRender: (needsStoreInit?: boolean, theme?: IMThemeVariables, locale?: string, messages?: I18nMessages, theme2?: IMThemeVariables) => WithRenderResult;
/**
 * Create a function to run the passed function asynchronously.
 * @param timeout
 * @param useFakeTimers
 */
export declare const runFuncAsync: (timeout?: number, useFakeTimers?: boolean) => (callback: any, ...args: any[]) => Promise<unknown>;
/**
 * Return a promise to resolve a value after waiting a certain number of milliseconds.
 * @param milliseconds
 * @param value
 */
export declare const waitForMilliseconds: (milliseconds?: number, value?: any) => Promise<unknown>;
/**
 * Determine whether a component is a Class component.
 */
export declare function isClassComponent(component: any): boolean;
/**
 * Update the currently used theme for getTheme.
 * @param theme
 */
export declare const setTheme: (theme: IMThemeVariables) => void;
/**
* Update the currently used theme2 for getTheme2.
* @ignore
* @param theme
*/
export declare const setTheme2: (theme: IMThemeVariables) => void;
export declare function mockJSAPIMap(needToMockMapItems: {
    [itemId: string]: MockItemData;
}): jest.Mock<any, any, any>;
/**
 * @param needToMockLayers key is layer id, value is operational layer of map item data
 */
export declare function mockJSAPILayer(needToMockLayers: {
    [layerId: string]: any;
}): jest.Mock<any, any, any>;
/**
 * @param layer operational layer of map item data
 */
export declare function mockJSAPILayerInstance(layer: any): any;
export {};
