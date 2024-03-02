import { createElement } from "../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";
import { iObservable, IUserList } from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";

export class UserList implements IUserList {
  private overview: string;
  private infoBlock: HTMLElement;
  private infoRect: HTMLElement;
  elements$: iObservable<Array<string>>;
  buttonOverview: string;
  inputOverview: string;

  constructor(overview: string, elements: Array<string>, inputOverview?: string, buttonOverview?: string) {
    this.overview = overview;
    this.buttonOverview = buttonOverview;
    this.inputOverview = inputOverview;
    this.elements$ = new Observable<Array<string>>();
    this.elements$.setValue(elements);

    this.elements$.setValue(elements);
  }

  createList(): HTMLElement {
    const rootElement = createElement("div", ["userListRoot"]);

    this.infoBlock = createElement("div", ["infoBlock"]);
    let info = createElement("div", ["info"]);
    this.infoRect = createElement("div", ["infoRect"]);
    let addCont = createElement("div", ["infoAddCont"]);
    let addOverview = createElement("span", ["infoAddSpan"]);
    let addInput = createElement("input") as HTMLInputElement;
    let addBtn = createElement("button");

    addBtn.onclick = () => {
      if (addInput.value) {
        this.renderElement(addInput.value);
        this.elements$.setValue([...this.elements$.getValue(), addInput.value]);
        this.elements$.next(this.elements$.getValue());
        addInput.value = "";
      }
    };

    addBtn.textContent = this.buttonOverview;
    addOverview.textContent = this.inputOverview;

    appendChild(addCont, addOverview);
    appendChild(addCont, addInput);
    appendChild(addCont, addBtn);
    info.textContent = this.overview;

    this.setList(this.elements$.getValue());

    appendChild(this.infoBlock, info);
    appendChild(this.infoBlock, this.infoRect);
    appendChild(rootElement, this.infoBlock);
    appendChild(rootElement, addCont);

    return rootElement;
  }

  setList(elements: Array<string>): void {
    this.infoRect.innerHTML = "";
    for (let i = 0; i < elements.length; i++) {
      this.renderElement(elements[i]);
    }
    this.elements$.next(elements)
  }

  private renderElement(element: string): void {
    let container = createElement("div", ["listItem"]);
    let span = createElement("span");
    let closeBtn = createElement("button", ["closeButton"]);
    closeBtn.onclick = () => {
      this.elements$.next(this.elements$.getValue().filter((item) => item !== span.textContent));
      container.remove();
    };
    closeBtn.innerHTML =
      "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z\"/></svg>";
    span.textContent = element as string;
    appendChild(container, span);
    appendChild(container, closeBtn);
    appendChild(this.infoRect, container);
  }

  setTextColor(color: string): void {
    Array.from(this.infoRect.children).forEach((element) => {
      (element.children[0] as HTMLElement).style.color = color;
    });
    this.infoRect.addEventListener("DOMSubtreeModified", () => {
      Array.from(this.infoRect.children).forEach((element) => {
        (element.children[0] as HTMLElement).style.color = color;
      });
    });
  }
}
