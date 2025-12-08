/**
 * Check if the event should be ignored according to the target element
 * @param event
 * @returns
 */
declare const isIgnoreEvent: (event: React.KeyboardEvent | KeyboardEvent) => boolean;
export default isIgnoreEvent;
