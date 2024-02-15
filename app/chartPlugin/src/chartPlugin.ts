import {iChart, iChartPlugin, iObservable, pluginSTATE} from "../../../env/types";
import {Observable} from "../../../env/helpers/observable";
import {Chart} from "./modules/Chart";

export class ChartPlugin implements iChartPlugin{
  name: string
  error$: iObservable<string | Array<string>>;
  state$: iObservable<pluginSTATE>
  constructor() {
    this.name = "chart"
    this.error$ = new Observable<string | Array<string>>()
    this.state$ = new Observable<pluginSTATE>(pluginSTATE.INITIALIZED)
  }
  createChart(chartData:{header:Array<string>, data:Array<number>}):iChart{
    return new Chart(chartData.data, chartData.header,{width:500, height:300})
  }
  registration(){
    this.state$.next(pluginSTATE.LOADED)
  }
  unRegister(){}
}