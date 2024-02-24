import {iChart, iChartPlugin, iObservable, iTableController, PLUGIN_STATE} from "../../../env/types";
import {Observable} from "../../../env/helpers/observable";
import {Chart} from "./modules/Chart";

export class ChartPlugin implements iChartPlugin{
  name: string
  state$: iObservable<PLUGIN_STATE>
  constructor() {
    this.name = "chart"
    this.state$ = new Observable<PLUGIN_STATE>(PLUGIN_STATE.INITIALIZED)
  }
  createChart(chartData:{header:Array<string>, data:Array<number>}):iChart{
    return new Chart(chartData.data, chartData.header,{width:500, height:300})
  }
  registration(controller: iTableController){
    this.state$.next(PLUGIN_STATE.ADDED)
    this.state$.next(PLUGIN_STATE.PENDING)
    this.state$.subscribe(()=>{
      controller.pluginEvent$.next(this)
    })
    this.state$.next(PLUGIN_STATE.READY)
  }
  unRegister(){
    this.state$.next(PLUGIN_STATE.REMOVED)
  }
}