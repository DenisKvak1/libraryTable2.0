import {tableData} from "../modules/Table";

export type iTable = {
    id: string
    tableData: tableData
    responseValid : Boolean
    containerElement: HTMLElement
    tableElement: HTMLElement
    theadElement : HTMLElement
    tbodyElement : HTMLElement
    tFooterElement : HTMLElement
    observable : iObservable
    pushRow: ()=>void
    pushColumn: (header: string)=> void
    insertRow: (rowIndex: number)=>void
    insertColumn: (rowIndex: number, columnHeader:string)=>void
    deleteRow:(rowIndex:number)=>void
    deleteColumn:(columnIndex:number)=>void
    getChartData: (rowIndex:number)=> {data: Array<number>, header: Array<string>} | void
    setTable:(tableData:tableData)=> void
    subscribe: (eventName:string, callback:(eventData: any) => void)=> void
}
export type iModal={
    destroyMode:boolean
    modal: HTMLElement
    modalContent: HTMLElement
    overlay: HTMLElement
    openModal: ()=>void
    closeModal: ()=>void
    setBackGroundColorModal: (color:string)=>void
    setBackGroundColorOverlay: (color:string)=>void
    setMaxWidth: (maxWidth:string)=> void
    setMaxHeight: (maxHeight:string)=> void
}
export type iChart={
    setChartData:(chartData: Array<number>, headerData: Array<string>)=>void
    setMarkColor:(color: string)=>void
    setMarkCount:(count: number)=>void
    setMarkWidth:(width: number)=>void
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
export type iObservable = {
    listeners: Record<string, ((eventData: any) => void)[]>
    subscribe: (eventName:string, callback:(eventData: any) => void)=> { unsubscribe: () => void }
    next: (eventName:string, eventData:any)=>void
    unsubscribeAll:()=> void
}