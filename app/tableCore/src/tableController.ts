import {
  errorType,
  iObservable,
  iPlugin,
  IPluginInfo,
  iTable,
  iTableController,
  PluginList,
  tableData
} from "../../../env/types";
import {Table} from "./modules/table/Table";
import {Observable} from "../../../env/helpers/observable";

export class TableController implements iTableController{
  table: iTable
  plugins: PluginList
  error$: iObservable<errorType>
  pluginEvent$: iObservable<iPlugin>
  denyPlugins$: iObservable<Array<string>>
  constructor(id:string, tableData:tableData) {
    this.table = new Table(id, tableData)
    this.error$ = new Observable<errorType>()
    this.pluginEvent$ = new Observable<iPlugin>()

    this.denyPlugins$ = new Observable<Array<string>>([])
    this.table.error$.subscribe((data:errorType)=>{
      this.error$.next(data)
    })
    let startDenyPlugin = localStorage.getItem('denyPlugin')
    if(startDenyPlugin){
      this.denyPlugins$.setValue(JSON.parse(startDenyPlugin))
    } else {
      this.denyPlugins$.setValue([])
    }
    this.denyPlugins$.subscribe((data)=>{
      localStorage.setItem('denyPlugin', JSON.stringify(data))
      for (let key of data){
        if (this.plugins[key]?.name) {
          this.plugins[key].unRegister()
        }
      }
    })

    this.plugins = {
      errorProcessing: null,
      modal: null,
      chartControl: null,
      chart: null,
      adminPanel: null
    }
  }
  addPlugin(pluginInstance: iPlugin): void {
    if (!this.plugins.hasOwnProperty(pluginInstance.name) || !this.table.tableElement) {
      this.error$.next('Ошибка загрузки плагина');
      return;
    }
    if(this.denyPlugins$.getValue().includes(pluginInstance.name)){
      this.error$.next(`Плагин ${pluginInstance.name} заблокирован администратором`);
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