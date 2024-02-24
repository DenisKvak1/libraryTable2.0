import {
  errorType,
  iObservable,
  iPlugin,
  IPluginInfo,
  iTable,
  iTableController,
  PluginList, 
  tableData
} from "../../../../env/types";
import {Table} from "./Table";
import {Observable} from "../../../../env/helpers/observable";

export class TableController implements iTableController{
  table: iTable
  plugins: PluginList
  error$: iObservable<errorType>
  pluginEvent$: iObservable<iPlugin>

  constructor(id:string, tableData:tableData) {
    this.table = new Table(id, tableData)
    this.error$ = new Observable<errorType>()
    this.pluginEvent$ = new Observable<iPlugin>()

    this.table.error$.subscribe((data:errorType)=>{
      this.error$.next(data)
    })
    this.plugins = {
      errorProcessing: null,
      modal: null,
      chartControl: null,
      chart: null
    }
  }
  addPlugin(pluginInstance: iPlugin): void {
    if (!this.plugins.hasOwnProperty(pluginInstance.name) || !this.table.tableElement) {
      this.error$.next('Ошибка загрузки плагина');
      return;
    }

    this.plugins[pluginInstance.name] = pluginInstance;
    pluginInstance.registration(this);
  }

  removePlugin(pluginId:string):void{
    if(!this.plugins[pluginId]) {
      this.error$.next('Ошибка удаление плагина')
      return
    }
    this.plugins[pluginId].unRegister()
    this.plugins[pluginId] = null
  }
  getPlugin(pluginId:string): IPluginInfo{
    const plugin = this.plugins[pluginId];
    if (!plugin) return {
      plugin: null,
      isPresent: false
    }

    return {
      plugin: plugin,
      isPresent: true,
    }
  }
}