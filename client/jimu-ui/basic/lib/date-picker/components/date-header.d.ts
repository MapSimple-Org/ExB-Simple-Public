interface DateHeaderProps {
    date: Date;
    monthDate: Date;
    customHeaderCount: number;
    showTwoMonths: boolean;
    changeYear: (value: number) => void;
    changeMonth: (value: number) => void;
    decreaseMonth: any;
    increaseMonth: any;
}
declare function DateHeader(props: DateHeaderProps): import("@emotion/react/jsx-runtime").JSX.Element;
export default DateHeader;
