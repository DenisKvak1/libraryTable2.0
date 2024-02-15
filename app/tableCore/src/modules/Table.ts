import { iObservable, iTable } from "../../../../env/types";
import { tableData } from "../../../../env/types";
import { getElementById } from "../../../../env/helpers/getDOMElementById";
import { Observable } from "../../../../env/helpers/observable";
import { createElement } from "../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";


export class Table implements iTable {
  private readonly id: string;
  private tableData: tableData;
  private readonly responseValid: boolean;
  private readonly containerElement: HTMLElement;
  tableElement: HTMLElement;
  private theadElement: HTMLElement;
  private tbodyElement: HTMLElement;
  private tFooterElement: HTMLElement;

  addColumn$: iObservable<{x:number}>
  addRow$: iObservable<{y:number}>
  removeRow$: iObservable<{y:number}>
  removeColumn$: iObservable<{x:number}>
  setTable$: iObservable<tableData>
  changeCellContent$: iObservable<{x:number, y:number, textContent:string}>
  error$ :iObservable<string | Array<string>>

  constructor(id: string, data: tableData) {
    this.responseValid = this.validate(id, data);
    if (this.responseValid) {
      this.id = id;
      this.tableData = data;
      let containerElement: string | HTMLElement = getElementById(id);
      this.addColumn$ = new Observable<{x:number}>()
      this.addRow$ = new Observable<{y:number}>()
      this.removeRow$ = new Observable<{y:number}>()
      this.removeColumn$ = new Observable<{x:number}>()
      this.setTable$ = new Observable<tableData>()
      this.changeCellContent$ = new Observable<{x:number, y:number, textContent:string}>()
      this.error$ = new Observable<string | Array<string>>()

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
    if (data.header.length === 0) {
      this.error$.next("Неверный заголовок таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка наличия и типа body
    if (data.body.length === 0) {
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
    const row = new TableRow('header',this.tableData.header)
    const headerRow: HTMLElement = row.createRow()
    row.insertColumn$.subscribe((event)=>this.insertColumn(event.x, event.insertData))
    row.deleteColumn$.subscribe((event)=>this.deleteColumn(event.x))
    appendChild(this.theadElement, headerRow);
  }


  private renderBody(): void {
    for (let index = 0; index < this.tableData.body.length; index++) {
      const row = new TableRow('body',this.tableData.body[index])
      const tr = row.createRow()
      row.insertRow$.subscribe((event)=>{
        if(event.direction==='before'){
          this.insertRow(index+1)
        } else if(event.direction==='after'){
          this.insertRow(index+2)
        }
      })
      row.deleteRow$.subscribe(()=>this.deleteRow(index+1))
      row.newValue$.subscribe((event)=>{
        this.changeCellContent$.next({x:event.x, y:index+1, textContent:event.CellText})
        this.tableData.body[index][event.x-1] = event.CellText
      })

      appendChild(this.tbodyElement, tr);
    }

  }

  private renderFooter(): void {
    if (this.tableData.footer) {
      const tfoot: HTMLElement = createElement("tfoot");
      this.tFooterElement = tfoot;
      const tableCell = new TableCell(this.tableData.footer)
      const td: HTMLElement = tableCell.createTf()
      td.textContent = this.tableData.footer;

      appendChild(tfoot, td);
      appendChild(this.tableElement, tfoot);
    }
  }


  pushRow(): void {
    if (this.responseValid) {
      this.insertRow(this.tableData.body.length + 1);
    }
  }

  pushColumn(header: string) {
    if (header) {
      this.insertColumn(this.tableData.header.length + 1, header);
    } else {
      this.error$.next("Не передан header");
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
        this.addRow$.next({ y: rowIndex })
      } else {
        this.error$.next("Не корректные координаты для вставки ряда");
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
        this.addColumn$.next({ x: columnIndex })
      } else {
        this.error$.next("Не корректные координаты для вставки колонки, или не передан header");
      }
    }
  }

  deleteRow(rowIndex: number): void {
    if (this.responseValid) {
      if (+rowIndex && rowIndex > 0 && this.tableData.body.length >= rowIndex && this.tableData.body[rowIndex - 1]) {
        this.tableData.body.splice(rowIndex - 1, 1);
        this.tbodyElement.innerHTML = "";
        this.renderBody();

        this.removeRow$.next({ y: rowIndex })
      } else {
        this.error$.next("Не корректные координаты для удаление ряда");
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

        this.removeColumn$.next({ x: columnIndex })
      } else {
        this.error$.next("Не корректные координаты для удаление колонки");
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
          this.error$.next(errorArray);
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
        this.setTable$.next(this.tableData)
      }
    }
  }
}


type iTableRow = {
  insertColumn$: iObservable<{ insertData: string,  x: number, }>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<{x: number}>
  deleteRow$: iObservable<null>
  newValue$: iObservable<{CellText:string, x:number}>
  createRow: ()=>HTMLElement
}
class TableRow implements iTableRow{
  private readonly content: Array<string>
  private readonly type:string
  insertColumn$: iObservable<{ insertData: string,  x: number, }>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<{x: number}>
  deleteRow$: iObservable<null>
  newValue$: iObservable<{CellText:string, x:number}>
  constructor(type:string,content:Array<string>) {
    this.type = type
    this.content = content
    this.insertColumn$ = new Observable<{ insertData: string,  x: number, }>()
    this.insertRow$ = new Observable<insertRow>()
    this.deleteColumn$ = new Observable<{x: number}>()
    this.deleteRow$ = new Observable()
    this.newValue$ = new Observable()
  }
  createRow():HTMLElement{
    const cellRow: HTMLElement = createElement("tr");
    for (let index = 0; index < this.content.length; index++) {
      const cellText:string = this.content[index];

      let tableCell
      let tableCellElement: HTMLElement

      if(this.type === "header"){
        tableCell = new TableCell(cellText)
        tableCellElement = tableCell.createTh()
      } else if(this.type === "body") {
        if(index===0){
          tableCell = new TableCell(cellText, true)
        } else {
          tableCell = new TableCell(cellText)
        }
        tableCellElement = tableCell.createTd()

      }

      if(tableCellElement instanceof HTMLElement){
        tableCell.newValue$.subscribe((cellText)=>this.newValue$.next({CellText:cellText, x: index+1}))
        tableCell.insertColumn$.subscribe((event)=>{
          if(event.direction === 'before'){
            this.insertColumn$.next({insertData: event.insertData, x: index+1})
          } else  if(event.direction === 'after'){
            this.insertColumn$.next({insertData: event.insertData, x: index+2})
          }
        })
        tableCell.insertRow$.subscribe((event:insertRow)=>this.insertRow$.next({direction: event.direction}))

        tableCell.deleteRow$.subscribe(()=>this.deleteRow$.next())
        tableCell.deleteColumn$.subscribe(()=>this.deleteColumn$.next({x: index+1}))

        appendChild(cellRow, tableCellElement);
      }
    }
    return cellRow
  }
}


type iTableCell = {
  insertColumn$: iObservable<insertColumn>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<null>
  deleteRow$: iObservable<null>
  newValue$: iObservable<string>
  createTd: ()=>HTMLElement,
  createTh: ()=>HTMLElement
}

type insertColumn = {
  insertData: string,
  direction: string,
}
type insertRow = {
  direction: string,
}
class TableCell implements iTableCell{
  private content: string
  insertColumn$: iObservable<insertColumn>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<null>
  deleteRow$: iObservable<null>
  newValue$: iObservable<string>
  buttonAction:Boolean
  constructor(content:string, buttonAction:Boolean = false) {
    this.content = content
    this.insertColumn$ = new Observable<insertColumn>()
    this.insertRow$ = new Observable<insertRow>()
    this.deleteColumn$ = new Observable()
    this.deleteRow$ = new Observable()
    this.newValue$ = new Observable()
    this.buttonAction = buttonAction
  }
  createTh(): HTMLElement{
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
        this.insertColumn$.next({insertData:thAddColumnInput.value, direction: "before"})
      }
    };
    thAddColumnBtn2.onclick = () => {
      if (thAddColumnInput2.value) {
        this.insertColumn$.next({insertData:thAddColumnInput2.value, direction: "after"})
      }
    };
    thRemoveColumnBtn.onclick = () => {
      this.deleteColumn$.next()
    };

    document.addEventListener("DOMSubtreeModified", (): void => {
      thPopperAdd1.style.left = `${-(thPopperAdd1.offsetWidth / 2)}px`;
      thPopperAdd2.style.right = `${-(thPopperAdd1.offsetWidth / 2)}px`;
    });

    textNode.textContent = this.content;

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
  createTd():HTMLElement{

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
    if(this.buttonAction){
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
        this.insertRow$.next({direction: 'before'});
      };
      tdAddRowBtn2.onclick = () => {
        this.insertRow$.next({direction: 'after'});
      };
      tdRemoveRowBtn.onclick = () => {
        this.deleteRow$.next();
      };
      document.addEventListener("DOMSubtreeModified", (): void => {
        tdPopperAdd1.style.top = `${-(tdPopperAdd1.offsetHeight / 2)}px`;
        tdPopperAdd2.style.bottom = `${-(tdPopperAdd1.offsetHeight / 2 - 1)}px`;
      });
    }

    textNode.textContent = this.content
    textNode.contentEditable = "true";

    textNode.onblur = (event:Event)=>this.cellChange(event, true)
    td.onmouseleave = this.cellChange;
    td.onmouseout = this.cellChange;
    td.onkeydown = this.listenChangeCellOnKey;
    if(this.buttonAction){
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

    if(this.buttonAction) {
      appendChild(tdContainer, tdPopperAddCont2);
    }

    appendChild(td, tdContainer);
    return td
  }
  createTf(){
    const tf: HTMLElement = createElement("td", ["footerTable"]);
    tf.textContent = this.content;
    return tf
  }
  private cellChange = (event: Event, blur:boolean = false): void => {
    let targetElement: HTMLElement = event.target as HTMLElement;
    if(blur){
      targetElement = targetElement.parentNode.parentNode as HTMLElement
    }
    if (targetElement.textContent !== this.content) {
      this.content = targetElement.textContent;
      let textNode = targetElement.querySelector('.tdTextNode') as HTMLElement
      if (textNode){
        textNode.blur()
      }
      this.newValue$.next(targetElement.textContent);
    }
  };
  private listenChangeCellOnKey = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.cellChange(event);
    }
  };

}