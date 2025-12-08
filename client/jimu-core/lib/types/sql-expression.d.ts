import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import type { SqlQuerySortOrder } from '../data-sources';
/**
 * SQL expression mode for `SqlExpressionBuilder`.
 */
export declare enum SqlExpressionMode {
    /**
     * All functions.
     */
    All = "ALL",
    /**
     * The ask-for-value panel is hidden. Users can only use the default input style for a specific source type.
     */
    Simple = "SIMPLE"
}
/**
 * Clause logic connector, includes AND and OR.
 */
export declare enum ClauseLogic {
    And = "AND",
    Or = "OR"
}
/**
 * Clause cascade type.
 * None: display all unique values of this field.
 * Previous: display values filtered by previous expressions (clauses).
 * All: display values filtered by all other expressions (clauses).
 */
export declare enum ClauseCascade {
    None = "NONE",
    Previous = "PREVIOUS",
    All = "ALL"
}
/**
 * Clause operator for all types of field, includes numeric, string and date.
 */
export declare enum ClauseOperator {
    StringOperatorIs = "STRING_OPERATOR_IS",
    StringOperatorIsNot = "STRING_OPERATOR_IS_NOT",
    StringOperatorContains = "STRING_OPERATOR_CONTAINS",
    StringOperatorDoesNotContain = "STRING_OPERATOR_DOES_NOT_CONTAIN",
    StringOperatorStartsWith = "STRING_OPERATOR_STARTS_WITH",
    StringOperatorDoesNotStartWith = "STRING_OPERATOR_DOES_NOT_START_WITH",
    StringOperatorEndsWith = "STRING_OPERATOR_ENDS_WITH",
    StringOperatorDoesNotEndWith = "STRING_OPERATOR_DOES_NOT_END_WITH",
    StringOperatorIsAnyOf = "STRING_OPERATOR_IS_ANY_OF",
    StringOperatorIsNoneOf = "STRING_OPERATOR_IS_NONE_OF",
    StringOperatorIsBlank = "STRING_OPERATOR_IS_BLANK",
    StringOperatorIsNotBlank = "STRING_OPERATOR_IS_NOT_BLANK",
    NumberOperatorIs = "NUMBER_OPERATOR_IS",
    NumberOperatorIsNot = "NUMBER_OPERATOR_IS_NOT",
    NumberOperatorIsAtLeast = "NUMBER_OPERATOR_IS_AT_LEAST",
    NumberOperatorIsAtMost = "NUMBER_OPERATOR_IS_AT_MOST",
    NumberOperatorIsLessThan = "NUMBER_OPERATOR_IS_LESS_THAN",
    NumberOperatorIsGreaterThan = "NUMBER_OPERATOR_IS_GREATER_THAN",
    NumberOperatorIsBetween = "NUMBER_OPERATOR_IS_BETWEEN",
    NumberOperatorIsNotBetween = "NUMBER_OPERATOR_IS_NOT_BETWEEN",
    NumberOperatorIsAnyOf = "NUMBER_OPERATOR_IS_ANY_OF",
    NumberOperatorIsNoneOf = "NUMBER_OPERATOR_IS_NONE_OF",
    NumberOperatorIsBlank = "NUMBER_OPERATOR_IS_BLANK",
    NumberOperatorIsNotBlank = "NUMBER_OPERATOR_IS_NOT_BLANK",
    DateOperatorIsOn = "DATE_OPERATOR_IS_ON",
    DateOperatorIsNotOn = "DATE_OPERATOR_IS_NOT_ON",
    DateOperatorIsIn = "DATE_OPERATOR_IS_IN",
    DateOperatorIsNotIn = "DATE_OPERATOR_IS_NOT_IN",
    DateOperatorIsBefore = "DATE_OPERATOR_IS_BEFORE",
    DateOperatorIsAfter = "DATE_OPERATOR_IS_AFTER",
    DateOperatorIsOnOrBefore = "DATE_OPERATOR_IS_ON_OR_BEFORE",
    DateOperatorIsOnOrAfter = "DATE_OPERATOR_IS_ON_OR_AFTER",
    DateOperatorIsInTheLast = "DATE_OPERATOR_IS_IN_THE_LAST",
    DateOperatorIsNotInTheLast = "DATE_OPERATOR_IS_NOT_IN_THE_LAST",
    DateOperatorIsInTheNext = "DATE_OPERATOR_IS_IN_THE_NEXT",
    DateOperatorIsNotInTheNext = "DATE_OPERATOR_IS_NOT_IN_THE_NEXT",
    DateOperatorIsBetween = "DATE_OPERATOR_IS_BETWEEN",
    DateOperatorIsNotBetween = "DATE_OPERATOR_IS_NOT_BETWEEN",
    DateOperatorIsBlank = "DATE_OPERATOR_IS_BLANK",
    DateOperatorIsNotBlank = "DATE_OPERATOR_IS_NOT_BLANK",
    DateOnlyOperatorIsOn = "DATE_ONLY_OPERATOR_IS_ON",
    DateOnlyOperatorIsNotOn = "DATE_ONLY_OPERATOR_IS_NOT_ON",
    DateOnlyOperatorIsBefore = "DATE_ONLY_OPERATOR_IS_BEFORE",
    DateOnlyOperatorIsAfter = "DATE_ONLY_OPERATOR_IS_AFTER",
    DateOnlyOperatorIsOnOrBefore = "DATE_ONLY_OPERATOR_IS_ON_OR_BEFORE",
    DateOnlyOperatorIsOnOrAfter = "DATE_ONLY_OPERATOR_IS_ON_OR_AFTER",
    DateOnlyOperatorIsBetween = "DATE_ONLY_OPERATOR_IS_BETWEEN",
    DateOnlyOperatorIsNotBetween = "DATE_ONLY_OPERATOR_IS_NOT_BETWEEN",
    DateOnlyOperatorIsBlank = "DATE_ONLY_OPERATOR_IS_BLANK",
    DateOnlyOperatorIsNotBlank = "DATE_ONLY_OPERATOR_IS_NOT_BLANK",
    TimeOnlyOperatorIsOn = "TIME_ONLY_OPERATOR_IS_ON",
    TimeOnlyOperatorIsNotOn = "TIME_ONLY_OPERATOR_IS_NOT_ON",
    TimeOnlyOperatorIsBefore = "TIME_ONLY_OPERATOR_IS_BEFORE",
    TimeOnlyOperatorIsAfter = "TIME_ONLY_OPERATOR_IS_AFTER",
    TimeOnlyOperatorIsOnOrBefore = "TIME_ONLY_OPERATOR_IS_ON_OR_BEFORE",
    TimeOnlyOperatorIsOnOrAfter = "TIME_ONLY_OPERATOR_IS_ON_OR_AFTER",
    TimeOnlyOperatorIsBetween = "TIME_ONLY_OPERATOR_IS_BETWEEN",
    TimeOnlyOperatorIsNotBetween = "TIME_ONLY_OPERATOR_IS_NOT_BETWEEN",
    TimeOnlyOperatorIsBlank = "TIME_ONLY_OPERATOR_IS_BLANK",
    TimeOnlyOperatorIsNotBlank = "TIME_ONLY_OPERATOR_IS_NOT_BLANK"
}
/**
 * Clause source type.
 * It depends on the field type and specific operator.
 */
export declare enum ClauseSourceType {
    UserInput = "USER_INPUT",
    Field = "FIELD",
    SingleSelectFromUnique = "UNIQUE",
    MultipleSelectFromUnique = "MULTIPLE",
    SingleSelectFromPredefined = "UNIQUE_PREDEFINED",
    MultipleSelectFromPredefined = "MULTIPLE_PREDEFINED"
}
/**
 * Value label pair for clause.
 */
export interface ClauseValuePair {
    /**
     * Clause value. UTC time is used for date values.
     */
    value: number | string;
    /** Clause label. */
    label: string;
    /**
     * Clause alias added by users, for predefined.
     */
    alias?: string;
    /**
     * Whether the current value is selected, for predefined.
     */
    selected?: boolean;
    /**
     * Whether the date timestamp is saved in UTC.
     */
    isUTC?: boolean;
}
/**
 * The empty option for config. Displayed as '- All -' in UI.
 * @ignore
 */
export declare const EMPTY_OPTION_VALUE = "-empty-";
/**
 * Clause type.
 */
export declare enum ClauseType {
    /**
     * Single clause.
     */
    Single = "SINGLE",
    /**
     * Clause set.
     */
    Set = "SET"
}
/**
 * Value options for clause.
 */
export interface ClauseValueOptions {
    /**
     * Source type: User input, Field, Unique, Multiple, etc.
     */
    sourceType: ClauseSourceType;
    /**
     * To define which input style to apply to the UI for a specific source type.
     * It also defines the date/time accuracy for date fields.
     */
    inputEditor: string;
    /**
     * By default, it's same as `inputEditor`.
     * For predefined clause, the styles at runtime are different from style in builder.
     */
    inputEditorAtRuntime?: string;
    /**
     * Value for clause. It could have multiple `ClauseValuePair` in the array.
     */
    value: ClauseValuePair[];
    /**
     * Only for clause verification logic check, not necessary for configuration.
     */
    isValid?: boolean;
}
/**
 * The type of immutable value options for clause.
 */
export type IMClauseValueOptions = ImmutableObject<ClauseValueOptions>;
/**
 * Arrangement for label and clause input.
 */
export declare enum ClauseLabelDisplay {
    Inline = "INLINE",
    Block = "BLOCK"
}
/**
 * Details of ask for value options.
 */
export interface ClauseAskForValueOptions {
    /**
     * Label has three values:
     *  null:   use i18n to display the label;
     *  ``:     do not display label;
     *  string: display custom label configured.
     */
    label: string;
    /** The clause hint. */
    hint: string;
    /**
     * The clause cascade, only for unique and multiple.
     */
    cascade?: ClauseCascade;
    /**
     * The clause display style.
     */
    display?: ClauseLabelDisplay;
    /**
     * The sort type.
     */
    sortType?: 'VALUE' | 'LABEL';
    /**
     * The sort order.
     */
    sortOrder?: SqlQuerySortOrder;
}
/** The type of immutable ask-for-value options for clause. */
export type IMClauseAskForValueOptions = ImmutableObject<ClauseAskForValueOptions>;
/**
 * The type of caluse display
 */
export declare enum ClauseDisplayType {
    /**
     * Not to display clause at runtime.
     */
    'None' = "NONE",
    /**
     * Display clause as askforvalue options set.
     */
    'UseAskForValue' = "USE_ASK_FOR_VALUE",
    /**
     * Only display clause's display label at runtime which does not allow user input.
     */
    'UseLabel' = "USE_LABEL"
}
/**
 * SQL clause.
 */
export interface SqlClause {
    /**
     * Just for rendering.
     * @ignore
     */
    __id?: string;
    /** The clause type. */
    type: ClauseType;
    /** Jimu field name. */
    jimuFieldName: string;
    /** The clause operator. */
    operator: ClauseOperator;
    /** The value options for clause. */
    valueOptions: ClauseValueOptions;
    /**
     * For unHosted service & string field.
     */
    caseSensitive?: boolean;
    /**
     * displayType is used for endUser.
     */
    displayType: ClauseDisplayType;
    /**
     * Whether endUser can see and edit the input editor for clause.
     */
    askForValueOptions?: ClauseAskForValueOptions;
    /**
     * Only show label to endUser for current clause.
     * null: use i18n to display the label.
     * string: display custom label configured.
     */
    displayLabel?: string;
    /**
     * custom SQL, use it directly without generating it from ds, field, operator.
     * Such as field ABC is not null.
     * @ignore
     */
    customSQL?: string;
    /**
     * custom displaySQL, use it directly without generating it from ds, field, operator.
     * Use customSQL as default value.
     * @ignore
     */
    customDisplaySQL?: string;
}
/** The type of immutable SQL clause. */
export type IMSqlClause = ImmutableObject<SqlClause>;
/**
 * SQL Clause Set.
 * It includes one or more SQL clauses.
 */
export interface SqlClauseSet {
    /**
     * Just for rendering.
     * @ignore
     */
    __id?: string;
    /** The clause type. */
    type: ClauseType;
    /**
     * The logic operator for each clause inside a clause set.
     */
    logicalOperator: ClauseLogic;
    /**
     * It supports nested clause and clauseSet.
     */
    parts: Array<SqlClause | SqlClauseSet>;
}
/** The type of SQL clause set. */
export type IMSqlClauseSet = ImmutableObject<SqlClauseSet>;
/**
 * SQL Expression.
 */
export interface SqlExpression {
    /** The SQL for querying. */
    sql: string;
    /** The displayed SQL for UI. */
    displaySQL?: string;
    /**
     * The logic operator for each clause and clause set.
     */
    logicalOperator: ClauseLogic;
    /** The array of clause and clause set. */
    parts: Array<SqlClause | SqlClauseSet>;
}
/** The type of immutable SQL expression. */
export type IMSqlExpression = ImmutableObject<SqlExpression>;
interface SingleGroupSqlExpression {
    dataSourceId: string;
    /**
     * Selected field list.
     */
    fieldList?: string[];
    /**
     * The logic operator for each SQL by fields set.
     * @default AND
     */
    logicalOperator?: ClauseLogic;
    /**
     * Only for main ds/field.
     * Main field is clause.jimuFieldName
     */
    clause?: SqlClause;
}
export type IMGroupSqlExpression = ImmutableArray<SingleGroupSqlExpression>;
/**
 * SQL result.
 * `sql` is used to query on a service.
 * `displaySQL` is used for UI.
 * `sqlExpression` is the passed prop sqlExprObj.
 */
export interface SqlResult {
    /** The result SQL for querying. */
    sql: string;
    /** The display SQL for UI. */
    displaySQL: string;
    /** The passed prop sqlExprObj */
    sqlExpression?: IMSqlExpression;
}
/**
 * @ignore
 */
export declare enum OrderRule {
    Asc = "ASC",
    Desc = "DESC"
}
/**
 * @ignore
 */
export interface OrderByOption {
    jimuFieldName: string;
    order: OrderRule;
}
export {};
