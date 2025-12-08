export interface Subscription {
    unsubscribe: () => void;
}
export type Monitor = (eventName: string, matched: boolean, event: KeyboardEvent) => void;
export type KeyboardEventHandler = (event: KeyboardEvent) => void | boolean;
export interface KeyboardListener {
    /**
     * Creates a subscription and returns the unsubscribe function
     */
    subscribe: (name: string, callback: KeyboardEventHandler) => Subscription;
    /**
     * Allows to set a monitor function that will run on every event
     */
    setMonitor: (monitor: Monitor) => void;
    /**
     * Add the event listener to the element
     */
    startListening: () => void;
    /**
     * Remove the event listener from the element
     */
    stopListening: () => void;
    /**
     * Set the keyboard trigger function to be called on every event
     */
    setKeyboardTriggerFunction: (keyboardTriggerFunction: KeyboardEventHandler) => void;
}
declare function createListener(listenForEvent?: string, element?: HTMLElement | Document): KeyboardListener;
export default createListener;
