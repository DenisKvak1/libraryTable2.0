import { Table } from "./modules/table/Table";
import { TableController } from "./tableController"
import "./style.css";
import { ErrorProcessing } from "../../errorProcessing/src/index"
import { ModalPlugin } from "../../ModalPlugin/src/index"
import { ChartControl } from "../../controlChartPlugin/src/index"
import { ChartPlugin } from "../../chartPlugin/src/index"
import {AdminPanel} from "../../adminPanel/src/index"
(window as any).TableController = TableController;

export { Table, ErrorProcessing,ChartControl, AdminPanel, ChartPlugin, ModalPlugin,TableController }; // для Dev mode
