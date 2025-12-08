import type { UseDataSource, IMSqlExpression, ImmutableObject, MessageActionConnectionType } from 'jimu-core';
export interface Config {
    messageUseDataSource: UseDataSource;
    actionUseDataSource: UseDataSource;
    sqlExprObj?: IMSqlExpression;
    enabledDataRelationShip?: boolean;
    connectionType?: MessageActionConnectionType;
    enableQueryWithCurrentExtent?: boolean;
}
export interface FrameWorkTargetJson {
    label?: string;
    uri?: string;
    name?: string;
    id?: string;
}
export type IMConfig = ImmutableObject<Config>;
