type NonAbstractConstructor<T = object> = new (...args: any[]) => T;
type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;
export type Constructor<T = object> = NonAbstractConstructor<T> | AbstractConstructor<T>;
export {};
