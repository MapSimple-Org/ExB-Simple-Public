import { React, hooks } from 'jimu-core';
/**
 * Returns a function to use Intl translation.
 * If no message is passed in, the default message of jimu-ui will be used
 *
 * @deprecated Use `hooks.useTranslation` from `jimu-core` instead.
 */
export declare const useTranslate: (msg1?: {
    [x: string]: string;
}, msg2?: {
    [x: string]: string;
}, msg3?: {
    [x: string]: string;
}) => (id: string, values?: any) => string;
/**
 * A Hook that returns the latest value of render phase, effectively avoiding the closure problem.
 * @param value
 * @returns {React.MutableRefObject<T>}
 *
 * @deprecated Use `hooks.useLatest` from `jimu-core` instead.
 */
export declare const useRefValue: <T>(value: T) => React.MutableRefObject<T>;
/**
 * A Hook that returns the latest value, effectively avoiding the closure problem.
 * @param value
 * @returns {React.MutableRefObject<T>}
 *
 * @deprecated Use `hooks.useLatest` from `jimu-core` instead.
 */
export declare const useLatest: <T>(value: T) => React.RefObject<T>;
/**
  * This will create a new function if the ref props change and are defined.
  *
  * @deprecated Use `hooks.useForkRef` from `jimu-core` instead.
  */
export declare const useForkRef: <T>(refA: React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void), refB: React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void), refC?: React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void)) => (refValue: any) => void;
/**
 * Receives a ref, returns a ref and a callback function to assign values to both refs
 * @param ref
 *
 * @deprecated Use `hooks.useForwardRef` from `jimu-core` instead.
 */
export declare const useForwardRef: <T>(ref: React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void)) => [React.MutableRefObject<T>, (T: any) => void];
/**
 * Receives a ref, return a stateful value and a callback function to assign value to input ref and stateful value.
 * @param ref
 * @ignore
 *
 * example:
 * ```tsx
 * const Component = ({ editorRef }) => {
 *   const [editor, setEditor] = useForwardValueRef(editorRef)
 *
 *   React.useEffect(() => {
 *     editor.on('editor-change', editorChange)
 *     return () => editor.off('editor-change', editorChange)
 *   }, [editor])
 *
 *   return <RichTextEditor editorRef={setNode} />
 * }
 * ```
 */
export declare const useForwardValueRef: <T>(ref: React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void)) => [T, (e: T) => void];
/**
 * Returns true if component is just mounted (on first render) and false otherwise.
 *
 * @deprecated Use `hooks.useFirstMountState` from `jimu-core` instead.
 */
export declare const useFirstMountState: () => boolean;
/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the useEffect hook.
 *
 * @deprecated Use `hooks.useUpdateEffect` from `jimu-core` instead.
 *
 * @param effect
 * @param deps
 */
export declare const useUpdateEffect: (effect: any, deps: any) => void;
/**
 * React lifecycle hook that runs an effect only once.
 *
 * @param effect
 * @deprecated Use `hooks.useEffectOnce` from `jimu-core` instead.
 */
export declare const useEffectOnce: (effect: React.EffectCallback) => void;
/**
 * React lifecycle hook that calls a function when the component will unmount.
 * @param fn
 * @deprecated Use `hooks.useUnmount` from `jimu-core` instead.
 */
export declare const useUnmount: (fn: () => any) => void;
/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 * @param fn
 * @param dependencies
 * Note: Don't call this in the render phase
 *
 * @deprecated Use `hooks.useEventCallback` from `jimu-core` instead.
 */
export declare const useEventCallback: (fn: any) => (...args: any[]) => any;
/**
 * when controlled, use value from prop and don't update value by setValue
 *
 * @deprecated Use `hooks.useControlled` from `jimu-core` instead.
 */
export declare const useControlled: ({ controlled, default: defaultProp }: hooks.UseControlledProps) => any[];
/**
 * Listen if the specified widget is selected
 * @param id
 *
 * @deprecated Use `hooks.useWidgetSelected` from `jimu-core` instead.
 */
export declare const useWidgetSelected: (id: string) => boolean;
/**
 * Listen if the specified widget is selected in the builder
 * @param id
 *
 * @deprecated Use `hooks.useWidgetActived` from `jimu-core` instead.
 */
export declare const useWidgetActived: (id: string) => boolean;
/**
 * Check is mobile env (borwser small size mode) or not
 *
 * @deprecated Use `hooks.useCheckSmallBrowserSizeMode` from `jimu-core` instead.
 */
export declare const useCheckSmallBrowserSizeMode: () => boolean;
/**
 * This hook returns a function named `cancelable`.
 * Input of `cancelable` is a common promise and output of it is a cancelable promise (see jimu-core `cancelablePromise.cancelable` for more details).
 * If components are to unmount, the hook will help to cancel all promises.
 *
 * @deprecated Use `hooks.useCancelablePromiseMaker` from `jimu-core` instead.
 */
export declare const useCancelablePromiseMaker: () => <T>(p: Promise<T>) => import("cancelable-promise").CancelablePromise<T>;
/**
 * apply LinkResult to history
 * @ignore
 */
export declare const useApplyLinkResult: (onClick?: (evt: any) => void) => (...args: any[]) => any;
/**
 * Whether to show classic theme selector.
 * Note: it can be used in builder only for classic theme backward compatibility.
 */
export declare const useClassicThemeSelector: () => boolean;
/**
 * Whether the classic theme is used.
 */
export declare const useClassicTheme: () => boolean;
export declare const useHiddenState: (element: HTMLElement) => any;
