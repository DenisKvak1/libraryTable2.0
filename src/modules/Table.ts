import { iObservable, iTable } from "../env/types";
import { errorProcessing } from "../helpers/errorProcessing";
import { createElement } from "../helpers/createDOMElements";
import { appendChild } from "../helpers/appendRemoveChildDOMElements";
import { Observable } from "../helpers/observable";
import { getElementById } from "../helpers/getDOMElementById";

export type tableData = {
  header: Array<string>,
  body: Array<Array<string>>,
  footer: string
}

export class Table implements iTable {
  private readonly id: string;
  private tableData: tableData;
  private readonly responseValid: boolean;
  private readonly containerElement: HTMLElement;
  private observable: iObservable;
  private tableElement: HTMLElement;
  private theadElement: HTMLElement;
  private tbodyElement: HTMLElement;
  private tFooterElement: HTMLElement;

  constructor(id: string, data: tableData) {
    this.responseValid = this.validate(id, data);
    if (this.responseValid) {
      this.id = id;
      this.tableData = data;
      let containerElement: string | HTMLElement = getElementById(id);
      if (containerElement instanceof HTMLElement) {
        this.containerElement = containerElement;
      } else {
        errorProcessing(containerElement);
      }
      this.renderMain();
      this.observable = new Observable();

    }
  }

  private validate(id: string, data: tableData): boolean {
    // Проверка наличия id и его типа
    if (!(getElementById(id))) {
      errorProcessing("Неверный ID. Укажите действительный идентификатор строки.");
      return false;
    }

    // Проверка наличия и типа header
    if (data.header.length === 0) {
      errorProcessing("Неверный заголовок таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка наличия и типа body
    if (data.body.length === 0) {
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

    function validateFormatData(obj: tableData): boolean {
      const headerLength: number = obj.header.length;
      return headerLength > 0 && obj.body.every(subarray => subarray.length === headerLength);
    }

    return true;
  }

  private renderMain(): void {
    this.tableElement = createElement("table", ["myTable"]);
    const thead: HTMLElement = createElement("thead");
    const tbody: HTMLElement = createElement("tbody");

    appendChild(this.tableElement, thead);
    appendChild(this.tableElement, tbody);
    this.theadElement = thead;
    this.tbodyElement = tbody;

    this.renderHeader();
    this.renderBody();
    this.renderFooter();

    appendChild(this.containerElement, this.tableElement);
  }

  private renderHeader(): void {
    const headerRow: HTMLElement = createElement("tr", ["headerTable"]);
    for (let index = 0; index < this.tableData.header.length; index++) {
      const headerCellText = this.tableData.header[index];
      let th: HTMLElement = this.createTh(index, headerCellText);
      appendChild(headerRow, th);
    }
    appendChild(this.theadElement, headerRow);
  }


  private renderBody(): void {
    for (let indexUp = 0; indexUp < this.tableData.body.length; indexUp++) {
      const tr: HTMLElement = createElement("tr");
      for (let index = 0; index < this.tableData.body[indexUp].length; index++) {
        let td:HTMLElement
        if(index===0){
          td = this.createTd(index, indexUp, true)
        } else {
          td = this.createTd(index, indexUp, false)
        }

        appendChild(tr, td);
      }
      appendChild(this.tbodyElement, tr);
    }

  }

  private renderFooter(): void {
    if (this.tableData.footer) {
      const tfoot: HTMLElement = createElement("tfoot");
      this.tFooterElement = tfoot;

      const td: HTMLElement = createElement("td", ["footerTable"]);
      td.textContent = this.tableData.footer;

      appendChild(tfoot, td);
      appendChild(this.tableElement, tfoot);
    }
  }
  private createTd(index:number, indexUp:number, buttonAction:boolean = false){
    const td: HTMLElement = createElement("td");
    const tdContainer = createElement("div", ["tdCont"]);

    tdContainer.addEventListener("mouseout", (event) => {
      event.stopPropagation();
    });

    let textNode: HTMLElement = createElement("div", ["tdTextNode"]);
    let tdPopperAddCont1: HTMLElement
    let tdPopperAddCont2: HTMLElement
    let tdPopperRemoveCont1: HTMLElement
    let tdPopperAdd1: HTMLElement
    let tdPopperAdd2: HTMLElement
    let tdPopperRemove1: HTMLElement
    let tdAddRowBtn: HTMLElement
    let tdAddRowBtn2: HTMLElement
    let tdRemoveRowBtn: HTMLElement

    if(buttonAction){
      tdPopperAddCont1 = createElement("div", ["tdPopperAddCont", "bottom5"]);
      tdPopperAddCont2 = createElement("div", ["tdPopperAddCont", "top5"]);
      tdPopperRemoveCont1 = createElement("div", ["tdPopperRemoveCont"]);
      tdPopperAdd1 = createElement("div", ["tdPopperAdd"]);
      tdPopperAdd2 = createElement("div", ["tdPopperAdd"]);
      tdPopperRemove1 = createElement("div", ["tdPopperRemove"]);
      tdAddRowBtn = createElement("button");
      tdAddRowBtn2 = createElement("button");
      tdRemoveRowBtn = createElement("button");
      tdAddRowBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
      tdAddRowBtn2.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
      tdRemoveRowBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill=\"#1e2633\" d=\"M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z\"/></svg>";
      tdAddRowBtn.onclick = () => {

        this.insertRow(indexUp + 1);
      };
      tdAddRowBtn2.onclick = () => {
        this.insertRow(indexUp + 2);
      };
      tdRemoveRowBtn.onclick = () => {
        this.deleteRow(indexUp + 1);
      };
      document.addEventListener("DOMSubtreeModified", (): void => {
        tdPopperAdd1.style.top = `${-(tdPopperAdd1.offsetHeight / 2)}px`;
        tdPopperAdd2.style.bottom = `${-(tdPopperAdd1.offsetHeight / 2 - 1)}px`;
      });
    }

    textNode.textContent = this.tableData.body[indexUp][index];
    textNode.contentEditable = "true";

    textNode.onblur = (event:Event)=>this.cellChange(event, true)
    td.onmouseleave = this.cellChange;
    td.onmouseout = this.cellChange;
    td.onkeydown = this.listenChangeCellOnKey;
    if(buttonAction){
      appendChild(tdPopperRemove1, tdRemoveRowBtn);
      appendChild(tdPopperRemoveCont1, tdPopperRemove1);
      appendChild(tdPopperAdd1, tdAddRowBtn);
      appendChild(tdPopperAdd2, tdAddRowBtn2);
      appendChild(tdPopperAddCont1, tdPopperAdd1);
      appendChild(tdPopperAddCont2, tdPopperAdd2);
      appendChild(tdContainer, tdPopperRemoveCont1);
      appendChild(tdContainer, tdPopperAddCont1);
    }

    appendChild(tdContainer, textNode);

    if(buttonAction) {
      appendChild(tdContainer, tdPopperAddCont2);
    }

    appendChild(td, tdContainer);
    return td
  }
  private createTh(index:number, headerCellText:string){
    const th: HTMLElement = createElement("th");

    const thContainer: HTMLElement = createElement("div", ["thCont"]);
    let textNode: HTMLElement = createElement("div", ["tdTextNode"]);
    let thPopperAddCont1: HTMLElement = createElement("div", ["thPopperAddCont", "right20"]);
    let thPopperAddCont2: HTMLElement = createElement("div", ["thPopperAddCont", "left20"]);
    let thPopperRemoveCont1: HTMLElement = createElement("div", ["thPopperRemoveCont"]);

    let thPopperAdd1: HTMLElement = createElement("div", ["thPopperAdd"]);
    let thPopperAdd2: HTMLElement = createElement("div", ["thPopperAdd"]);
    let thPopperRemove1: HTMLElement = createElement("div", ["thPopperRemove"]);

    let thAddColumnBtn: HTMLElement = createElement("button");
    let thAddColumnBtn2: HTMLElement = createElement("button");
    let thRemoveColumnBtn: HTMLElement = createElement("button");

    let thAddColumnInput: HTMLInputElement = createElement("input", ["thPopperAddInput"]) as HTMLInputElement;
    let thAddColumnInput2: HTMLInputElement = createElement("input", ["thPopperAddInput"]) as HTMLInputElement;

    thAddColumnBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
    thAddColumnBtn2.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
    thRemoveColumnBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill=\"#1e2633\" d=\"M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z\"/></svg>";

    thAddColumnBtn.onclick = () => {
      if (thAddColumnInput.value) {
        this.insertColumn(index + 1, thAddColumnInput.value);
      }
    };
    thAddColumnBtn2.onclick = () => {
      if (thAddColumnInput2.value) {
        this.insertColumn(index + 2, thAddColumnInput2.value);
      }
    };
    thRemoveColumnBtn.onclick = () => {
      this.deleteColumn(index + 1);
    };

    document.addEventListener("DOMSubtreeModified", (): void => {
      thPopperAdd1.style.left = `${-(thPopperAdd1.offsetWidth / 2)}px`;
      thPopperAdd2.style.right = `${-(thPopperAdd1.offsetWidth / 2)}px`;
    });

    textNode.textContent = headerCellText;

    let isResizing: boolean = false;
    let direction:string
    let lastDownX:number = 0;

    const startResize = (event: MouseEvent):void => {
      if(Array.from(th.parentNode.children).indexOf(th) !== 0)
        if (event.target === thPopperAddCont1) {
          direction = 'left'
        } else if (event.target === thPopperAddCont2) {
          direction = 'right'
        }

      isResizing = true;
      document.addEventListener('mousemove', handleResize)
      document.addEventListener("mouseup", stopResize);

      lastDownX = event.clientX;
    };

    const handleResize = (event: MouseEvent):void => {
      if (direction === 'right' && isResizing) {
        let width: number = th.offsetWidth + (event.clientX - lastDownX);
        th.style.width = `${width}px`;
        lastDownX = event.clientX;
      } else if (direction === 'left' && isResizing) {
        let lTh: HTMLElement = Array.from(th.parentNode.children)[Array.from(th.parentNode.children).indexOf(th) - 1] as HTMLElement;
        let width: number = lTh.offsetWidth + (event.clientX - lastDownX);
        lTh.style.width = `${width}px`;
        lastDownX = event.clientX;
      }
    };

    const stopResize = ():void => {
      isResizing = false;
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener("mouseup", stopResize);
    };

    th.onmousedown = (event) => startResize(event);

    appendChild(thPopperAdd1, thAddColumnInput);
    appendChild(thPopperAdd2, thAddColumnInput2);
    appendChild(thPopperAdd1, thAddColumnBtn);
    appendChild(thPopperAdd2, thAddColumnBtn2);
    appendChild(thPopperRemove1, thRemoveColumnBtn);
    appendChild(thPopperRemoveCont1, thPopperRemove1);
    appendChild(thPopperAddCont1, thPopperAdd1);
    appendChild(thPopperAddCont2, thPopperAdd2);
    appendChild(thContainer, thPopperAddCont1);
    appendChild(thContainer, textNode);
    appendChild(thContainer, thPopperAddCont2);
    appendChild(thContainer, thPopperRemoveCont1);
    appendChild(th, thContainer);
    return th
  }
  private cellChange = (event: Event, blur:boolean = false): void => {
    let targetElement: HTMLElement = event.target as HTMLElement;
    if(blur){
      targetElement = targetElement.parentNode.parentNode as HTMLElement
    }
    let elementsArrayX = Array.from((targetElement.parentNode as Element).children);
    let elementsArrayY = Array.from((targetElement.parentNode as Element).parentNode!.children);
    let indexX = elementsArrayX.indexOf(targetElement);
    let indexY = elementsArrayY.indexOf(targetElement.parentNode as Element);
    if (targetElement.textContent !== this.tableData.body[indexY][indexX]) {
      this.tableData.body[indexY][indexX] = targetElement.textContent;
      let textNode = targetElement.querySelector('.tdTextNode') as HTMLElement
      textNode.blur()

      this.triggerEvent("changeCellContent", {
        x: indexX + 1,
        y: indexY + 1,
        newContent: targetElement.textContent
      });
    }
  };


  private listenChangeCellOnKey = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.cellChange(event);
    }
  };



  pushRow(): void {
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
  insertRow(rowIndex: number): void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex >= 0 && (this.tableData.body[rowIndex - 1] || rowIndex === this.tableData.body.length + 1)) {
        let addRow: Array<string> = [];

        for (let i = 0; i < this.tableData.header.length; i++) {
          addRow.push("");
        }


        this.tableData.body.splice(rowIndex - 1, 0, addRow);
        this.tbodyElement.innerHTML = "";
        this.renderBody();
        this.triggerEvent("addRow", { y: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для вставки ряда");
      }
    }
  }

  insertColumn(columnIndex: number, columnHeader: string): void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex >= 0 && columnHeader && (this.tableData.header[columnIndex - 1]) || columnIndex === this.tableData.header.length + 1) {
        this.tableData.header.splice(columnIndex - 1, 0, columnHeader);

        for (let index = 0; index < this.tableData.body.length; index++) {
          this.tableData.body[index].splice(columnIndex - 1, 0, "");
        }

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

  deleteRow(rowIndex: number): void {
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

  deleteColumn(columnIndex: number): void {
    if (this.responseValid) {
      if (+columnIndex && columnIndex > 0 && this.tableData.header[columnIndex - 1]) {
        this.tableData.header.splice(columnIndex - 1, 1);
        for (let index = 0; index < this.tableData.body.length; index++) {
          this.tableData.body[index].splice(columnIndex - 1, 1);
        }

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

  getChartData(rowIndex: number): { data: Array<number>, header: Array<string> } | void {
    if (this.responseValid) {
      if (this.tableData.body[rowIndex - 1]) {
        let formatError: boolean = false;
        let errorArray: Array<string> = [];

        for (let index = 0; index < this.tableData.body[rowIndex - 1].length; index++) {
          const item = this.tableData.body[rowIndex - 1][index];
          if (!(+item)) {
            formatError = true;
            errorArray.push(`В ячейке y:${rowIndex} x:${index + 1} не число`);
          }
        }

        if (!formatError) {
          let numberData: Array<number> = this.tableData.body[rowIndex - 1].map((item) => +item ? +item : 0);
          let headerData: Array<string> = this.tableData.header;
          return { data: numberData, header: headerData };
        } else {
          errorProcessing(errorArray);
        }
      }
    }
  }

  setTable(tableData: tableData): void {
    let thisResponseValid: boolean = this.validate(this.id, tableData);
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

  subscribe(eventName: string, callback: (eventData: any) => void): { unsubscribe: () => void } {
    return this.observable.subscribe(eventName, callback);
  }

  triggerEvent(eventName: string, data: Record<string, any>): void {
    this.observable.next(eventName, data);
  }
}
