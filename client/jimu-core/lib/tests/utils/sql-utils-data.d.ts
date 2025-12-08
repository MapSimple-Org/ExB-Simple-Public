import { ClauseType, type SqlClause, ClauseSourceType, ClauseOperator, type SqlClauseSet, ClauseDisplayType } from '../../types/sql-expression';
import { TimeUnit, VirtualDateType } from '../../utils/date-utils';
import { ClauseInputEditor } from 'jimu-ui/basic/sql-expression-runtime';
import { FeatureLayerDataSourceImpl } from 'jimu-data-source';
declare function getDateClausesForInTheLastOperators(): {
    dateIsInTheLastOnDateClauseMinute: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseHour: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseDay: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseWeek: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseMonth: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseYear: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseMinute: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseHour: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseDay: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseWeek: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseMonth: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseYear: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseMinuteNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseHourNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseDayNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseWeekNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseMonthNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheLastOnDateClauseYearNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseMinuteNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseHourNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseDayNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseWeekNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseMonthNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheLastOnDateClauseYearNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
};
declare function getDateClausesForInTheNextOperators(): {
    dateIsInTheNextOnDateClauseMinute: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseHour: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseDay: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseWeek: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseMonth: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseYear: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseMinute: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseHour: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseDay: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseWeek: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseMonth: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseYear: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseMinuteNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseHourNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseDayNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseWeekNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseMonthNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsInTheNextOnDateClauseYearNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseMinuteNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseHourNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseDayNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseWeekNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseMonthNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
    dateIsNotInTheNextOnDateClauseYearNull: {
        type: ClauseType;
        jimuFieldName: string;
        displayType: ClauseDisplayType;
        askForValueOptions: any;
        operator: ClauseOperator;
        valueOptions: {
            sourceType: ClauseSourceType;
            inputEditor: ClauseInputEditor;
            value: {
                value: number;
                label: TimeUnit;
            }[];
        };
    };
};
declare function getDateClausesForVirtualDates(): {
    date: any;
    dateTime: any;
};
declare const clauses: any;
declare const clauseSets: {
    clauseSet: SqlClauseSet;
    clauseSet2: SqlClauseSet;
    clauseSetNull1: SqlClauseSet;
    clauseSetNull2: SqlClauseSet;
};
declare const dataSources: {
    hostedDs: FeatureLayerDataSourceImpl;
    unHostedDs: FeatureLayerDataSourceImpl;
    unHostedDsWithOffset: FeatureLayerDataSourceImpl;
    hostedDsWithStandardizedQueries: FeatureLayerDataSourceImpl;
    unHostedDsWithoutStandardizedQueries: FeatureLayerDataSourceImpl;
    unHostedDsWithOffsetWithoutStandardizedQueries: FeatureLayerDataSourceImpl;
    hostedDsShortTime: FeatureLayerDataSourceImpl;
    unHostedDsShortTime: FeatureLayerDataSourceImpl;
    unHostedDsShortTimeWithOffset: FeatureLayerDataSourceImpl;
    hostedDsLongTime: FeatureLayerDataSourceImpl;
    unHostedDsLongTime: FeatureLayerDataSourceImpl;
    unHostedDsLongTimeWithOffset: FeatureLayerDataSourceImpl;
};
declare function getRealDateByForDateInOperator(dateType: VirtualDateType, intl: any): {
    startDate: string;
    endDate: string;
};
declare function getNumberClausesForUniquePredefined(): {
    emptyChecked: SqlClause;
    valueChecked: SqlClause;
    emptyCheckedValues: SqlClause;
    valueCheckedValues: SqlClause;
    emptyCheckedForIsNot: SqlClause;
    valueCheckedForIsNot: SqlClause;
    emptyCheckedValuesForIsNot: SqlClause;
    valueCheckedValuesForIsNot: SqlClause;
};
declare function getNumberClausesForMultiplePredefined(): {
    noChecked: SqlClause;
    oneIsChecked: SqlClause;
    twoAreChecked: SqlClause;
    noChecked2: SqlClause;
    oneIsChecked2: SqlClause;
    twoAreChecked2: SqlClause;
};
declare function getStringClausesForUniquePredefined(): {
    emptyChecked: SqlClause;
    valueChecked: SqlClause;
    emptyCheckedValues: SqlClause;
    valueCheckedValues: SqlClause;
    emptyCheckedForIsNot: SqlClause;
    valueCheckedForIsNot: SqlClause;
    emptyCheckedValuesForIsNot: SqlClause;
    valueCheckedValuesForIsNot: SqlClause;
    emptyCheckedForStartsWith: SqlClause;
    valueCheckedForStartsWith: SqlClause;
    emptyCheckedValuesForStartsWith: SqlClause;
    valueCheckedValuesForStartsWith: SqlClause;
    emptyCheckedForNotStartWith: SqlClause;
    valueCheckedForNotStartWith: SqlClause;
    emptyCheckedValuesForNotStartWith: SqlClause;
    valueCheckedValuesForNotStartWith: SqlClause;
};
declare function getStringClausesForMultiplePredefined(): {
    noChecked: SqlClause;
    oneIsChecked: SqlClause;
    twoAreChecked: SqlClause;
    noCheckedForIsNoneOf: SqlClause;
    oneIsCheckedForIsNoneOf: SqlClause;
    twoAreCheckedForIsNoneOf: SqlClause;
    noCheckedForStartsWith: SqlClause;
    oneIsCheckedForStartsWith: SqlClause;
    twoAreCheckedForStartsWith: SqlClause;
    noCheckedForNotStartWith: SqlClause;
    oneIsCheckedForNotStartWith: SqlClause;
    twoAreCheckedForNotStartWith: SqlClause;
};
/***
 * predefined --- end
 */
declare const nestedSqlExpression1: any;
declare const nestedSqlExpression2: any;
declare const nestedSqlExpression3: any;
declare const nestedSqlExpression4: any;
export { dataSources, clauses, clauseSets, getNumberClausesForUniquePredefined, getNumberClausesForMultiplePredefined, getStringClausesForUniquePredefined, getStringClausesForMultiplePredefined, getRealDateByForDateInOperator, getDateClausesForInTheLastOperators, getDateClausesForInTheNextOperators, getDateClausesForVirtualDates, nestedSqlExpression1, nestedSqlExpression2, nestedSqlExpression3, nestedSqlExpression4 };
