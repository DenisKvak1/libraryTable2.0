import { Observable } from "../helpers/observable";
import { createElement } from "../helpers/createDOMElements";
import { appendChild } from "../helpers/appendRemoveChildDOMElements";
import { errorProcessing } from "../helpers/errorProcessing";

export class Table {
  constructor(id, data) {
    this.responceValid = this.#validate(id, data);
    if (this.responceValid) {
      this.id = id;
      this.tableData = data;
      this.containerElement = document.getElementById(id);
      this.#renderMain();
      this.#createStyles();
      this.observable = new Observable();
    }
  }

  #validate(id, data) {
    // Проверка наличия id и его типа
    if (!id || typeof id !== "string" || !(document.getElementById(id))) {
      errorProcessing("Неверный ID. Укажите действительный идентификатор строки.");
      return false;
    }

    // Проверка наличия и типа header
    if (!data.header || !Array.isArray(data.header) || data.header.length === 0) {
      errorProcessing("Неверный заголовок таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка наличия и типа body
    if (!data.body || !Array.isArray(data.body) || data.body.length === 0) {
      errorProcessing("Недействительное тело таблицы. Укажите непустой массив.");
      return false;
    }

    // Проверка формата элементов в body
    if (!data.body.every((row) => Array.isArray(row))) {
      errorProcessing("Неверный формат тела. Каждая строка в теле должна быть массивом.");
      return false;
    }

    // Проверка наличия и типа footer
    if (data.footer && typeof data.footer !== "string") {
      errorProcessing("Неверный нижний колонтитул. Укажите действительную строку.");
      return false;
    }
    // Проверка корректности формату таблицы
    if (!validateFormatData(data)) {
      errorProcessing("Неверный формат даты. Укажите действительные данные таблицы.");
      return false;
    }

    function validateFormatData(obj) {
      const headerLength = obj.header.length;
      return headerLength > 0 && obj.body.every(subarray => subarray.length === headerLength);
    }

    return true;
  }

  #renderMain() {
    this.tableElement = createElement("table", ["myTable"]);
    const thead = createElement("thead");
    const tbody = createElement("tbody");

    appendChild(this.tableElement, thead);
    appendChild(this.tableElement, tbody);

    const headerRow = createElement("tr", ["headerTable"]);
    appendChild(thead, headerRow);

    this.theadElement = thead;
    this.tbodyElement = tbody;

    this.#renderHeader();
    this.#renderBody();
    this.#renderFooter();

    appendChild(this.containerElement, this.tableElement);
  }

  #renderHeader() {
    const headerRow = createElement("tr", ["headerTable"]);
    this.tableData.header.forEach((headerCellText) => {
      const th = createElement("th");
      th.textContent = headerCellText;
      appendChild(headerRow, th);
    });
    appendChild(this.theadElement, headerRow);
  }

  #renderBody() {
    this.tableData.body.forEach((row, indexUp) => {
      const tr = createElement("tr");
      this.tableData.body[indexUp].forEach((item, index) => {
        const td = createElement("td");
        td.textContent = this.tableData.body[indexUp][index];
        td.contentEditable = true;
        td.onblur = this.#cellChange;
        td.onmouseout = this.#cellChange;
        td.onkeydown = this.#listenChangeCellOnKey;
        appendChild(tr, td);
      });
      appendChild(this.tbodyElement, tr);
    });
  }

  #renderFooter() {
    if (this.tableData.footer) {
      const tfoot = createElement("tfoot");
      this.tfooterElement = tfoot;
      const td = createElement("td", ["footerTable"]);
      td.textContent = this.tableData.footer;
      appendChild(tfoot, td);
      appendChild(this.tableElement, tfoot);
    }
  }

  #cellChange = (event) => {
    let elementsArrayX = Array.from(event.target.parentNode.children);
    let elementsArrayY = Array.from(event.target.parentNode.parentNode.children);
    let indexX = elementsArrayX.indexOf(event.target);
    let indexY = elementsArrayY.indexOf(event.target.parentNode);

    if (event.target.textContent !== this.tableData.body[indexY][indexX]) {
      this.tableData.body[indexY][indexX] = event.target.textContent;
      if (document.activeElement === event.target) {
        event.target.blur();
      }
      console.log(`x:${indexX + 1},y:${indexY + 1}, content: ${event.target.textContent}`);
      this.#triggerEvent("changeCellContent", {
        x: indexX + 1,
        y: indexY + 1,
        newContent: event.target.textContent
      });
    }
  };

  #listenChangeCellOnKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.#cellChange(event);
      event.target.blur();
    }
  };

  #createStyles() {
    const style = createElement("style", ["tableStyle"]);
    const existingStyle = document.head.querySelector(".tableStyle");

    if (!existingStyle) {
      style.className = "tableStyle";
      style.innerHTML = `
          .myTable {
            width: 100%;
            border-collapse: collapse;
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

  pushRow() {
    if (this.responceValid) {
      this.insertRow(this.tableData.body.length + 1);
    }
  }

  pushColumn(header) {
    if (header) {
      this.insertColumn(this.tableData.header.length + 1, header);
    } else {
      errorProcessing("Не передан header");
    }
  }

  insertRow(rowIndex) {
    if (this.responceValid) {
      if (+rowIndex && rowIndex >= 0 && (this.tableData.body[rowIndex - 1] || rowIndex === this.tableData.body.length + 1)) {
        let addRow = [];
        this.tableData.header.forEach(() => addRow.push(""));
        this.tableData.body.splice([rowIndex - 1], 0, addRow);
        this.tbodyElement.innerHTML = "";
        this.#renderBody();
        this.#triggerEvent("addRow", { y: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для вставки ряда");
      }
    }
  }

  insertColumn(columnIndex, columnHeader) {
    if (this.responceValid) {
      if (+columnIndex && columnIndex >= 0 && columnHeader && (this.tableData.header[columnIndex - 1]) || columnIndex === this.tableData.header.length + 1) {
        this.tableData.header.splice(columnIndex - 1, 0, columnHeader);
        this.tableData.body.forEach((item, index) => this.tableData.body[index].splice([columnIndex - 1], 0, ""));
        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.#renderHeader();
        this.#renderBody();
        this.#triggerEvent("addColumn", { x: columnIndex });
      } else {
        errorProcessing("Не корректные координаты для вставки колонки, или не передан header");
      }
    }
  }

  deleteRow(rowIndex) {
    if (this.responceValid) {
      if (+rowIndex && rowIndex > 0 && this.tableData.body.length >= rowIndex && this.tableData.body[rowIndex - 1]) {
        this.tableData.body.splice(rowIndex - 1, 1);
        this.tbodyElement.innerHTML = "";
        this.#renderBody();
        this.#triggerEvent("removeRow", { y: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для удаление ряда");
      }
    }
  }

  deleteColumn(rowIndex) {
    if (this.responceValid) {
      if (+rowIndex && rowIndex > 0 && this.tableData.header[rowIndex - 1]) {
        this.tableData.header.splice(rowIndex - 1, 1);
        this.tableData.body.forEach((item, index) => this.tableData.body[index].splice(rowIndex - 1, 1));
        this.tbodyElement.innerHTML = "";
        this.theadElement.innerHTML = "";
        this.#renderHeader();
        this.#renderBody();
        this.#triggerEvent("removeColumn", { x: rowIndex });
      } else {
        errorProcessing("Не корректные координаты для удаление колонки");
      }
    }
  }

  getChartData(rowIndex) {
    if (this.responceValid) {
      if (this.tableData.body[rowIndex - 1]) {
        let formatError = false;
        let errorArray = [];
        this.tableData.body[rowIndex - 1].forEach((item, index) => {
          if (!(+item)) {
            formatError = true;
            errorArray.push(`В ячейке y:${rowIndex} x:${[index + 1]} не число`);
          }
        });
        if (!formatError) {
          let numberData = this.tableData.body[rowIndex - 1].map((item) => +item ? +item : 0);
          let headerData = this.tableData.header;
          return { data: numberData, header: headerData };
        } else {
          errorProcessing(errorArray);
        }
      }
    }
  }

  setTable(tableData) {
    let thisResponseValid = this.#validate(this.id, tableData);
    if (this.responceValid && thisResponseValid) {
      if (JSON.stringify(tableData) !== JSON.stringify(this.tableData)) {
        this.tableData = tableData;
        this.theadElement.innerHTML = "";
        this.tbodyElement.innerHTML = "";
        this.tfooterElement.innerHTML = "";
        this.#renderHeader();
        this.#renderBody();
        this.#renderFooter();
        this.#triggerEvent("setTable", this.tableData);
      }
    }
  }

  subscribe(eventName, callback) {
    return this.observable.subscribe(eventName, callback);
  }

  #triggerEvent(eventName, data) {
    this.observable.next(eventName, data);
  }
}
