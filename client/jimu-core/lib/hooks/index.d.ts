/**
 * Some common hooks for widget and component development.
 * @module
 */
import * as React from 'react';
import * as cancelablePromise from 'cancelable-promise';
import { type DebouncedFunc, type DebounceSettings } from 'lodash-es';
export interface UseControlledProps {
    /**
     * This prop contains the component value when it's controlled.
     */
    controlled: any;
    /**
     * The default value.
     */
    default?: any;
}
type RefValue<T> = React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void);
/**
 * Returns a function to use Intl translation.
 * If no message is passed in, the default message of `jimu-core` will be used
 *
 * example:
 * ```tsx
 * const translate = useTranslate(jimucoreMessages, widgetMessages)
 * translate('ok')
 * ```
 */
export declare const useTranslation: (msg1?: {
    [x: string]: string;
}, msg2?: {
    [x: string]: string;
}, msg3?: {
    [x: string]: string;
}) => (id: string, values?: any) => string;
/**
 * A Hook that returns the latest value, effectively avoiding the closure problem.
 * @param value
 * @returns {React.MutableRefObject<T>}
 *
 * example:
 * ```tsx
 * const valueRef = useLatest(value)
 *
 * React.useEffect(() => {
 *  console.log(valueRef.current)
 * }, [valueRef])
 * ```
 */
export declare const useLatest: <T>(value: T) => React.RefObject<T>;
/**
 * This will create a new function to assign value to both input refs.
 *
 * example:
 * ```tsx
 * const Component = React.forwardRef((props, ref) => {
 *   const nodeRef = React.useRef(null)
 *   const handleRef = useForwardRef(ref, nodeRef)
 *
 *   return <div ref={handleRef} />
 * })
 * ```
 */
export declare const useForkRef: <T>(refA: RefValue<T>, refB: RefValue<T>, refC?: RefValue<T>) => (refValue: any) => void;
/**
 * Receives a ref, returns a ref and a callback function to assign value to both refs.
 * @param ref
 *
 * example:
 * ```tsx
 * const Component = React.forwardRef((props, ref) => {
 *   const [nodeRef, handleRef] = useForwardRef(ref)
 *
 *   return <div ref={handleRef} />
 * })
 * ```
 */
export declare const useForwardRef: <T>(ref: RefValue<T>) => [React.MutableRefObject<T>, (T: any) => void];
/**
 * Returns true if component is just mounted (on first render) and false otherwise.
 *
 * example:
 * ```tsx
 * const Component = () => {
 *  const isFirstMount = useFirstMountState()
 *  if (isFirstMount) {
 *   console.log('first mount')
 *  }
 *  return <div />
 * }
 * ```
 */
export declare const useFirstMountState: () => boolean;
/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the useEffect hook.
 *
 * example:
 * ```tsx
 * const Component = ({ value }) => {
 *  useUpdateEffect(() => {
 *    console.log('update')
 *  }, [value])
 *
 * return <div />
 *
 * @param effect
 * @param deps
 */
export declare const useUpdateEffect: (effect: any, deps: any) => void;
/**
 * React lifecycle hook that runs an effect only once.
 * @param effect
 *
 * example:
 * ```tsx
 * const Component = () => {
 *  useEffectOnce(() => {
 *    console.log('mount')
 *  })
 * return <div />
 */
export declare const useEffectOnce: (effect: React.EffectCallback) => void;
/**
 * React lifecycle hook that calls a function when the component will unmount.
 * @param fn
 *
 * example:
 * ```tsx
 * const Component = () => {
 *  useUnmount(() => {
 *    console.log('unmount')
 *  })
 * return <div />
 */
export declare const useUnmount: (fn: () => any) => void;
/**
 * A hook used to memoize a function that is used as a callback.
 * Used if you want create a memoized callback with multiple dependencies.
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 * @param fn
 * @param dependencies
 * Note: Don't call this in the render phase
 *
 * example:
 * ```tsx
 * const Component = ({ foo, bar }) => {
 *   const handleChange = useEventCallback(() => {
 *      console.log(foo, bar)
 *   })
 *  return <Subcomponent onChange={handleClick} />
 */
export declare const useEventCallback: (fn: any) => (...args: any[]) => any;
/**
 * A hook used to support controlled and uncontrolled components.
 * when controlled, use value from props, otherwise use value from state and update value by setState.
 *
 * example:
 * ```tsx
 * const Component = ({ value: propValue, defaultValue }) => {
 *   const [value, setValue] = useControlled({ controlled: propValue, default: defaultValue })
 *
 * return <Subcomponent onChange={setValue} value={value} />
 */
export declare const useControlled: ({ controlled, default: defaultProp }: UseControlledProps) => any[];
/**
 * A hook used to check if the specified widget is selected.
 * @param id
 *
 * example:
 * ```tsx
 * const Widget = ({ id }) => {
 *  const isSelected = useWidgetSelected(id)
 * return <div className={isSelected ? 'selected' : ''} />
 */
export declare const useWidgetSelected: (id: string) => boolean;
/**
 * A hook used to check if the specified widget is actived.
 * @param id
 *
 * example:
 * ```tsx
 * const Widget = ({ id }) => {
 * const active = useWidgetActived(id)
 * return <div className={active ? 'active' : ''} />
 */
export declare const useWidgetActived: (id: string) => boolean;
/**
 * A hook used to check if the app is in small browser size mode.
 *
 * example:
 * ```tsx
 * const Widget = () => {
 * const isMobile = useCheckSmallBrowserSizeMode()
 * return <>{isMobile ? <MobileView /> : <DesktopView />}</>
 */
export declare const useCheckSmallBrowserSizeMode: () => boolean;
/**
 * This hook returns a function named `cancelable`.
 * Input of `cancelable` is a common promise and output of it is a cancelable promise (see jimu-core `cancelablePromise.cancelable` for more details).
 * If components are to unmount, the hook will help to cancel all promises.
 *
 * example:
 * ```tsx
 * const Component = () => {
 * const cancelable = useCancelablePromiseMaker()
 * const [data, setData] = useState()
 * useEffect(() => {
 *   const promise = cancelable(fetchData())
 *    promise.then((data) => {
 *      setData(data)
 *    })
 *    }, [])
 * return <div />
 */
export declare const useCancelablePromiseMaker: () => <T>(p: Promise<T>) => cancelablePromise.CancelablePromise<T>;
/**
 * A Hook that returns the previous value.
 * @param value
 * @returns { T | undefined }
 *
 * example:
 * ```tsx
 * const prevValue = usePrevious(value)
 *
 * React.useEffect(() => {
 *  console.log(prevValue)
 * }, [value])
 * ```
 */
export declare const usePrevious: <T>(value: T) => T | undefined;
/**
 * Wrapper of useEffect, the callback can get the previous values of dependencies.
 * @param callback
 * @param dependencies dependencies must be a non-empty array and the length should not change
 *
 * example:
 * ```tsx
 * const [count, setCount] = useState(0)
 * const [opened, setOpened] = useState(false)
 *
 * useEffectWithPreviousValues((preValues) => {
 *   const [preCount, preOpened] = preValues
 *
 *   if (count !== preCount) {
 *     console.log('count changes')
 *   }
 *
 *   if (opened !== preOpened) {
 *     console.log('opened changes')
 *   }
 * }, [count, opened)
 * ```
 */
export declare const useEffectWithPreviousValues: (callback: (preValues: readonly unknown[]) => void, dependencies: readonly unknown[]) => void;
/**
 *  Custom hook for debouncing a callback function
 * @param {T} fn - The callback function to be debounced.
 * @param {number} delay - The delay in milliseconds before the callback is invoked (default is `200` milliseconds).
 * @param {DebounceSettings} [options] - Options to control the behavior of the debounced function.
 *
 * example:
 * ```tsx
 * const Component = (props) => {
 *   const handleChange = useDebounceCallback((evt) => {
 *      console.log(evt.target.value)
 *   }, 200)
 *  return <Subcomponent onChange={handleClick} />
 *
 */
export declare const useDebounceCallback: <T extends (...args: any[]) => any>(fn: T, delay?: number, options?: DebounceSettings) => DebouncedFunc<T>;
/**
 * Use `loadModule` to dynamically load a module from an entry, returning an array where the first item indicates whether it has been loaded and the second item is the loaded module.
 * @param {string} entry
 *
 * @ignore
 *
 * example:
 * ```tsx
 * import type * as FooModule from 'jimu-ui/foo'
 * const Component = (props) => {
 *  const [loaded, LoadedModule] = useLoadedModuleComponent<typeof FooModule>('jimu-ui/foo')
 *  return <>{loaded && <LoadedModule.Component /> }</>
 * }
 */
export declare const useLoadedModule: <T>(entry: string) => [boolean, T];
/**
 * Use `loadModule` to dynamically load a component from an entry, returning an array where the first item indicates whether it has been loaded and the second item is the loaded component.
 * @param {string} entry
 * @param {string} name
 *
 * @ignore
 *
 * example:
 * ```tsx
 * import type * as FooModule from 'jimu-ui/foo'
 * const Component = (props) => {
 *  const [loaded, Component] = useLoadedModuleComponent<typeof FooModule.Component, typeof FooModule>('jimu-ui/foo', 'Component')
 *  return <>{loaded && <Component /> }</>
 * }
 */
export declare const useLoadedModuleComponent: <T, E>(entry: string, name: string) => [boolean, T];
/**
 * Dynamically load a module from ArcGIS Maps SDK for JavaScript, returning an array where the first item indicates whether it has been loaded and the second item is the loaded module.
 * @param name
 *
 * example:
 * ```tsx
 * const Component = (props) => {
 *  const [loaded, kernelModule] = useLoadArcGISJSAPIModule<__esri.kernel>('esri/kernel')
 *  if (loaded && kernelModule) {
 *    console.log('API version', kernelModule.version)
 *  }
 * }
 * ```
 */
export declare const useLoadArcGISJSAPIModule: <T>(name: string) => [boolean, T];
/**
 * Dynamically load ArcGIS Maps SDK for JavaScript, returning a boolean value. If the return value is true, it means the API has been loaded.
 *
 * example:
 * ```tsx
 * const Component = (props) => {
 *  const loaded = useLoadArcGISJSAPI()
 *  if (loaded) {
 *    console.log('ArcGIS JavaScript API loaded')
 *  }
 * }
 * ```
 */
export declare const useLoadArcGISJSAPI: () => boolean;
/**
 * Dynamically load ArcgisArcadeEditor. This hook will also load core API which is required for ArcgisArcadeEditor.
 *
 * example:
 * ```tsx
 * const Component = (props) => {
 *  const isArcgisArcadeEditorLoaded = useArcgisArcadeEditor()
 *
 *  return (
 *    <div>
 *      {
 *        isArcgisArcadeEditorLoaded &&
 *        <arcgis-arcade-editor ... />
 *      }
 *    </div>
 *  )
 * }
 * ```
 */
export declare const useArcgisArcadeEditor: () => boolean;
export {};
