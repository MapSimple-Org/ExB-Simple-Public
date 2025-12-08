import * as React from 'react';
export declare function useIntersection(ref: React.RefObject<HTMLElement>, rootElement: React.RefObject<HTMLElement>, callback: (isIntersecting: boolean, moveIn: boolean, moveOut: boolean) => void): void;
