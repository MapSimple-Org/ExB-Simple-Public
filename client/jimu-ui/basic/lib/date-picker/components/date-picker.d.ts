/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, dateUtils, type EsriDateFormats, type DataSource } from 'jimu-core';
import { type Strategy } from 'jimu-ui';
import 'react-datepicker/dist/react-datepicker.css';
/**
 * The DatePicker component props.
 */
export interface DatePickerProps {
    /**
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * `aria-describedby` is used to indicate the IDs of the elements that describe the component.
     * It is for accessibility purposes.
     */
    'aria-describedby'?: string;
    /**
     * Selected date by default.
     */
    selectedDate: Date | dateUtils.VirtualDateType;
    /**
     * Used to get date field value without offset of ds.timezone and local timezone.
     * @ignore
     */
    dataSource?: DataSource;
    /**
     * Used to get date field value without offset of ds.timezone and local timezone.
     * Higher priority than dataSource.
     * @ignore
     */
    dataSourceTimezone?: string;
    /**
     * @ignore
     */
    format?: EsriDateFormats | string;
    /**
     * Min Date
     * @ignore
     */
    minDate?: Date;
    /**
     * Max Date
     * @ignore
     */
    maxDate?: Date;
    /**
     * Different design for setting and runtime.
     * true: two months shown, has today button,
     * false: one month shown, no today button.
     * @deprecated
     * @ignore
     */
    runtime: boolean;
    /**
     * Whether to display two months.
     * @default false
     */
    showTwoMonths?: boolean;
    /**
     * Whether to display quick navigation to `Today`
     * @default false
     */
    showQuickNavToToday?: boolean;
    /**
     * Displayed virtual dates at runtime.
     * Renamed to virtualDateListForRuntime
     * @deprecated
     * @ignore
     */
    dateRangeList?: dateUtils.VirtualDateType[];
    /**
     * Displayed virtual date list at runtime.
     * Only support today by now.
     * @default VIRTUAL_DATE_FOR_RUNTIME
     * @deprecated
     * @ignore
     */
    virtualDateListForRuntime?: dateUtils.VirtualDateType[];
    /**
     * Displayed virtual date list shown for setting.
     * Please use `virtualDateList` instead
     * @default VIRTUAL_DATE_FOR_SETTING
     * @deprecated
     * @ignore
     */
    virtualDateListForSetting?: dateUtils.VirtualDateType[];
    /**
     * Whether to display virtual date list.
     * See the real list from `virtualDateList`.
     * @default false
     */
    supportVirtualDateList?: boolean;
    /**
     * Displayed virtual date list.
     * Valid only when supportVirtualDateList is true.
     * @default VIRTUAL_DATE_LIST
     */
    virtualDateList?: dateUtils.VirtualDateType[];
    /**
     * Hide empty button from virtual date list panel.
     * @default false
     */
    hideEmpty?: boolean;
    onChange: (value: number | dateUtils.VirtualDateType, label: string) => void;
    /**
    * Whether to display time input on datepicker component.
    * @default false
    */
    showTimeInput?: boolean;
    /**
    * Whether to display a long time format.
    * @default false
    */
    isLongTime?: boolean;
    /**
    * Whether to display a Done button.
    */
    showDoneButton?: boolean;
    /**
     * Disable the portal behavior, the children stay within it's parent DOM hierarchy.
     * if `false`, The children will be put to `document.body`.
     * @default false
     */
    disablePortal?: boolean;
    /**
     * Describes the positioning strategy to use. By default, it is absolute,
     * which in the simplest cases does not require repositioning of the popper.
     * If your reference element is in a fixed container, use the fixed strategy.
     * @default absolute
     */
    strategy?: Strategy;
    className?: string;
    style?: React.CSSProperties;
}
interface ExtraProps {
    /**
     * @ignore
     */
    theme: IMThemeVariables;
}
interface IntlProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
interface State {
    isRender: boolean;
    updateInput: boolean;
    currentDate: Date | dateUtils.VirtualDateType;
    localeChanged: boolean;
    isOpen: boolean;
    isVirtualDateListOpen: boolean;
    firstDayOfWeek: number;
    supportVirtualDateList: boolean;
    virtualDateList: dateUtils.VirtualDateType[];
}
/**
 * The `DatePicker` component is used to provide the ability to pick a date/time.
 *
 * ```ts
 * import { DatePicker } from 'jimu-ui/basic/date-picker'
 * ```
*/
export declare class _DatePicker extends React.PureComponent<DatePickerProps & ExtraProps & IntlProps, State> {
    __unmount: boolean;
    datePickerContainer: any;
    datePicker: any;
    datePickerBtn: any;
    datePickerInput: any;
    isDateEmpty: boolean;
    fromCustomOption: boolean;
    isCustomDate: boolean;
    constructor(props: any);
    i18nMessage: (id: string) => string;
    _getLocalDate: (date: any, virtualDateList?: dateUtils.VirtualDateType[]) => any;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: DatePickerProps, prevState: State): void;
    updateVirtualDateStates: (updateCurrentDate?: boolean) => void;
    checkIfSupportVirtualDateList: (virtualDateList: any) => boolean;
    popperClick: (evt: any, dateClick: any) => void;
    popperToggle: (evt: any) => void;
    onDateChange: (date: Date) => void;
    onTimeChange: (hour: number, minute: number, second: number) => void;
    onDateTimeChange: (date: Date) => void;
    onDateApply: (_date?: Date, isPopperTriggered?: boolean) => void;
    getValueWithoutTzOffset(value: number, timezone: string): number;
    getVirtualDateLabel: (label: any) => any;
    _getDateLabel: (date: any) => string;
    dateIconClick: () => void;
    onVirtualDateSelect: (virtualDate: string, label?: string) => void;
    dateInputClick: (evt?: React.MouseEvent<HTMLDivElement>) => void;
    dateInputChange: (e: any) => void;
    dateInputIconClick: (evt?: any) => void;
    virtualDateListToggle: (evt?: React.MouseEvent<HTMLDivElement>) => void;
    checkIfShowTwoCalendar: (isShown?: boolean) => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * The `DatePicker` component is used to provide the ability to pick a date/time.
 *
 * ```ts
 * import { DatePicker } from 'jimu-ui/basic/date-picker'
 * ```
*/
export declare const DatePicker: import("@emotion/styled").StyledComponent<Omit<DatePickerProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
