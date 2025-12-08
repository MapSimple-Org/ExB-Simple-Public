/** @jsx jsx */
import { React } from 'jimu-core';
import { DistanceUnits, type LinearUnit } from 'jimu-ui';
interface Props {
    className?: string;
    style?: React.CSSProperties;
    min?: number;
    max?: number;
    value: string;
    disabled?: boolean;
    'aria-label'?: string;
    onChange?: (value: string) => void;
}
export declare const convertREMToPX: (rem: string) => number;
export declare const convertVWToPX: (vw: number, windowWidth: number) => number;
export declare const convertPXToREM: (px: number) => number;
export declare const convertVWToREM: (vw: number, windowWidth: number) => number;
export declare const convertPXToVW: (px: number, windowWidth: number) => number;
export declare const convertREMToVW: (rem: number, windowWidth: number) => number;
/**
 * Intercept decimal places
 * @param number
 */
export declare const interceptDecimalPlaces: (number: number, decimalNumber?: number) => string;
/**
 * Converts a value for a specified unit
 * @param value
 * @param target
 * @param windowWidth
 * @returns
 */
export declare const convertValue: (value: LinearUnit, target: DistanceUnits, windowWidth?: number) => number;
/**
 * Components used to set size and switch units in rich text editor
 */
export declare const Size: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
