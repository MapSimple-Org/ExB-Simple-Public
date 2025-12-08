import { React, QueryScope } from 'jimu-core';
export interface QueryScopeContextProps {
    scope: QueryScope;
    widgetId?: string;
}
export declare const QueryScopeContext: React.Context<QueryScopeContextProps>;
