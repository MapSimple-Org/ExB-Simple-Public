export type Breakpoint = 'sm' | 'md';
/**
 * The breakpoints interface.
 */
export interface Breakpoints {
    /**
     * The keys of the breakpoints.
     */
    keys: Breakpoint[];
    /**
     * Each breakpoint (a key) matches with a fixed screen width (a value).
     * The breakpoint **start** at this value. For instance with the first breakpoint xs: [sm, md).
     */
    values: {
        [key in Breakpoint]?: number;
    };
    /**
     * @param key - A breakpoint key (`sm`, `md`, etc.) or a screen width number in px.
     * @returns A media query string ready to be used with most styling solutions, which matches screen widths greater than the screen size given by the breakpoint key (inclusive).
     */
    up: (key: Breakpoint | number) => string;
    /**
     * @param key - A breakpoint key (`sm`, `md`, etc.) or a screen width number in px.
     * @returns A media query string ready to be used with most styling solutions, which matches screen widths less than the screen size given by the breakpoint key (exclusive).
     */
    down: (key: Breakpoint | number) => string;
    /**
     * @param start - A breakpoint key (`sm`, `md`, etc.) or a screen width number in px.
     * @param end - A breakpoint key (`sm`, `md`, etc.) or a screen width number in px.
     * @returns A media query string ready to be used with most styling solutions, which matches screen widths greater than
     *          the screen size given by the breakpoint key in the first argument (inclusive) and less than the screen size given by the breakpoint key in the second argument (exclusive).
     */
    between: (start: Breakpoint | number, end: Breakpoint | number) => string;
    /**
     * @param key - A breakpoint key (`sm`, `md`, etc.) or a screen width number in px.
     * @returns A media query string ready to be used with most styling solutions, which matches screen widths starting from
     *          the screen size given by the breakpoint key (inclusive) and stopping at the screen size given by the next breakpoint key (exclusive).
     */
    only: (key: Breakpoint) => string;
    /**
     * @param key - A breakpoint key (`sm`, `md`, etc.).
     * @returns A media query string ready to be used with most styling solutions, which matches screen widths stopping at
     *          the screen size given by the breakpoint key (exclusive) and starting at the screen size given by the next breakpoint key (inclusive).
     */
    not: (key: Breakpoint) => string;
    /**
     * The unit used for the breakpoint's values.
     * @default px
     */
    unit?: string | undefined;
}
export interface BreakpointsOptions extends Pick<Breakpoints, 'values' | 'unit'> {
}
export declare const createBreakpoints: (breakpoints: BreakpointsOptions) => Breakpoints;
