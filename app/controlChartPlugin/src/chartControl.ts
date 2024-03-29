import {
    ChartType,
    iChart,
    iChartControl,
    iChartPlugin,
    iModal,
    iModalPlugin,
    iObservable,
    iPlugin,
    iTableController,
    PLUGIN_STATE
} from "../../../env/types";
import { Observable } from "../../../env/helpers/observable";
import { appendChild } from "../../../env/helpers/appendRemoveChildDOMElements";
import { createElement } from "../../../env/helpers/createDOMElements";
import { createElementFromHTML } from "../../../env/helpers/createElementFromHTML";
import { controlPanelTemplate, createChartTemplate } from "./template/template";

export class ChartControl implements iChartControl {
    name: string;
    controller: iTableController;
    modal: iModal;
    state$: iObservable<PLUGIN_STATE>;

    constructor() {
        this.name = "chartControl";
        this.state$ = new Observable<PLUGIN_STATE>(PLUGIN_STATE.INITIALIZED);
    }

    registration(controller: iTableController) {
        this.controller = controller;
        this.state$.next(PLUGIN_STATE.ADDED);
        this.state$.next(PLUGIN_STATE.PENDING);

        if (this.controller.getPlugin("modal").plugin?.state$.getValue() === PLUGIN_STATE.READY && this.controller.getPlugin("chart").plugin?.state$.getValue() === PLUGIN_STATE.READY) {
            this.renderChartControl();
            this.state$.next(PLUGIN_STATE.READY);
        } else {
            this.controller.pluginEvent$.subscribe((event) => {
                if (event.name === "chartControl") return;
                let modalInfo = this.controller.getPlugin("modal");
                let chartInfo = this.controller.getPlugin("chart");
                if (!modalInfo.isPresent) return;
                if (!chartInfo.isPresent) return;
                if (modalInfo.plugin.state$.getValue() === PLUGIN_STATE.READY && chartInfo.plugin.state$.getValue() === PLUGIN_STATE.READY && this.state$.getValue() !== PLUGIN_STATE.READY) {
                    this.renderChartControl();
                    this.state$.next(PLUGIN_STATE.READY);
                }
            });
        }
        this.controller.pluginEvent$.subscribe((event: iPlugin) => {
            if (event.name === "chartControl") return;
            if (this.controller.getPlugin("modal").plugin?.state$.getValue() !== PLUGIN_STATE.READY || this.controller.getPlugin("chart").plugin?.state$.getValue() !== PLUGIN_STATE.READY) {
                if (this.state$.getValue() === PLUGIN_STATE.PENDING) return;
                this.unload();
                this.state$.next(PLUGIN_STATE.PENDING);
            }
        });
        this.state$.subscribe(() => {
            this.controller.pluginEvent$.next(this);
        });
    }


    private renderChartControl() {
        let createChartContainer = createElementFromHTML(createChartTemplate);
        let buttonChart = createChartContainer.querySelector("button");
        let inputChart: HTMLInputElement = createChartContainer.querySelector("input");

        let modalPluginInfo = this.controller.getPlugin("modal");
        let chartPluginInfo = this.controller.getPlugin("chart");

        let modalPlugin: iModalPlugin = modalPluginInfo.plugin as iModalPlugin;
        let chartPlugin: iChartPlugin = chartPluginInfo.plugin as iChartPlugin;
        let chart: iChart = chartPlugin.createChart({ data: [], header: [] });
        let modalContainer = createElement("div");

        let controlPanel = createElementFromHTML(controlPanelTemplate);
        let setLineChart: HTMLElement = controlPanel.querySelector(".lineCH");
        let setColumnChart: HTMLElement = controlPanel.querySelector(".columnCH");
        setLineChart.onclick = () => chart.setChartType(ChartType.LINE);
        setColumnChart.onclick = () => chart.setChartType(ChartType.COLUMN);

        appendChild(controlPanel, setLineChart);
        appendChild(controlPanel, setColumnChart);

        appendChild(modalContainer, controlPanel);
        appendChild(modalContainer, chart.chartContainer);

        this.modal = modalPlugin.createModal(modalContainer);


        buttonChart.onclick = () => {
            let chartData: {
                data: Array<number>,
                header: Array<string>
            } | void = this.controller.table.getChartData(+inputChart.value);
            if (!chartData) return;
            chart.setChartData(chartData.data, chartData.header);
            this.modal.open();
        };
        appendChild(createChartContainer, buttonChart);
        appendChild(createChartContainer, inputChart);
        this.controller.table.tableElement.insertAdjacentElement("afterend", createChartContainer);
    }

    unRegister() {
        this.state$.next(PLUGIN_STATE.REMOVED);
        this.unload();
    }

    unload() {
        let buttonAction = this.controller.table.tableElement.parentNode.querySelector(".createChartContainer");
        if (buttonAction) {
            buttonAction.remove();
        }
        if (this.modal) {
            this.modal.destroy();
        }
    }
}