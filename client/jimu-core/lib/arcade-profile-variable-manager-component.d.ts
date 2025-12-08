/** @jsx jsx */
import * as React from 'react';
import type { IMUseDataSource } from './types/app-config';
import ArcadeProfileVariableManager from './arcade-profile-variable-manager';
interface ArcadeProfileVariableManagerComponentState {
    useDataSources: IMUseDataSource[];
}
/**
 * ArcadeProfileVariableManagerComponent is used to monitor various events of the data sources used by Arcade in the app.
 */
export default class ArcadeProfileVariableManagerComponent extends React.PureComponent<any, ArcadeProfileVariableManagerComponentState> {
    arcadeManager: ArcadeProfileVariableManager;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    /**
     * Update useDataSources by ArcadeProfileVariableManager.
     * @param useDataSources
     */
    setUseDataSources(useDataSources: IMUseDataSource[]): void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
