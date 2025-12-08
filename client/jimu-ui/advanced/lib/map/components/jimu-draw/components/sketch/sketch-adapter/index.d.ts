/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuSketchProps } from '../index';
import { CreateToolActions, SelectToolActions, type JimuDrawCreatedDescriptor, type DrawingUpdatedDescriptor } from '../constraints';
export { CreateToolActions, SelectToolActions };
export type { DrawingUpdatedDescriptor, JimuDrawCreatedDescriptor };
export declare const SketchAdapter: React.MemoExoticComponent<(props: (JimuSketchProps)) => import("@emotion/react/jsx-runtime").JSX.Element>;
