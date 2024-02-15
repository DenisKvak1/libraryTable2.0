import {
  iObservable,
  iPlugin,
  IPluginInfo,
  iTable,
  iTableController,
  PluginList, PluginsStates, PluginsStatesEvent,
  pluginSTATE,
  tableData
} from "../../../../env/types";
import {Table} from "./Table";
import {Observable} from "../../../../env/helpers/observable";

export class TableController implements iTableController{
  table: iTable
  plugins: PluginList
  pluginErrorSubscriptions: Record<string, {unsubscribe: ()=>void}>
  pluginStateSubscriptions: Record<string, {unsubscribe: ()=>void}>
  error$: iObservable<string | Array<string>>
  updateStatePlugins$: iObservable<PluginsStatesEvent>
  StatePlugins: PluginsStates
  constructor(id:string, tableData:tableData) {
    this.table = new Table(id, tableData)
    this.error$ = new Observable<string | Array<string>>()
    this.updateStatePlugins$ = new Observable<PluginsStatesEvent>()

    this.table.error$.subscribe((data:string|Array<string>)=>this.error$.next(data))

    this.pluginStateSubscriptions = {}
    this.pluginErrorSubscriptions = {}
    this.plugins = {
      errorProcessing: null,
      modal: null,
      chartControl: null,
      chart: null
    }
    this.StatePlugins = {
      errorProcessing: null,
      modal: null,
      chartControl: null,
      chart: null
    }
    this.updateStatePlugins$.subscribe((data)=>console.log(data))
  }
  addPlugin(pluginInstance: iPlugin): void {
    if (!this.plugins.hasOwnProperty(pluginInstance.name)) {
      this.error$.next('Ошибка загрузки плагина');
      return;
    }

    this.plugins[pluginInstance.name] = pluginInstance;
    this.pluginStateSubscriptions[pluginInstance.name] = pluginInstance.state$.subscribe((state:pluginSTATE) => {
      this.StatePlugins[pluginInstance.name] = state
      this.updateStatePlugins$.next({state:this.StatePlugins, targetPlugin: pluginInstance.name})
    });
    this.pluginErrorSubscriptions[pluginInstance.name] = pluginInstance.error$.subscribe((data: string | Array<string>) => this.error$.next(data));
    pluginInstance.registration(this);
  }

  removePlugin(pluginId:string):void{
    if(!this.plugins[pluginId]) {
      this.error$.next('Ошибка удаление плагина')
      return
    }
    this.plugins[pluginId].unRegister()
    this.pluginErrorSubscriptions[pluginId].unsubscribe()
    this.pluginStateSubscriptions[pluginId].unsubscribe()
    this.plugins[pluginId] = null

    this.StatePlugins[pluginId] = null
    this.updateStatePlugins$.next({state:this.StatePlugins, targetPlugin: pluginId})
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