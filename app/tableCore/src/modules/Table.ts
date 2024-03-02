import {
  cellOptions,
  errorType,
  EventCommand,
  ICellEvent,
  IColumnEvent,
  iObservable,
  IRowEvent,
  iTable,
  tableData, TableOptionFunc, universalTableOption, TableOptions
} from "../../../../env/types";
import { getElementById } from "../../../../env/helpers/getDOMElementById";
import { Observable } from "../../../../env/helpers/observable";
import { createElement } from "../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";
import TableCell, { insertRow } from "./tableCell";


export class Table implements iTable {
  private readonly id: string;
  private tableData: tableData;
  private readonly responseValid: boolean;
  private readonly containerElement: HTMLElement;
  tableElement: HTMLElement;
  private theadElement: HTMLElement;
  private tbodyElement: HTMLElement;
  private tFooterElement: HTMLElement;
  cellOptions: cellOptions
  private TableOption: TableOptions
  column$: iObservable<IColumnEvent>;
  row$: iObservable<IRowEvent>;
  table$: iObservable<tableData>;
  cell$: iObservable<ICellEvent>;
  error$: iObservable<errorType>;

  constructor(id: string, data: tableData) {
    this.error$ = new Observable<errorType>();
    this.column$ = new Observable<IColumnEvent>();
    this.row$ = new Observable<IRowEvent>();
    this.table$ = new Observable<tableData>();
    this.cell$ = new Observable<ICellEvent>();
    this.TableOption = {
      elementShow: {
        header: true,
        footer: true
      }
    }
    this.cellOptions = {

    }
    this.responseValid = this.validate(id, data);
    if (this.responseValid) {
      this.id = id;
      this.tableData = data;
      let containerElement: string | HTMLElement = getElementById(id);

      if (containerElement instanceof HTMLElement) {
        this.containerElement = containerElement;
      } else {
        this.error$.next(containerElement);
      }
      this.renderMain();
    }
  }

  private validate(id: string, data: tableData): boolean {
    // Проверка наличия id и его типа
    if (!(getElementById(id))) {
      this.error$.next("Неверный ID. Укажите действительный идентификатор строки.");
      return false;
    }

    // Проверка наличия и типа header
    if (data.header.row.length === 0) {
      this.error$.next("Неверный заголовок таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка наличия и типа body
    if (data.body.rows.length === 0) {
      this.error$.next("Недействительное тело таблицы. Укажите непустой массив.");
      return false;
    }


    // Проверка наличия и типа footer
    if (!data.footer) {
      this.error$.next("Неверный нижний колонтитул. Укажите действительную строку.");
      return false;
    }
    // Проверка корректности формату таблицы
    if (!validateFormatData(data)) {
      this.error$.next("Неверный формат даты. Укажите действительные данные таблицы.");
      return false;
    }

    function validateFormatData(obj: tableData): boolean {
      const headerLength: number = obj.header.row.length;
      return headerLength > 0 && obj.body.rows.every(subarray => subarray.length === headerLength);
    }

    return true;
  }

  private renderMain(): void {
    let tableOption = localStorage.getItem('tableCell')
    if(tableOption){
      this.setOptions(JSON.parse(tableOption))
    }
    this.tableElement = createElement("table", ["myTable"]);
    const thead: HTMLElement = createElement("thead");
    const tbody: HTMLElement = createElement("tbody");
    const tfoot: HTMLElement = createElement("tfoot")

    appendChild(this.tableElement, thead);
    appendChild(this.tableElement, tbody)
    appendChild(this.tableElement, tfoot);
    this.theadElement = thead;
    this.tbodyElement = tbody;
    this.tFooterElement = tfoot

    this.renderHeader();
    this.renderBody();
    this.renderFooter();

    appendChild(this.containerElement, this.tableElement);
  }

  private renderHeader(): void {
    if(this.TableOption.elementShow.header){
      const row = new TableRow("header", this.tableData.header.row);
      const headerRow: HTMLElement = row.createRow(this.cellOptions);
      row.insertColumn$.subscribe((event) => this.insertColumn(event.x, event.insertData));
      row.deleteColumn$.subscribe((event) => this.deleteColumn(event.x));
      appendChild(this.theadElement, headerRow);
    }
  }


  private renderBody(): void {
    for (let index = 0; index < this.tableData.body.rows.length; index++) {
      const row = new TableRow("body", this.tableData.body.rows[index]);
      const tr = row.createRow(this.cellOptions);
      row.insertRow$.subscribe((event) => {
        if (event.direction === "before") {
          this.insertRow(index + 1);
        } else if (event.direction === "after") {
          this.insertRow(index + 2);
        }
      });
      row.deleteRow$.subscribe(() => this.deleteRow(index + 1));
      row.newValue$.subscribe((event) => {
        this.cell$.next({ x: event.x, y: index + 1, value: event.CellText });
        this.tableData.body.rows[index][event.x - 1] = event.CellText;
      });

      appendChild(this.tbodyElement, tr);
    }

  }

  private renderFooter(): void {
    if(this.TableOption.elementShow.footer){
      if (this.tableData.footer) {
        const tableCell = new TableCell(this.tableData.footer.tableDescription, this.cellOptions);
        const td: HTMLElement = tableCell.createTf();
        td.textContent = this.tableData.footer.tableDescription;
        appendChild(this.tFooterElement, td)
      }
    }
  }


  pushRow(): void {
    if (this.responseValid) {
      this.insertRow(this.tableData.body.rows.length + 1);
    }
  }

  pushColumn(header: string) {
    if (header) {
      this.insertColumn(this.tableData.header.row.length + 1, header);
    } else {
      this.error$.next("Не передан header");
    }
  }

  insertRow(rowIndex: number): void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex >= 0 && (this.tableData.body.rows[rowIndex - 1] || rowIndex === this.tableData.body.rows.length + 1)) {
        if(this.cellOptions.denyAddRow){
          this.error$.next('Действия заблокировано администратором ')
          return
        }
        let addRow: Array<string> = [];

        for (let i = 0; i < this.tableData.header.row.length; i++) {
          addRow.push("");
        }


        this.tableData.body.rows.splice(rowIndex - 1, 0, addRow);
        this.tbodyElement.innerHTML = "";
        this.renderBody();
        this.row$.next({ command: EventCommand.ADD, position: rowIndex });
      } else {
        this.error$.next("Не корректные координаты для вставки ряда");
      }
    }
  }

  insertColumn(columnIndex: number, columnHeader: string): void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex >= 0 && columnHeader && (this.tableData.header.row[columnIndex - 1]) || columnIndex === this.tableData.header.row.length + 1) {
        if(this.cellOptions.denyAddColumn){
          this.error$.next('Действия заблокировано администратором ')
          return
        }
        this.tableData.header.row.splice(columnIndex - 1, 0, columnHeader);

        for (let index = 0; index < this.tableData.body.rows.length; index++) {
          this.tableData.body.rows[index].splice(columnIndex - 1, 0, "");
        }

        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();
        this.row$.next({ command: EventCommand.ADD, position: columnIndex });
      } else {
        this.error$.next("Не корректные координаты для вставки колонки, или не передан header");
      }
    }
  }

  deleteRow(rowIndex: number): void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex > 0 && this.tableData.body.rows.length >= rowIndex && this.tableData.body.rows[rowIndex - 1]) {
        if(this.cellOptions.denyRemoveRow) {
          this.error$.next('Действия заблокировано администратором ')
          return
        }
        this.tableData.body.rows.splice(rowIndex - 1, 1);
        this.tbodyElement.innerHTML = "";
        this.renderBody();

        this.row$.next({ command: EventCommand.REMOVE, position: rowIndex });
      } else {
        this.error$.next("Не корректные координаты для удаление ряда");
      }
    }
  }

  deleteColumn(columnIndex: number): void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex > 0 && this.tableData.header.row[columnIndex - 1]) {
        if(this.cellOptions.denyRemoveColumn) {
          this.error$.next('Действия заблокировано администратором ')
          return
        }
        this.tableData.header.row.splice(columnIndex - 1, 1);
        for (let index = 0; index < this.tableData.body.rows.length; index++) {
          this.tableData.body.rows[index].splice(columnIndex - 1, 1);
        }

        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();

        this.column$.next({ command: EventCommand.REMOVE, position: columnIndex });
      } else {
        this.error$.next("Не корректные координаты для удаление колонки");
      }
    }
  }

  getChartData(rowIndex: number): { data: Array<number>, header: Array<string> } | void {
    if (this.responseValid) {
      if (this.tableData.body.rows[rowIndex - 1]) {
        let formatError: boolean = false;
        let errorArray: Array<string> = [];

        for (let index = 0; index < this.tableData.body.rows[rowIndex - 1].length; index++) {
          const item = this.tableData.body.rows[rowIndex - 1][index];
          if (!(+item)) {
            formatError = true;
            errorArray.push(`В ячейке y:${rowIndex} x:${index + 1} не число`);
          }
        }

        if (!formatError) {
          let numberData: Array<number> = this.tableData.body.rows[rowIndex - 1].map((item) => +item ? +item : 0);
          let headerData: Array<string> = this.tableData.header.row;
          return { data: numberData, header: headerData };
        } else {
          let errorString = errorArray.join("<br>");
          this.error$.next(errorString);
        }
      }
    }
  }

  setTable(tableData: tableData): void {
    let thisResponseValid: boolean = this.validate(this.id, tableData);
    if (this.responseValid && thisResponseValid) {
      if (JSON.stringify(tableData) !== JSON.stringify(this.tableData)) {
        this.tableData = tableData;
        if(this.theadElement){
          this.theadElement.innerHTML = "";
        }
        this.tbodyElement.innerHTML = "";
        this.tFooterElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();
        this.renderFooter();
        this.table$.next(this.tableData);
      }
    }
  }

  setOptions(options: universalTableOption) {
    let optionsFunc: TableOptionFunc = {
      showHeader: (show:boolean)=> this.TableOption.elementShow.header = show,
      showFooter: (show:boolean)=> this.TableOption.elementShow.footer = show,
      showVerticalLine: (show:boolean)=> cellOptions.showVerticalLine = show,
      showHorizontalLine: (show: boolean)=> cellOptions.showHorizontalLine = show,
      widthVerticalLine: (width:string) => cellOptions.widthVerticalLine = width,
      widthHorizontalLine: (width:string) => cellOptions.widthHorizontalLine = width,
      colorBackgroundHeader: (color: string) => cellOptions.colorBackgroundHeader = color,
      colorBackgroundCell: (color: string) => cellOptions.colorBackgroundCell = color,
      colorBackgroundFooter: (color: string) => cellOptions.colorBackgroundFooter = color,
      colorEditableBackgroundCell: (color: string) => cellOptions.colorEditableBackgroundCell = color,
      colorHeader: (color: string) => cellOptions.colorHeader = color,
      colorBody: (color: string) => cellOptions.colorBody = color,
      colorFooter: (color: string) => cellOptions.colorFooter = color,
      colorEditableCell: (color: string) => cellOptions.colorEditableCell = color,
      colorLine: (color:string) => cellOptions.colorLine = color,
      denyAddColumn:(isDeny:boolean)=> cellOptions.denyAddColumn = isDeny,
      denyAddRow: (isDeny:boolean)=> cellOptions.denyAddRow = isDeny,
      denyRemoveColumn: (isDeny:boolean)=> cellOptions.denyRemoveColumn = isDeny,
      denyRemoveRow: (isDeny:boolean)=> cellOptions.denyRemoveRow = isDeny,
      denyResizeColumn: (isDeny:boolean)=> cellOptions.denyResizeColumn = isDeny,
      denyEditCell: (isDeny:boolean)=> cellOptions.denyEditCell = isDeny
    };
    let cellOptions: cellOptions = {};

    for (let key in options) {
      if (optionsFunc[key]) {
        optionsFunc[key](options[key]);
      }
    }
    this.cellOptions = cellOptions
    if(this.theadElement){
      this.theadElement.innerHTML = "";
    }
    if(this.tbodyElement){
      this.tbodyElement.innerHTML = "";
    }
    if(this.tFooterElement){
      this.tFooterElement.innerHTML = "";
    }
    this.renderHeader();
    this.renderBody();
    this.renderFooter();
  }
}


export type iTableRow = {
  insertColumn$: iObservable<{ insertData: string, x: number, }>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<{ x: number }>
  deleteRow$: iObservable<null>
  newValue$: iObservable<{ CellText: string, x: number }>
  createRow: () => HTMLElement
}

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
    const cellRow: HTMLElement = createElement("tr");
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
