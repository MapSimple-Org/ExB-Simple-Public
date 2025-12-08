import { AbstractMessageAction, type Message, type MessageDescription } from '../message/message-base-types';
import type { ImmutableObject, ImmutableArray, UseDataSource } from '../../index';
interface Config {
    sectionId: string;
    viewId: string;
    useDataSources?: UseDataSource[];
}
export type IMConfig = ImmutableObject<Config>;
export default class Action extends AbstractMessageAction {
    name: string;
    getDefaultMessageActionConfig(): {};
    filterMessageDescription(messageDescription: MessageDescription): boolean;
    filterMessage(_message: Message): boolean;
    getSettingComponentUri(): string;
    onExecute(message: Message, actionConfig?: IMConfig | ImmutableArray<Config>): boolean;
}
export {};
