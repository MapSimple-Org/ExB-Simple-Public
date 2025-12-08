import { MessageType, Immutable } from 'jimu-core';
export declare function initGlobalInBuilder(): void;
export declare function initStateBeforeTest(): void;
export declare function changePublishMessages(isOuputMessage: boolean): void;
export declare function getNewInitState(): Immutable.ImmutableObject<import("jimu-core").State>;
export declare function initProps(): Immutable.ImmutableObject<{
    actionId: string;
    config: {
        actionUseDataSource: any;
        enabledDataRelationShip: boolean;
        messageUseDataSource: Immutable.ImmutableObject<{
            dataSourceId: string;
            dataViewId: any;
            mainDataSourceId: string;
            rootDataSourceId: string;
        }>;
        sqlExprObj: any;
        dataSources: {
            ds1: {
                id: string;
                type: string;
            };
            ds2: {
                id: string;
                type: string;
                originDataSources: {
                    dataSourceId: string;
                    fields: any[];
                    mainDataSourceId: string;
                    rootDataSourceId: string;
                }[];
            };
            outputDs1: {
                id: string;
                type: string;
                originDataSources: {
                    dataSourceId: string;
                    fields: any[];
                    mainDataSourceId: string;
                    rootDataSourceId: string;
                }[];
            };
        };
        dataSourcesInfo: {};
        theme: import("jimu-core").IMThemeVariables;
        intl: jest.Mock<any, any, any>;
    };
    messageType: MessageType;
    messageWidgetId: string;
    messages: {};
    widgetId: any;
    onSettingChange: jest.Mock<any, any, any>;
    onDisableDoneBtn: jest.Mock<any, any, any>;
}>;
export declare function initWidgetsUsedatasources(): void;
export declare function mockJimuCore(): void;
