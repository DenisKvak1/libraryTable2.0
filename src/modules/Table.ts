import {iObservable, iTable} from "../env/types";
import {errorProcessing} from "../helpers/errorProcessing";
import {createElement} from "../helpers/createDOMElements";
import {appendChild} from "../helpers/appendRemoveChildDOMElements";
import {Observable} from "../helpers/observable";

export type tableData = {
  header: Array<string>,
  body: Array<Array<string>>,
  footer: string
}

export class Table implements iTable{
  id: string
  tableData: tableData
  responseValid : Boolean
  containerElement: HTMLElement
  observable : iObservable
  tableElement: HTMLElement
  theadElement : HTMLElement
  tbodyElement : HTMLElement
  tFooterElement : HTMLElement
  constructor(id:string, data:tableData) {
    this.responseValid = this.validate(id, data);
    if (this.responseValid) {
      this.id = id;
      this.tableData = data;
      this.containerElement = document.getElementById(id);
      this.renderMain();
      this.createStyles();
      this.observable = new Observable();

    }
  }

  private validate(id:string, data:tableData):Boolean {
    // Проверка наличия id и его типа
    if (!id || !(document.getElementById(id))) {
      errorProcessing("Неверный ID. Укажите действительный идентификатор строки.");
      return false;
    }

    // Проверка наличия и типа header
    if (!data.header || data.header.length === 0) {
      errorProcessing("Неверный заголовок таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка наличия и типа body
    if (!data.body  || data.body.length === 0) {
      errorProcessing("Недействительное тело таблицы. Укажите непустой массив.");
      return false;
    }


    // Проверка наличия и типа footer
    if (!data.footer) {
      errorProcessing("Неверный нижний колонтитул. Укажите действительную строку.");
      return false;
    }
    // Проверка корректности формату таблицы
    if (!validateFormatData(data)) {
      errorProcessing("Неверный формат даты. Укажите действительные данные таблицы.");
      return false;
    }

    function validateFormatData(obj:tableData):Boolean {
      const headerLength:number = obj.header.length;
      return headerLength > 0 && obj.body.every(subarray => subarray.length === headerLength);
    }

    return true;
  }

  private renderMain():void {
    this.tableElement = createElement("table", ["myTable"]);
    const thead:HTMLElement = createElement("thead");
    const tbody:HTMLElement = createElement("tbody");

    appendChild(this.tableElement, thead);
    appendChild(this.tableElement, tbody);
    this.theadElement = thead;
    this.tbodyElement = tbody;

    this.renderHeader();
    this.renderBody();
    this.renderFooter();

    appendChild(this.containerElement, this.tableElement);
  }

  private renderHeader():void {
    const headerRow:HTMLElement = createElement("tr", ["headerTable"]);
    this.tableData.header.forEach((headerCellText:string) => {
      const th:HTMLElement = createElement("th");
      th.textContent = headerCellText;
      appendChild(headerRow, th);

    });
    appendChild(this.theadElement, headerRow);
  }


  private renderBody():void {
    this.tableData.body.forEach((_row:Array<string>, indexUp:number) => {
      const tr:HTMLElement = createElement("tr");
      this.tableData.body[indexUp].forEach((_item, index) => {
        const td:HTMLElement = createElement("td");
        td.textContent = this.tableData.body[indexUp][index];
        td.contentEditable = 'true';
        td.onblur = this.cellChange;
        td.onmouseout = this.cellChange;
        td.onkeydown = this.listenChangeCellOnKey;
        appendChild(tr, td);
      });
      appendChild(this.tbodyElement, tr);
    });
  }

  private renderFooter():void {
    if (this.tableData.footer) {
      const tfoot:HTMLElement = createElement("tfoot");
      this.tFooterElement = tfoot;
      const td:HTMLElement = createElement("td", ["footerTable"]);
      td.textContent = this.tableData.footer;
      appendChild(tfoot, td);
      appendChild(this.tableElement, tfoot);
    }
  }

  private cellChange = (event: Event): void => {
    const targetElement:HTMLElement = event.target as HTMLElement;

    let elementsArrayX = Array.from((targetElement.parentNode as Element).children);
    let elementsArrayY = Array.from((targetElement.parentNode as Element).parentNode!.children);
    let indexX = elementsArrayX.indexOf(targetElement);
    let indexY = elementsArrayY.indexOf(targetElement.parentNode as Element);

    if (targetElement.textContent !== this.tableData.body[indexY][indexX]) {
      this.tableData.body[indexY][indexX] = targetElement.textContent;
      if (document.activeElement === targetElement) {
        targetElement.blur();
      }
      console.log(`x:${indexX + 1},y:${indexY + 1}, content: ${targetElement.textContent}`);
      this.triggerEvent("changeCellContent", {
        x: indexX + 1,
        y: indexY + 1,
        newContent: targetElement.textContent
      });
    }
  };



    private listenChangeCellOnKey = (event: KeyboardEvent):void => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.cellChange(event);
        const targetElement:HTMLElement = event.target as HTMLElement;
        targetElement.blur();
      }
    };

  private createStyles():void {
    const style:HTMLElement = createElement("style", ["tableStyle"]);
    const existingStyle:HTMLElement = document.head.querySelector(".tableStyle");

    if (!existingStyle) {
      style.className = "tableStyle";
      style.innerHTML = `
          *{
            box-sizing: border-box;
          }
          .myTable {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .footerTable {
            background-color: rgba(128, 128, 128, 0.1);
          }
          .myTable td, .myTable th {
            padding: 0 20px;
            height: 40px;
            border: 1px solid black;
          }
        `;
      appendChild(document.head, style);
    }
  }

  pushRow():void {
    if (this.responseValid) {
      this.insertRow(this.tableData.body.length + 1);
    }
  }

  pushColumn(header: string) {
    if (header) {
      this.insertColumn(this.tableData.header.length + 1, header);
    } else {
      errorProcessing("Не передан header");
    }
  }

  insertRow(rowIndex: number):void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex >= 0 && (this.tableData.body[rowIndex - 1] || rowIndex === this.tableData.body.length + 1)) {
        let addRow:Array<string> = [];
        this.tableData.header.forEach(() => addRow.push(""));
        this.tableData.body.splice(rowIndex - 1, 0, addRow);
        this.tbodyElement.innerHTML = "";
        this.renderBody();
        this.triggerEvent("addRow", { y: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для вставки ряда");
      }
    }
  }

  insertColumn(columnIndex:number, columnHeader:string):void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex >= 0 && columnHeader && (this.tableData.header[columnIndex - 1]) || columnIndex === this.tableData.header.length + 1) {
        this.tableData.header.splice(columnIndex - 1, 0, columnHeader);
        this.tableData.body.forEach((_item, index) => this.tableData.body[index].splice(columnIndex - 1, 0, ""));
        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();
        this.triggerEvent("addColumn", { x: columnIndex });
      } else {
        errorProcessing("Не корректные координаты для вставки колонки, или не передан header");
      }
    }
  }

  deleteRow(rowIndex:number):void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex > 0 && this.tableData.body.length >= rowIndex && this.tableData.body[rowIndex - 1]) {
        this.tableData.body.splice(rowIndex - 1, 1);
        this.tbodyElement.innerHTML = "";
        this.renderBody();
        this.triggerEvent("removeRow", { y: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для удаление ряда");
      }
    }
  }

  deleteColumn(columnIndex:number):void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex > 0 && this.tableData.header[columnIndex - 1]) {
        this.tableData.header.splice(columnIndex - 1, 1);
        this.tableData.body.forEach((_item, index) => this.tableData.body[index].splice(columnIndex - 1, 1));
        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();
        this.triggerEvent("removeColumn", { x: columnIndex });
      } else {
        errorProcessing("Не корректные координаты для удаление колонки");
      }
    }
  }

  getChartData(rowIndex:number):{data: Array<number>, header: Array<string>} | void{
    if (this.responseValid) {
      if (this.tableData.body[rowIndex - 1]) {
        let formatError:boolean = false;
        let errorArray:Array<string> = [];
        this.tableData.body[rowIndex - 1].forEach((item, index) => {
          if (!(+item)) {
            formatError = true;
            errorArray.push(`В ячейке y:${rowIndex} x:${[index + 1]} не число`);
          }
        });
        if (!formatError) {
          let numberData:Array<number> = this.tableData.body[rowIndex - 1].map((item) => +item ? +item : 0);
          let headerData:Array<string> = this.tableData.header;
          return { data: numberData, header: headerData };
        } else {
          errorProcessing(errorArray);
        }
      }
    }
  }

  setTable(tableData:tableData):void {
    let thisResponseValid:Boolean = this.validate(this.id, tableData);
    if (this.responseValid && thisResponseValid) {
      if (JSON.stringify(tableData) !== JSON.stringify(this.tableData)) {
        this.tableData = tableData;
        this.theadElement.innerHTML = "";
        this.tbodyElement.innerHTML = "";
        this.tFooterElement.innerHTML = "";
        this.renderHeader();
        this.renderBody();
        this.renderFooter();
        this.triggerEvent("setTable", this.tableData);
      }
    }
  }

  subscribe(eventName:string, callback:(eventData: any) => void):{ unsubscribe: () => void } {
    return this.observable.subscribe(eventName, callback);
  }

  triggerEvent(eventName:string, data:Record<string, any>):void {
    this.observable.next(eventName, data);
  }
}
