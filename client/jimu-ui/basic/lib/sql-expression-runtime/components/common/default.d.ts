import { ClauseOperator, ClauseSourceType, JimuFieldType, EsriFieldType } from 'jimu-core';
export declare enum SqlExpressionSizeMode {
    Small = "SMALL",
    Medium = "MEDIUM",
    Large = "LARGE"
}
/**
 * @ignore
 * Input editor types
 */
export declare enum ClauseInputEditor {
    DoubleNumberSelector = "DOUBLE_NUMBER_SELECTOR",
    TextInput = "TEXT_BOX",
    UniquePredefinedSelector = "UNIQUE_PREDEFINED_SELECTOR",
    MultiplePredefinedSelector = "MULTIPLE_PREDEFINED_SELECTOR",
    FieldSelector = "FIELD_SELECTOR",
    SimpleSelect = "SIMPLE_SELECT",
    SimpleExpandedList = "SIMPLE_EXPANDED_LIST",
    UniquePillWrapSelector = "UNIQUE_PILL_WRAP_SELECTOR",
    MultipleSelect = "MULTIPLE_SELECT",
    MultipleExpandedList = "MULTIPLE_EXPANDED_LIST",
    MultiplePillWrapSelector = "MULTIPLE_PILL_WRAP_SELECTOR",
    DatePicker = "DATE_PICKER",
    DateTimePicker = "DATE_TIME_PICKER",
    DateRangeSelector = "DATE_RANGE_SELECTOR",
    DoubleDatePicker = "DOUBLE_DATE_PICKER",
    DoubleDateTimePicker = "DOUBLE_DATE_TIME_PICKER",
    NumberListSelector = "NUMBER_LIST_SELECTOR",
    DateOnlyPicker = "DATE_ONLY_PICKER",
    DoubleDateOnlyPicker = "DOUBLE_DATE_ONLY_PICKER",
    TimeOnlyPicker = "TIME_ONLY_PICKER",
    DoubleTimeOnlyPicker = "DOUBLE_TIME_ONLY_PICKER",
    BlankSelector = "BLANK_SELECTOR"
}
export declare function getClauseInputEditorStyles(runtime: boolean, hasDropDown?: boolean): {
    inputEditorWidth: string;
    dropDownWidth: string;
    hasConnector: {
        inputEditorWidth: string;
    };
};
export declare const normalInputEditorsForValueAndDate: ClauseInputEditor[];
export declare const normalInputEditorsForValueAndDateOnly: ClauseInputEditor[];
export declare const normalInputEditorsForValueAndTime: ClauseInputEditor[];
export declare const normalInputEditorsForValueAndDoubleDate: ClauseInputEditor[];
export declare const normalInputEditorsForValueAndDoubleDateOnly: ClauseInputEditor[];
export declare const normalInputEditorsForValueAndDoubleTime: ClauseInputEditor[];
interface ClauseOtherOptions {
    normalInputEditors: ClauseInputEditor[];
    /**
     * By default: same as normalInputEditors
     * For predefined case, the normalInputEditors style is for builder, the normalInputEditorsAtRuntime styles are for runtime.
    */
    normalInputEditorsAtRuntime?: ClauseInputEditor[];
    codedValueInputEditors?: ClauseInputEditor[];
    supportAskForValue?: boolean;
    supportCaseSensitive?: boolean;
}
type ClauseRelationshipType = {
    [operator in ClauseOperator]: {
        [sourceType in ClauseSourceType]?: ClauseOtherOptions;
    };
};
export declare const ClauseRelationship: ClauseRelationshipType;
export declare function getOperatorsByShortType(jimuFieldType: JimuFieldType, esriFieldType: EsriFieldType): ClauseOperator[];
export {};
