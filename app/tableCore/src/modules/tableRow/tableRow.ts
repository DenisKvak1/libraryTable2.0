import { cellOptions, iObservable } from "../../../../../env/types";
import TableCell, { insertRow } from "../tableCell/tableCell";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { iTableRow } from "../table/Table";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { rowTemplate } from "./template";

export class TableRow implements iTableRow {
  private readonly content: Array<string>;
  private readonly type: string;
  insertColumn$: iObservable<{ insertData: string, x: number, }>;
  insertRow$: iObservable<insertRow>;
  deleteColumn$: iObservable<{ x: number }>;
  deleteRow$: iObservable<null>;
  newValue$: iObservable<{ CellText: string, x: number }>;

  constructor(type: string, content: Array<string>) {
    this.type = type;
    this.content = content;
    this.insertColumn$ = new Observable<{ insertData: string, x: number, }>();
    this.insertRow$ = new Observable<insertRow>();
    this.deleteColumn$ = new Observable<{ x: number }>();
    this.deleteRow$ = new Observable();
    this.newValue$ = new Observable();
  }

  createRow(cellOption?: cellOptions): HTMLElement {
    let option = {};
    if (cellOption) {
      option = cellOption;
    }
    const cellRow: HTMLElement = createElementFromHTML(rowTemplate)
    for (let index = 0; index < this.content.length; index++) {
      const cellText: string = this.content[index];

      let tableCell;
      let tableCellElement: HTMLElement;

      if (this.type === "header") {
        tableCell = new TableCell(cellText, option);
        tableCellElement = tableCell.createTh();
      } else if (this.type === "body") {
        if (index === 0) {
          tableCell = new TableCell(cellText, option, true);
        } else {
          tableCell = new TableCell(cellText, option);
        }
        tableCellElement = tableCell.createTd();

      }

      if (tableCellElement instanceof HTMLElement) {
        tableCell.newValue$.subscribe((cellText) => this.newValue$.next({ CellText: cellText, x: index + 1 }));
        tableCell.insertColumn$.subscribe((event) => {
          if (event.direction === "before") {
            this.insertColumn$.next({ insertData: event.insertData, x: index + 1 });
          } else if (event.direction === "after") {
            this.insertColumn$.next({ insertData: event.insertData, x: index + 2 });
          }
        });
        tableCell.insertRow$.subscribe((event: insertRow) => this.insertRow$.next({ direction: event.direction }));

        tableCell.deleteRow$.subscribe(() => this.deleteRow$.next());
        tableCell.deleteColumn$.subscribe(() => this.deleteColumn$.next({ x: index + 1 }));

        appendChild(cellRow, tableCellElement);
      }
    }
    return cellRow;
  }
}
