import type { DataSourceJson } from '../../types/app-config';
import type { DataSourceInfo } from '../../types/state';
import { type Expression } from '../../types/expression';
export declare const dataSources: {
    [dsId: string]: DataSourceJson;
};
export declare const dataSourcesInfo: {
    [dsId: string]: DataSourceInfo;
};
export declare const oneOperatorPart: Expression;
export declare const oneFunctionWithoutChildExp: Expression;
export declare const oneFunctionWithChildExp: Expression;
export declare const oneFieldPart: Expression;
export declare const oneAvgFunction: Expression;
export declare const oneCountFunction: Expression;
export declare const twoFunctions: Expression;
export declare const oneUnknowPart: Expression;
export declare const twoNumberPartsAndOneOpertorPart: Expression;
export declare const oneFunctionPart: Expression;
export declare const oneWrongNameFunctionPart: Expression;
export declare const numberPartsWithoutParentheses: Expression;
export declare const numberPartsWithOneParentheses: Expression;
export declare const numberPartsWithMoreParentheses: Expression;
export declare const numberPartsWithMoreParenthesesAndOneString: Expression;
