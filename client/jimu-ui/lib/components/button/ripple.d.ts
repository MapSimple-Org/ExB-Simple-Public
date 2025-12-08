interface RippleProps {
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * @ignore - injected from TransitionGroup
     */
    in?: boolean;
    /**
     * @ignore - injected from TransitionGroup
     */
    onExited?: () => void;
    /**
     * If `true`, the ripple pulsates.
     */
    pulsate: boolean;
    /**
     * Diameter of the ripple.
     */
    rippleSize: number;
    /**
     * Horizontal position of the ripple center.
     */
    rippleX: number;
    /**
     * Vertical position of the ripple center.
     */
    rippleY: number;
    /**
     * exit delay
     */
    timeout: number;
}
declare function Ripple(props: RippleProps): import("@emotion/react/jsx-runtime").JSX.Element;
export default Ripple;
