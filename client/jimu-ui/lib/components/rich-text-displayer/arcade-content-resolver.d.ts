import React from 'react';
import { type IMArcadeContentConfigMap } from 'jimu-core';
interface ArcadeContentResolverProps {
    arcades: IMArcadeContentConfigMap;
    widgetId: string;
    useDataSources: any;
    setArcadeValues: (values: any) => void;
    others: any;
}
declare const ArcadeContentResolver: React.FC<ArcadeContentResolverProps>;
export default ArcadeContentResolver;
