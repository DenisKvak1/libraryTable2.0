import { cellOptions, iObservable } from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { createElement } from "../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";


export type iTableCell = {
  insertColumn$: iObservable<insertColumn>
  insertRow$: iObservable<insertRow>
  deleteColumn$: iObservable<null>
  deleteRow$: iObservable<null>
  newValue$: iObservable<string>
  createTd: () => HTMLElement,
  createTh: () => HTMLElement
}

export type insertColumn = {
  insertData: string,
  direction: string,
}
export type insertRow = {
  direction: string,
}

export default class TableCell implements iTableCell {
  private content: string;
  insertColumn$: iObservable<insertColumn>;
  insertRow$: iObservable<insertRow>;
  deleteColumn$: iObservable<null>;
  deleteRow$: iObservable<null>;
  newValue$: iObservable<string>;
  buttonAction: Boolean;
  private readonly options;
  cell: HTMLElement;
  private readonly optionsFuncTh: Record<string, any>;
  private readonly optionsFuncTd: Record<string, any>;
  private readonly optionsFuncTf: Record<string, any>;
  private readonly universalOptionFunc: Record<string, any>;

  constructor(content: string, options: cellOptions = {}, buttonAction: Boolean = false) {
    this.options = options;
    this.content = content;
    this.insertColumn$ = new Observable<insertColumn>();
    this.insertRow$ = new Observable<insertRow>();
    this.deleteColumn$ = new Observable();
    this.deleteRow$ = new Observable();
    this.newValue$ = new Observable();
    this.buttonAction = buttonAction;
    this.optionsFuncTh = {
      colorBackgroundHeader: (color: string) => {
        this.cell.style.backgroundColor = color;
      },
      colorHeader: (color: string) => {
        this.cell.style.color = color;
      }
    };
    this.optionsFuncTd = {
      colorBackgroundCell: (color: string) => {
        this.cell.style.backgroundColor = color;
      },
      colorBody: (color: string) => {
        this.cell.style.color = color;
      },
      colorEditableCell: (color: string) => {
        let textNode = this.cell.querySelector(".textNode");
        textNode.addEventListener("focus", () => {
          this.cell.style.color = color;
        });
        textNode.addEventListener("blur", () => {
          this.cell.style.color = this.options.colorBody;
        });
      },
      colorEditableBackgroundCell: (color: string) => {
        let textNode = this.cell.querySelector(".textNode");
        textNode.addEventListener("focus", () => {
          this.cell.style.backgroundColor = color;
        });
        textNode.addEventListener("blur", () => {
          this.cell.style.backgroundColor = this.options.colorBackgroundCell;
        });
      }
    };
    this.optionsFuncTf = {
      colorBackgroundFooter: (color: string) => {
        this.cell.style.backgroundColor = color;
      },
      colorFooter: (color: string) => {
        this.cell.style.color = color;
      }
    };
    this.universalOptionFunc = {
      widthVerticalLine: (width: string) => {
        if (this.options.widthVerticalLine) {
          this.cell.style.borderLeft = `${width} solid ${this.options.colorLine}`;
          this.cell.style.borderRight = `${width} solid ${this.options.colorLine}`;
        }
      },
      widthHorizontalLine: (width: string) => {
        if (this.options.widthHorizontalLine) {
          this.cell.style.borderTop = `${width} solid ${this.options.colorLine}`;
          this.cell.style.borderBottom = `${width} solid ${this.options.colorLine}`;
        }
      },
      showVerticalLine: (isShow: boolean) => {
        //Костыли изза проблем с преобразованием inline-style border

        document.querySelector(".showVerticalLine")?.remove();
        let style = createElement("style", ["showVerticalLine"]);
        if(this.options.showHorizontalLine){
          style.innerHTML = `
          .hideVerticalLine {
            border-width: ${this.options.widthHorizontalLine} 0px !important;
          };
        `;
        } else {
          style.innerHTML = `
          .hideVerticalLine {
            border-width: 0px 0px !important;
          };
        `;
        }
        appendChild(document.head, style);

        if (isShow) {
          this.cell.classList.remove("hideVerticalLine");
        } else {
          this.cell.classList.add("hideVerticalLine");
        }
      },
      showHorizontalLine: (isShow: boolean) => {
        //Костыли изза проблем с преобразованием inline-style border

        document.querySelector(".showHorizontalLine")?.remove();
        let style = createElement("style", ["showHorizontalLine"]);
        if(this.options.showVerticalLine){
          style.innerHTML = `
          .hideHorizontalLine {
             border-width: 0px ${this.options.widthVerticalLine} !important;
          }
        `;
        } else {
          style.innerHTML = `
          .hideHorizontalLine {
             border-width: 0px 0px !important;
          }
        `;
        }
        appendChild(document.head, style);

        if (isShow) {
          this.cell.classList.remove("hideHorizontalLine");
        } else {
          this.cell.classList.add("hideHorizontalLine");
        }
      },
      colorLine: (color: string) => {
        if (this.options.widthHorizontalLine) {
          this.cell.style.borderTopColor = color;
          this.cell.style.borderBottomColor = color;
        }
        if (this.options.widthVerticalLine) {
          this.cell.style.borderLeftColor = color;
          this.cell.style.borderRightColor = color;
        }
      }
    };
  }

  createTh(): HTMLElement {
    const th: HTMLElement = createElement("th");

    const thContainer: HTMLElement = createElement("div", ["thCont"]);
    let textNode: HTMLElement = createElement("div", ["textNode"]);
    let thPopperAddCont1: HTMLElement = createElement("div", ["thPopperAddCont", "right2"]);
    let thPopperAddCont2: HTMLElement = createElement("div", ["thPopperAddCont", "left2"]);
    let thPopperRemoveCont1: HTMLElement;
    let thPopperAdd1: HTMLElement;
    let thPopperAdd2: HTMLElement;
    let thAddColumnInput: HTMLInputElement;
    let thAddColumnInput2: HTMLInputElement;
    let thPopperRemove1: HTMLElement;
    if (!this.options.denyAddColumn) {
      thPopperAdd1 = createElement("div", ["thPopperAdd"]);
      thPopperAdd2 = createElement("div", ["thPopperAdd"]);
      thAddColumnInput = createElement("input", ["thPopperAddInput", "addColumnInput"]) as HTMLInputElement;
      thAddColumnInput2 = createElement("input", ["thPopperAddInput", "addColumnInput2"]) as HTMLInputElement;
    }
    if (!this.options.denyRemoveColumn) {
      thPopperRemoveCont1 = createElement("div", ["thPopperRemoveCont"]);
      thPopperRemove1 = createElement("div", ["thPopperRemove"]);
    }

    let thAddColumnBtn: HTMLElement;
    let thAddColumnBtn2: HTMLElement;
    let thRemoveColumnBtn: HTMLElement;
    if (!this.options.denyAddColumn) {
      thAddColumnBtn = createElement("button", ["addColumnBtn"]);
      thAddColumnBtn2 = createElement("button", ["addColumnBtn2"]);
      thAddColumnBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
      thAddColumnBtn2.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
    }
    if (!this.options.denyRemoveColumn) {
      thRemoveColumnBtn = createElement("button", ["removeColumnBtn"]);
      thRemoveColumnBtn.onclick = () => {
        this.deleteColumn$.next();
      };
      thRemoveColumnBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill=\"#1e2633\" d=\"M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z\"/></svg>";
    }


    if (!this.options.denyAddColumn) {
      thAddColumnBtn.onclick = () => {
        if (thAddColumnInput.value) {
          this.insertColumn$.next({ insertData: thAddColumnInput.value, direction: "before" });
        }
      };
      thAddColumnBtn2.onclick = () => {
        if (thAddColumnInput2.value) {
          this.insertColumn$.next({ insertData: thAddColumnInput2.value, direction: "after" });
        }
      };
      document.addEventListener("DOMSubtreeModified", (): void => {
        thPopperAdd1.style.left = `${-(thPopperAdd1.offsetWidth / 2)}px`;
        thPopperAdd2.style.right = `${-(thPopperAdd1.offsetWidth / 2)}px`;
      });
    }
    textNode.textContent = this.content;

    let isResizing: boolean = false;
    let direction: string;
    let lastDownX: number = 0;

    const startResize = (event: MouseEvent): void => {
      if (Array.from(th.parentNode.children).indexOf(th) !== 0)
        if (event.target === thPopperAddCont1) {
          direction = "left";
        } else if (event.target === thPopperAddCont2) {
          direction = "right";
        }

      isResizing = true;
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);

      lastDownX = event.clientX;
    };

    const handleResize = (event: MouseEvent): void => {
      if (direction === "right" && isResizing) {
        let width: number = th.offsetWidth + (event.clientX - lastDownX);
        th.style.width = `${width}px`;
        lastDownX = event.clientX;
      } else if (direction === "left" && isResizing) {
        let lTh: HTMLElement = Array.from(th.parentNode.children)[Array.from(th.parentNode.children).indexOf(th) - 1] as HTMLElement;
        let width: number = lTh.offsetWidth + (event.clientX - lastDownX);
        lTh.style.width = `${width}px`;
        lastDownX = event.clientX;
      }
    };

    const stopResize = (): void => {
      isResizing = false;
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };
    if (!this.options.denyResizeColumn) {
      th.onmousedown = (event) => startResize(event);
    } else {
      thPopperAddCont1.style.cursor = "default";
      thPopperAddCont2.style.cursor = "default";
    }

    if (!this.options.denyAddColumn) {
      appendChild(thPopperAdd1, thAddColumnInput);
      appendChild(thPopperAdd2, thAddColumnInput2);
      appendChild(thPopperAdd1, thAddColumnBtn);
      appendChild(thPopperAdd2, thAddColumnBtn2);
    }
    if (!this.options.denyRemoveColumn) {
      appendChild(thPopperRemove1, thRemoveColumnBtn);
      appendChild(thPopperRemoveCont1, thPopperRemove1);
    }
    appendChild(thPopperAddCont1, thPopperAdd1);
    appendChild(thPopperAddCont2, thPopperAdd2);
    appendChild(thContainer, thPopperAddCont1);
    appendChild(thContainer, textNode);
    appendChild(thContainer, thPopperAddCont2);
    appendChild(thContainer, thPopperRemoveCont1);
    appendChild(th, thContainer);
    this.cell = th;
    for (let key in this.options) {
      if (this.optionsFuncTh[key]) {
        this.optionsFuncTh[key]((this.options as any)[key]);
      }
    }
    for (let key in this.options) {
      if (this.universalOptionFunc[key]) {
        this.universalOptionFunc[key]((this.options as any)[key]);
      }
    }
    return th;
  }

  createTd(): HTMLElement {
    const td: HTMLElement = createElement("td");
    const tdContainer = createElement("div", ["tdCont"]);
    tdContainer.addEventListener("mouseout", (event) => {
      event.stopPropagation();
    });

    let textNode: HTMLElement = createElement("div", ["textNode"]);
    let tdPopperAddCont1: HTMLElement;
    let tdPopperAddCont2: HTMLElement;
    let tdPopperRemoveCont1: HTMLElement;
    let tdPopperAdd1: HTMLElement;
    let tdPopperAdd2: HTMLElement;
    let tdPopperRemove1: HTMLElement;
    let tdAddRowBtn: HTMLElement;
    let tdAddRowBtn2: HTMLElement;
    let tdRemoveRowBtn: HTMLElement;
    if (this.buttonAction) {
      if (!this.options.denyAddRow) {
        tdPopperAddCont1 = createElement("div", ["tdPopperAddCont", "bottom5"]);
        tdPopperAddCont2 = createElement("div", ["tdPopperAddCont", "top5"]);
        tdPopperAdd1 = createElement("div", ["tdPopperAdd"]);
        tdPopperAdd2 = createElement("div", ["tdPopperAdd"]);
        tdAddRowBtn = createElement("button", ["addRowBtn"]);
        tdAddRowBtn2 = createElement("button", ["addRowBtn2"]);
        tdAddRowBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
        tdAddRowBtn2.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>";
        tdAddRowBtn.onclick = () => {
          this.insertRow$.next({ direction: "before" });
        };
        tdAddRowBtn2.onclick = () => {
          this.insertRow$.next({ direction: "after" });
        };
        document.addEventListener("DOMSubtreeModified", (): void => {
          tdPopperAdd1.style.top = `${-(tdPopperAdd1.offsetHeight / 2)}px`;
          tdPopperAdd2.style.bottom = `${-(tdPopperAdd1.offsetHeight / 2 - 1)}px`;
        });
      }
      if (!this.options.denyRemoveRow) {
        tdPopperRemoveCont1 = createElement("div", ["tdPopperRemoveCont"]);
        tdPopperRemove1 = createElement("div", ["tdPopperRemove"]);
        tdRemoveRowBtn = createElement("button", ["removeRowBtn"]);
        tdRemoveRowBtn.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill=\"#1e2633\" d=\"M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z\"/></svg>";
        tdRemoveRowBtn.onclick = () => {
          this.deleteRow$.next();
        };
      }
    }

    textNode.textContent = this.content;
    if (!this.options.denyEditCell) {
      textNode.contentEditable = "true";
    }

    textNode.onblur = (event: Event) => this.cellChange(event);
    td.onmouseleave = this.cellChange;
    td.onmouseout = this.cellChange;
    td.onkeydown = this.listenChangeCellOnKey;
    if (this.buttonAction) {
      if (!this.options.denyRemoveRow) {
        appendChild(tdPopperRemoveCont1, tdPopperRemove1);
        appendChild(tdPopperRemove1, tdRemoveRowBtn);
        appendChild(tdContainer, tdPopperRemoveCont1);
      }
      if (!this.options.denyAddRow) {
        appendChild(tdPopperAdd1, tdAddRowBtn);
        appendChild(tdPopperAdd2, tdAddRowBtn2);
        appendChild(tdPopperAddCont1, tdPopperAdd1);
        appendChild(tdPopperAddCont2, tdPopperAdd2);
        appendChild(tdContainer, tdPopperAddCont1);
      }
    }

    appendChild(tdContainer, textNode);

    if (this.buttonAction) {
      appendChild(tdContainer, tdPopperAddCont2);
    }

    appendChild(td, tdContainer);
    this.cell = td;
    for (let key in this.options) {
      if (this.optionsFuncTd[key]) {
        this.optionsFuncTd[key]((this.options as any)[key]);
      }
    }
    for (let key in this.options) {
      if (this.universalOptionFunc[key]) {
        this.universalOptionFunc[key]((this.options as any)[key]);
      }
    }
    return td;
  }

  createTf() {
    const tf: HTMLElement = createElement("td", ["footerTable"]);
    tf.textContent = this.content;
    this.cell = tf;
    for (let key in this.options) {
      if (this.optionsFuncTf[key]) {
        this.optionsFuncTf[key]((this.options as any)[key]);
      }
    }
    for (let key in this.options) {
      if (this.universalOptionFunc[key]) {
        this.universalOptionFunc[key]((this.options as any)[key]);
      }
    }
    return tf;
  }

  private cellChange = (event: Event): void => {
    let targetElement: HTMLElement = event.target as HTMLElement;
    if (!Array.from(targetElement.classList).includes("textNode")) {
      targetElement = targetElement.querySelector(".textNode");
    }
    if (targetElement.textContent !== this.content) {
      this.content = targetElement.textContent;

      targetElement.blur();
      this.newValue$.next(targetElement.textContent);
    }
  };
  private listenChangeCellOnKey = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.cellChange(event);
    }
  };

}