/**
 * The interface for the shape of the jimu-theme.
 */
export interface Shape {
    /**
     * The shape used for small elements.
     */
    shape1: string;
    /**
     * The shape used for medium elements.
     */
    shape2: string;
    /**
     * The shape used for input fields.
     */
    inputField: string;
}
/**
 * The options for the shape of the jimu-theme.
 */
export type ShapeOptions = Partial<Shape>;
declare const shape: Shape;
export declare const createShape: (options: ShapeOptions) => Shape;
export default shape;
