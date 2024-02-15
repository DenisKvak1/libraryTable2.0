
export type tableData = {
    header: Array<string>,
    body: Array<Array<string>>,
    footer: string
}
export type iTable = {
    addColumn$: iObservable<{x:number}>
    addRow$: iObservable<{y:number}>
    removeRow$: iObservable<{y:number}>
    removeColumn$: iObservable<{x:number}>
    setTable$: iObservable<tableData>
    changeCellContent$: iObservable<{x:number, y:number, textContent:string}>
    error$ :iObservable<string | Array<string>>
    tableElement: HTMLElement

    pushRow: ()=>void
    pushColumn: (header: string)=> void
    insertRow: (rowIndex: number)=>void
    insertColumn: (rowIndex: number, columnHeader:string)=>void
    deleteRow:(rowIndex:number)=>void
    deleteColumn:(columnIndex:number)=>void
    getChartData: (rowIndex:number)=> {data: Array<number>, header: Array<string>} | void
    setTable:(tableData:tableData)=> void
}
export type iModal={
    setContent: (content:string|Element)=>void
    openModal: ()=>void
    closeModal: ()=>void
    setBackGroundColorModal: (color:string)=>void
    setBackGroundColorOverlay: (color:string)=>void
    destroy: ()=>void
    setMaxWidth: (maxWidth:string)=> void
    setMaxHeight: (maxHeight:string)=> void
}
export type iChart={
    chartContainer: HTMLElement;
    error$: iObservable<string>
    setChartData:(chartData: Array<number>, headerData: Array<string>)=>void
    setMarkColor:(color: string)=>void
    setMarkCount:(count: number)=>void
    setMarkWidth:(width: number)=>void
    setChartType:(chartType: string)=>void
    setMarkTextColor:(color: string)=>void
    setLineColor:(color: string)=>void
    setLineWidth:(width: number)=>void
    setCircleColor:(color: string)=>void
    setCircleRadius:(radius: number)=>void
    setColumnColor:(color: string)=>void
    setColumnBorder:(borderData: string)=>void
    setChartWidth:(width:number)=>void
    setChartHeight:(height:number)=>void
}
export type iObservable<T> = {
    subscribe: (callback: (eventData: T) => void) => { unsubscribe: () => void };
    next: (eventData?:T)=>void
    unsubscribeAll:()=> void
    getValue:()=> T
}
export type iObservableBack = {
    listeners: Record<string, ((eventData: any) => void)[]>
    subscribe: (eventName:string, callback:(eventData: any) => void)=> { unsubscribe: () => void }
    next: (eventName:string, eventData:any)=>void
    unsubscribeAll:()=> void
}
export type iTableController={
    table: iTable
    plugins: PluginList
    pluginErrorSubscriptions: Record<string, {unsubscribe: ()=>void}>
    pluginStateSubscriptions: Record<string, {unsubscribe: ()=>void}>
    error$: iObservable<string | Array<string>>
    updateStatePlugins$: iObservable<PluginsStatesEvent>
    StatePlugins: Record<string, pluginSTATE>

    addPlugin: (plugin: iPlugin)=>void
    removePlugin: (pluginId:string)=>void
    getPlugin: (pluginId:string)=> IPluginInfo
}

export type PluginList = {
    errorProcessing: iPlugin
    modal: iPlugin
    chartControl: iPlugin
    chart: iPlugin
    [key: string]: iPlugin
}
export type PluginsStates = {
    errorProcessing: pluginSTATE
    modal: pluginSTATE
    chartControl: pluginSTATE
    chart: pluginSTATE
    [key: string]: pluginSTATE
}
export type PluginsStatesEvent = {
    state:{
        errorProcessing: pluginSTATE
        modal: pluginSTATE
        chartControl: pluginSTATE
        chart: pluginSTATE
        [key: string]: pluginSTATE
    },
    targetPlugin: string
}
export type iPlugin = {
    name: string
    error$: iObservable<string | Array<string>>
    state$: iObservable<pluginSTATE>
    registration:(controller:iTableController)=>void
    unRegister: ()=> void
}
export type IPluginInfo = {
    plugin: iPlugin;
    isPresent: boolean;
}
export type iErrorProcessing = iPlugin &{

}
export type iModalPlugin = iPlugin & {
    createModal:(content:string | Element, destroyMode?:boolean)=> iModal
    setContent: (modal: iModal, content: Element | string)=>void
    openModal:(modal:iModal)=>void
    closeModal:(modal:iModal)=>void
}
export type iChartControl = iPlugin & {

}
export type iChartPlugin = iPlugin & {
    createChart:( chartData:{header:Array<string>, data:Array<number>})=>iChart
}
export const enum pluginSTATE {
    INITIALIZED,
    LOADED,
    FAULT,
    HIBERNATED,
}