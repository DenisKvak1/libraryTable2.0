import { Table } from "./modules/Table";
import { TableController } from "./modules/tableController"
import "./style.css";
import { ErrorProcessing } from "../../errorProcessing/src/index"
import { ModalPlugin } from "../../ModalPlugin/src/index"
import { ChartControl } from "../../controlChartPlugin/src/index"
import { ChartPlugin } from "../../chartPlugin/src/index"

(window as any).TableController = TableController;

export { Table, ErrorProcessing,ChartControl,ChartPlugin, ModalPlugin,TableController }; // для Dev mode
