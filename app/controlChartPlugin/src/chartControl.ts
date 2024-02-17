import {
    iChart,
    iChartControl,
    iChartPlugin,
    iModal,
    iModalPlugin,
    iObservable,
    iTableController,
    PluginsStatesEvent,
    pluginSTATE
} from "../../../env/types";
import {Observable} from "../../../env/helpers/observable";
import {appendChild} from "../../../env/helpers/appendRemoveChildDOMElements";
import {createElement} from "../../../env/helpers/createDOMElements";

export class ChartControl implements iChartControl {
    error$: iObservable<string | Array<string>>;
    name: string;
    controller: iTableController;
    modal: iModal;
    state$: iObservable<pluginSTATE>
    constructor() {
        this.error$ = new Observable<string | Array<string>>();
        this.name = "chartControl";
        this.state$ = new Observable<pluginSTATE>(pluginSTATE.INITIALIZED)
    }

    registration(controller: iTableController) {
        this.controller = controller
        controller.updateStatePlugins$.subscribe((stateList)=>{
            if(stateList.state.modal && stateList.state.chart && this.state$.getValue() != pluginSTATE.LOADED ){
                this.controller = controller;
                let createChartContainer = createElement("div", ["createChartContainer"]);
                let buttonChart = createElement("button", ["createChartButton"]);
                let inputChart: HTMLInputElement = createElement("input", ["createChartInput"]) as HTMLInputElement;

                let modalPluginInfo  = controller.getPlugin("modal");
                let chartPluginInfo = controller.getPlugin("chart");

                let modalPlugin: iModalPlugin = modalPluginInfo.plugin as iModalPlugin;
                let chartPlugin: iChartPlugin = chartPluginInfo.plugin as iChartPlugin;
                let chart: iChart = chartPlugin.createChart({data: [], header: []});
                let modalContainer = createElement("div");
                let controlPanel = createElement("div", ["controlPanel"]);
                let setColumnChart = createElement("button");
                setColumnChart.innerHTML = "Column";
                let setLineChart = createElement("button");
                setLineChart.innerHTML = "Line";

                setLineChart.onclick = () => chart.setChartType('line')
                setColumnChart.onclick = () => chart.setChartType('column')

                appendChild(controlPanel, setLineChart);
                appendChild(controlPanel, setColumnChart);

                appendChild(modalContainer, controlPanel);
                appendChild(modalContainer, chart.chartContainer);

                this.modal = modalPlugin.createModal(modalContainer);


                buttonChart.onclick = () => {
                    let chartData: {
                        data: Array<number>,
                        header: Array<string>
                    } | void = controller.table.getChartData(+inputChart.value);
                    if (!chartData) return;
                    chart.setChartData(chartData.data, chartData.header);
                    modalPlugin.openModal(this.modal);
                };
                buttonChart.innerHTML = "Нарисовать график";
                appendChild(createChartContainer, buttonChart);
                appendChild(createChartContainer, inputChart);
                controller.table.tableElement.insertAdjacentElement("afterend", createChartContainer);
                this.state$.next(pluginSTATE.LOADED)
            }
        })
        controller.updateStatePlugins$.subscribe((event:PluginsStatesEvent)=>{
            if ((!event.state.modal || !event.state.chart) && event.targetPlugin !== "chartControl") {
                this.unRegister();
                this.state$.next(pluginSTATE.HIBERNATED)
            }
        })
    }

    unRegister() {
        let buttonAction = this.controller.table.tableElement.parentNode.querySelector(".createChartContainer")
        if(buttonAction){
            buttonAction.remove()
        }
        if(this.modal){
            this.modal.destroy()
        }
    }
}