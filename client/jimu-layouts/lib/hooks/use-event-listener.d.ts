/**
 * Usage
 * // State for storing mouse coordinates
 * const [coords, setCoords] = useState({ x: 0, y: 0 });
 *
 * // Event handler utilizing useCallback ...
 * // ... so that reference never changes.
 * const handler = useCallback(
 *   ({ clientX, clientY }) => {
 *     // Update coordinates
 *     setCoords({ x: clientX, y: clientY });
 *   },
 *   [setCoords]
 * );
 *
 * // Add event listener using our hook
 * useEventListener("mousemove", handler);
 * @param eventName
 * @param handler
 * @param element
 */
export declare const useEventListener: (eventName: string, handler: EventListener, element: HTMLElement) => void;
