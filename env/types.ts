export type CellValue = string;
export type tableRow = Array<CellValue>;
export type tableHeader = {
    row: tableRow;
};
export type TableBody = {
    rows: Array<tableRow>;
};
export type TableFooter = {
    tableDescription: string;
};
export type tableData = {
    header: tableHeader,
    body: TableBody,
    footer: TableFooter
};

export const enum EventCommand {
    ADD = "ADD",
    REMOVE = "REMOVE",
}

export type IColumnEvent = {
    command: EventCommand;
    position: number;
}
export type IRowEvent = {
    command: EventCommand;
    position: number;
}
export type ICellEvent = {
    x: number;
    y: number;
    value: CellValue;
}
export type iTable = {
    column$: iObservable<IColumnEvent>
    row$: iObservable<IRowEvent>
    table$: iObservable<tableData>
    cell$: iObservable<ICellEvent>
    error$: iObservable<errorType>
    tableElement: HTMLElement

    pushRow: () => void
    pushColumn: (header: string) => void
    insertRow: (rowIndex: number) => void
    insertColumn: (rowIndex: number, columnHeader: string) => void
    deleteRow: (rowIndex: number) => void
    deleteColumn: (columnIndex: number) => void
    getChartData: (rowIndex: number) => { data: Array<number>, header: Array<string> } | void
    setTable: (tableData: tableData) => void
}
export type iModal = {
    setContent: (content: string | Element) => void;
    setOptions: (options: IModalOptions) => void;
    open: () => void;
    close: () => void;
    destroy: () => void;
}
export type iChart = {
    chartContainer: HTMLElement;
    error$: iObservable<string>
    setChartData: (chartData: Array<number>, headerData: Array<string>)=>void
    setChartType:(type:string)=> void
    setOptions: (option:IChartOptions)=>void
}
export type iObservable<T> = {
    subscribe: (callback: (eventData: T) => void) => { unsubscribe: () => void };
    next: (eventData?: T) => void
    unsubscribeAll: () => void
    getValue: () => T
    setValue: (value: T) => void
    once: (callback: (eventData?: T) => void) => void
}
export type iObservableBack = {
    listeners: Record<string, ((eventData: any) => void)[]>
    subscribe: (eventName: string, callback: (eventData: any) => void) => { unsubscribe: () => void }
    next: (eventName: string, eventData: any) => void
    unsubscribeAll: () => void
}
export type IModalOptions = {
    width?: number;
    maxWidth?: number;
    height?: number;
    maxHeight?: number;
    bgColor?: string;
    bgOverlayColor?: string;
    [key: string]: string | number
};
export enum ChartType {
    LINE = "LINE",
    COLUMN = "COLUMN",
}
export type IChartOptions = {
    markColor?: string,
    markWidth?: number,
    markTextColor?:string,
    lineColor?: string,
    lineWidth?: number,
    circleColor?: string,
    circleRadius?: number,
    columnColor?: string,
    width?: number,
    height?:number

    [key: string]: string | number
};
export type iModalOptionsFunc = {
    width?: (width: number) => void;
    maxWidth?: (maxWidth: number) => void;
    height?: (height: number) => void;
    maxHeight?: (maxHeight: number) => void;
    bgColor?: (color: string) => void;
    bgOverlayColor?: (color: number) => void;
    [key:string]: (argument:string|number)=>void
}
export type errorType = string
export type iTableController = {
    table: iTable
    plugins: PluginList
    error$: iObservable<errorType>
    pluginEvent$: iObservable<iPlugin>
    
    addPlugin: (plugin: iPlugin) => void
    removePlugin: (pluginId: string) => void
    getPlugin: (pluginId: string) => IPluginInfo
}

export type PluginList = {
    errorProcessing: iPlugin
    modal: iPlugin
    chartControl: iPlugin
    chart: iPlugin
    [key: string]: iPlugin
}
export type iPlugin = {
    name: string
    state$: iObservable<PLUGIN_STATE>
    registration: (controller: iTableController) => void
    unRegister: () => void
}
export type IPluginInfo = {
    plugin: iPlugin;
    isPresent: boolean;
}
export type iErrorProcessing = iPlugin & {}
export type iModalPlugin = iPlugin & {
    createModal: (content: string | Element, destroyMode?: boolean) => iModal
}
export type iChartControl = iPlugin & {}
export type iChartPlugin = iPlugin & {
    createChart: (chartData: { header: Array<string>, data: Array<number> }) => iChart
}


export const enum PLUGIN_STATE {
    INITIALIZED = "INITIALIZED",
    ADDED = "ADDED",
    PENDING = "PENDING",
    READY = "READY",
    REMOVED = "REMOVED"
}