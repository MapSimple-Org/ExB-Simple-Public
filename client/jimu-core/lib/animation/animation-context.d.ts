import * as React from 'react';
import type { AnimationPlayMode, AnimationSetting } from './types';
export declare const AnimationContext: React.Context<AnimationContextProps>;
export interface AnimationContextProps {
    setting?: AnimationSetting;
    playId?: number;
    delay?: number;
    revert?: boolean;
    variants?: any;
    oid?: string | string[];
    playMode?: AnimationPlayMode;
    onContextAnimationEnd?: () => void;
}
