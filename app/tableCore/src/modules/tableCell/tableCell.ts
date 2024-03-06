import { cellOptions, iObservable } from "../../../../../env/types";
import { Observable } from "../../../../../env/helpers/observable";
import { createElement } from "../../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import {
  tableCellTDAddBlock, tableCellTDRemoveBlock,
  tableCellTDTemplate, tableCellTFTemplate,
  tableCellTHAddBlock,
  tableCellTHRemoveBlock,
  tableCellTHTemplate
} from "./template";


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
    const th: HTMLElement = createElementFromHTML(tableCellTHTemplate)
    const thContainer: HTMLElement = th.querySelector('.thCont')

    let textNode: HTMLElement = thContainer.querySelector('.textNode');
    let thPopperAddCont1 = th.querySelectorAll('.thPopperAddCont')[0] as HTMLElement
    let thPopperAddCont2 = th.querySelectorAll('.thPopperAddCont')[1] as HTMLElement

    thPopperAddCont1.classList.add('right2')
    thPopperAddCont2.classList.add('left2')
    if (!this.options.denyRemoveColumn) {
      let thPopperRemoveCont = createElementFromHTML(tableCellTHRemoveBlock)
      let thRemoveColumnBtn = thPopperRemoveCont.querySelector('.removeColumnBtn') as HTMLButtonElement;
      thRemoveColumnBtn.onclick = () => {
        this.deleteColumn$.next();
      };
      appendChild(thContainer, thPopperRemoveCont)
    }
    if (!this.options.denyAddColumn) {
      let thPopperAdd1 = createElementFromHTML(tableCellTHAddBlock)
      let thPopperAdd2 = createElementFromHTML(tableCellTHAddBlock)



      let thAddColumnBtn = thPopperAdd1.querySelector('.addColumnBtn') as HTMLButtonElement;
      let thAddColumnBtn2 = thPopperAdd2.querySelector('.addColumnBtn') as HTMLButtonElement;
      let thAddColumnInput = thPopperAdd1.querySelector('.addColumnInput') as HTMLInputElement;
      let thAddColumnInput2 = thPopperAdd2.querySelector('.addColumnInput') as HTMLInputElement;
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
      appendChild(thPopperAddCont1, thPopperAdd1)
      appendChild(thPopperAddCont2, thPopperAdd2)
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
    const td: HTMLElement = createElementFromHTML(tableCellTDTemplate);
    const tdContainer: HTMLElement = td.querySelector('.tdCont');
    const textNode: HTMLElement = tdContainer.querySelector('.textNode');
    const tdPopperAddCont1: HTMLElement = tdContainer.querySelectorAll('.tdPopperAddCont')[0] as HTMLElement;
    const tdPopperAddCont2: HTMLElement = tdContainer.querySelectorAll('.tdPopperAddCont')[1] as HTMLElement;
    const tdPopperRemoveCont1: HTMLElement = createElementFromHTML(tableCellTDRemoveBlock);

    tdContainer.addEventListener("mouseout", (event) => {
      event.stopPropagation();
    });

    tdPopperAddCont1.classList.add('bottom5');
    tdPopperAddCont2.classList.add('top5');

    let tdPopperAdd1: HTMLElement;
    let tdPopperAdd2: HTMLElement;
    let tdPopperRemove1: HTMLElement;
    let tdAddRowBtn: HTMLElement;
    let tdAddRowBtn2: HTMLElement;
    let tdRemoveRowBtn: HTMLElement;

    if (this.buttonAction) {
      if (!this.options.denyAddRow) {
        tdPopperAdd1 = createElementFromHTML(tableCellTDAddBlock);
        tdPopperAdd2 = createElementFromHTML(tableCellTDAddBlock);
        tdAddRowBtn = tdPopperAdd1.querySelector('.addRowBtn');
        tdAddRowBtn2 = tdPopperAdd2.querySelector('.addRowBtn');
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
        appendChild(tdPopperAddCont1, tdPopperAdd1)
        appendChild(tdPopperAddCont2, tdPopperAdd2)
      }

      if (!this.options.denyRemoveRow) {
        tdPopperRemove1 = createElementFromHTML(tableCellTDRemoveBlock);
        tdRemoveRowBtn = tdPopperRemove1.querySelector('.removeRowBtn');
        tdRemoveRowBtn.onclick = () => {
          this.deleteRow$.next();
        };
        appendChild(tdContainer, tdPopperRemoveCont1)
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
    const tf: HTMLElement = createElementFromHTML(tableCellTFTemplate);
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