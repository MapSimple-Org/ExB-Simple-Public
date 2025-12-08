import { React, IntlProvider, type IMState, ReactRedux, getAppStore, type I18nMessages, type IMThemeVariables, SupportedJSAPILayerTypes, appActions } from 'jimu-core'
import { ThemeProvider, getTheme, setThemeModule, type ThemeModule, ThemeStore, type RawThemeOptions } from 'jimu-theme'
import { render as _render, type RenderOptions, queries as _queries, type RenderResult as _RenderResult } from '@testing-library/react'
import type { Store } from 'redux'
import * as customQueries from './custom-queries'
import type { MockItemData } from './mock-item'
import mockTheme from './theme-mock'
import { getDefaultAppConfig, getInitState } from './init-state'
const queries = { ..._queries, ...customQueries }

/** The RenderResult type */
export type RenderResult = _RenderResult<typeof queries>

/** The render result type */
export type WithRenderResult = (ui: any, options?: RenderOptions<typeof queries>) => RenderResult

/** The render method used to render components. */
export const render: WithRenderResult = (ui, options) => {
  return _render<typeof queries>(ui, { queries, ...options })
}

export const getStoreWithInitState = (needInit: boolean) => {
  if (needInit) {
    getAppStore().dispatch(appActions.updateStoreState(getInitState().set('appConfig', getDefaultAppConfig())))
  }
  return getAppStore()
}
/**
 * Create a wrapper with `ThemeProvider` and `IntlProvider`.
 * @param theme
 * @param locale
 * @param messages
 */
export const ThemeIntlWrapper = (theme: IMThemeVariables, locale: string, messages: I18nMessages, theme2?: IMThemeVariables) => {
  return ({ children }) => {
    return (
      <ThemeProvider theme={theme} theme2={theme2}>
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </ThemeProvider>
    )
  }
}

/**
 * Create a wrapper with `ThemeProvider`.
 * @param theme
 */
export const ThemeWrapper = (theme: IMThemeVariables, theme2?: IMThemeVariables) => {
  return ({ children }) => {
    return (
      <ThemeProvider theme={theme} theme2={theme2}>
        {children}
      </ThemeProvider>
    )
  }
}

/**
 * Create a wrapper with `IntlProvider`.
 * @param locale
 * @param messages
 */
export const IntlWrapper = (locale: string, messages: I18nMessages) => {
  return ({ children }) => {
    return (
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    )
  }
}

/**
 * Create a wrapper with `ReactRedux.Provider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 */
export const StoreWrapper = (store: Store<IMState>) => {
  return ({ children }) => {
    return (
      <ReactRedux.Provider store={store}>
        {children}
      </ReactRedux.Provider>
    )
  }
}

/**
 * Create a wrapper with `ReactRedux.Provider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param locale
 * @param messages
 */
export const StoreIntlWrapper = (store: Store<IMState>, locale: string, messages: I18nMessages) => {
  locale = locale || store.getState().appContext?.locale || 'en'
  messages = messages || store.getState().appI18nMessages || {}

  return ({ children }) => {
    return (
      <ReactRedux.Provider store={store}>
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </ReactRedux.Provider>
    )
  }
}

/**
 * Create a wrapper with `ReactRedux.Provider` and `ThemeProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 */
export const StoreThemeWrapper = (store: Store<IMState>, theme: IMThemeVariables, theme2?: IMThemeVariables) => {
  theme = theme || getTheme() || mockTheme

  return ({ children }) => {
    return (
      <ReactRedux.Provider store={store}>
        <ThemeProvider theme={theme} theme2={theme2}>
          {children}
        </ThemeProvider>
      </ReactRedux.Provider>
    )
  }
}

/**
 * Create a wrapper with `ReactRedux.Provider`, `ThemeProvider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 * @param locale
 * @param messages
 */
export const StoreThemeIntlWrapper = (store: Store<IMState>, theme: IMThemeVariables, locale: string, messages: I18nMessages, theme2?: IMThemeVariables) => {
  locale = locale || store.getState().appContext?.locale || 'en'
  messages = messages || store.getState().appI18nMessages || {}
  theme = theme || getTheme() || mockTheme

  return ({ children }) => {
    return (
      <ReactRedux.Provider store={store}>
        <ThemeProvider theme={theme} theme2={theme2}>
          <IntlProvider locale={locale} messages={messages}>
            {children}
          </IntlProvider>
        </ThemeProvider>
      </ReactRedux.Provider>
    )
  }
}

/**
 * Create a custom render function with `ThemeProvider` and `IntlProvider`.
 * @param theme
 * @param locale
 * @param messages
 */
export const withThemeIntlRender = (theme = mockTheme, locale: string = 'en', messages: I18nMessages = {}, theme2?: IMThemeVariables): WithRenderResult => {
  ThemeStore.setModule(getTestThemeModule(theme))
  theme2 && ThemeStore.setModule2(getTestThemeModule(theme2, 'theme2/test'))
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: ThemeIntlWrapper(theme, locale, messages, theme2), ...options })
}

/**
 * Create a custom render function with `ThemeProvider`.
 * @param theme
 */
export const withThemeRender = (theme: IMThemeVariables = mockTheme, theme2?: IMThemeVariables): WithRenderResult => {
  ThemeStore.setModule(getTestThemeModule(theme))
  theme2 && ThemeStore.setModule2(getTestThemeModule(theme2, 'theme2/test'))
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: ThemeWrapper(theme, theme2), ...options })
}

/**
 * Create a custom render function with `IntlProvider`.
 * @param locale
 * @param messages
 */
export const withIntlRender = (locale: string = 'en', messages = {}): WithRenderResult => {
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: IntlWrapper(locale, messages), ...options })
}

/**
 * Create a custom render function with `ReactRedux.Provider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 */
export const withStoreRender = (needsStoreInit: boolean = false): WithRenderResult => {
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: StoreWrapper(getStoreWithInitState(needsStoreInit)), ...options })
}

/**
 * Create a custom render function with `ReactRedux.Provider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param locale
 * @param messages
 */
export const withStoreIntlRender = (needsStoreInit: boolean = false, locale?: string, messages?: I18nMessages): WithRenderResult => {
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: StoreIntlWrapper(getStoreWithInitState(needsStoreInit), locale, messages), ...options })
}

/**
 * Create a custom render function with `ReactRedux.Provider` and `ThemeProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 */
export const withStoreThemeRender = (needsStoreInit: boolean = false, theme: IMThemeVariables = mockTheme, theme2?: IMThemeVariables): WithRenderResult => {
  ThemeStore.setModule(getTestThemeModule(theme))
  theme2 && ThemeStore.setModule2(getTestThemeModule(theme2, 'theme2/test'))
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: StoreThemeWrapper(getStoreWithInitState(needsStoreInit), theme, theme2), ...options })
}

/**
 * Create a custom render function with `ReactRedux.Provider`, `ThemeProvider` and `IntlProvider`.
 * @param needsStoreInit Whether the store state needs to be initialized. NOTE: This will reset the previously state.
 * @param theme
 * @param locale
 * @param messages
 */
export const withStoreThemeIntlRender = (needsStoreInit: boolean = false, theme?: IMThemeVariables, locale?: string, messages?: I18nMessages, theme2?: IMThemeVariables): WithRenderResult => {
  ThemeStore.setModule(getTestThemeModule(theme))
  theme2 && ThemeStore.setModule2(getTestThemeModule(theme2, 'theme2/test'))
  return (ui, options?: RenderOptions<typeof queries>) => render(ui, { wrapper: StoreThemeIntlWrapper(getStoreWithInitState(needsStoreInit), theme, locale, messages, theme2), ...options })
}

/**
 * Used to render a widget component.
 */
export const widgetRender = withStoreThemeIntlRender

/**
 * Used to render a widget setting component.
 */
export const widgetSettingRender = withStoreThemeIntlRender

/**
 * Create a function to run the passed function asynchronously.
 * @param timeout
 * @param useFakeTimers
 */
export const runFuncAsync = (timeout: number = 0, useFakeTimers?: boolean) => (callback, ...args) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(callback.apply(null, args))
      } catch (error) {
        reject(new Error(error))
      }
    }, timeout)
    useFakeTimers && jest.runOnlyPendingTimers()
  })
}

/**
 * Return a promise to resolve a value after waiting a certain number of milliseconds.
 * @param milliseconds
 * @param value
 */
export const waitForMilliseconds = (milliseconds = 0, value?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(value) }, milliseconds)
  })
}

/**
 * Determine whether a component is a Class component.
 */
export function isClassComponent (component) {
  return typeof component === 'function' && !!component.prototype?.isReactComponent
}

const getTestThemeModule = (theme: IMThemeVariables, uri = 'theme/test'): ThemeModule => ({
  uri,
  manifest: { styleFiles: { js: true } } as any,
  variables: {} as RawThemeOptions,
  theme
})

/**
 * Update the currently used theme for getTheme.
 * @param theme
 */
export const setTheme = (theme: IMThemeVariables) => {
  const module: ThemeModule = getTestThemeModule(theme)
  setThemeModule(module)
}

/**
* Update the currently used theme2 for getTheme2.
* @ignore
* @param theme
*/
export const setTheme2 = (theme: IMThemeVariables) => {
  const module: ThemeModule = getTestThemeModule(theme)
  ThemeStore.setModule2(module)
}

export function mockJSAPIMap (needToMockMapItems: { [itemId: string]: MockItemData }) {
  return jest.fn().mockImplementation(options => {
    const mapItem = needToMockMapItems[options.portalItem?.id]
    const mapInstance = {
      isFulfilled: () => true,
      layers: {
        toArray: () => {
          if (!mapItem) {
            return []
          }
          return mapItem.itemData.operationalLayers.map(l => mockJSAPILayerInstance(l))
        }
      },
      tables: {
        toArray: () => []
      },
      ground: {
        layers: {
          toArray: () => ([])
        }
      },
      when: async func => {
        return await func()
      }
    } as any
    mapInstance.allLayers = mapInstance.layers
    return mapInstance
  })
}

/**
 * @param needToMockLayers key is layer id, value is operational layer of map item data
 */
export function mockJSAPILayer (needToMockLayers: { [layerId: string]: any }) {
  return jest.fn().mockImplementation(options => {
    const layer = Object.values(needToMockLayers).find(l => l.url === options.url)
    return { ...options, ...mockJSAPILayerInstance(layer) }
  })
}

/**
 * @param layer operational layer of map item data
 */
export function mockJSAPILayerInstance (layer) {
  if (!layer) {
    return null
  }

  if (layer.layerType === 'ArcGISFeatureLayer') {
    layer.type = SupportedJSAPILayerTypes.FeatureLayer
  } else if (layer.layerType === 'GroupLayer') {
    layer.type = SupportedJSAPILayerTypes.GroupLayer
  } else if (layer.layerType === 'ArcGISMapServiceLayer') {
    layer.type = SupportedJSAPILayerTypes.MapImageLayer
  } else if (layer.layerType === 'ArcGISSceneServiceLayer') {
    layer.type = SupportedJSAPILayerTypes.SceneLayer
  }
  const layerInstance = {
    ...layer,
    portalItem: {
      id: layer.itemId
    },
    load: () => Promise.resolve(null),
    loadAll: () => Promise.resolve(null),
    fields: layer.layerDefinition?.fields?.map(f => ({ toJSON: () => f })) || [],
    sourceJSON: layer.layerDefinition,
    queryFeatures: () => Promise.resolve({}),
    queryFeatureCount: Promise.resolve({}),
    applyEdits: Promise.resolve({}),
    layers: {
      toArray: () => {
        if (!layer.layers) {
          return []
        }
        return layer.layers.map(l => mockJSAPILayerInstance(l))
      }
    },
    sublayers: {
      toArray: () => []
    }
  }
  return layerInstance
}
