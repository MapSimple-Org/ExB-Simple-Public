export declare class Timeout {
    static create(): Timeout;
    startTime: number;
    currentId: ReturnType<typeof setTimeout> | null;
    /**
     * Executes `fn` after `delay`, clearing any previously scheduled call.
     */
    start(delay: number, fn: () => any): void;
    clear: () => void;
    disposeEffect: () => () => void;
}
export declare function useTimeout(): Timeout;
