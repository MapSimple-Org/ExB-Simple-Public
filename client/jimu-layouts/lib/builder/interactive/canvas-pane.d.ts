import type { IMThemeVariables } from 'jimu-core';
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
 */
export declare class CanvasPane {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    theme: IMThemeVariables;
    constructor(element: HTMLCanvasElement, theme?: IMThemeVariables);
    setSize(width: number, height: number, ratio?: number): void;
    setColor(color: string): void;
    drawRect(rect: Partial<DOMRect>): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, dashed?: boolean, label?: string): void;
    drawTailedLine(x1: number, y1: number, x2: number, y2: number, dashed?: boolean, label?: string): void;
    drawLabel(x: number, y: number, label: string, isHorizontal?: boolean): void;
    /**
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 2]
     */
    drawRoundRect(x: number, y: number, width: number, height: number, radius?: number): void;
    clear(): void;
}
