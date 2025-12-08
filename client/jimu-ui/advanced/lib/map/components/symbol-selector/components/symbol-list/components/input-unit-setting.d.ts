/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuSymbol } from '../index';
export interface InputUnitSettingProps {
    symbol: JimuSymbol;
    opacityPercentage: number;
    onSymbolChanged?: (symbol: JimuSymbol) => void;
    mode: 'symbol' | 'number';
    onValueChanged?: (value: number) => void;
}
export declare const InputUnitSetting: React.MemoExoticComponent<(props: InputUnitSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
