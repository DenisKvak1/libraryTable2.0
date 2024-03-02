import { IInfoList } from "../../../../env/types";
import { createElement } from "../../../../env/helpers/createDOMElements";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";

export class InfoList implements IInfoList {
  private infoBlock: HTMLElement;
  private info: HTMLElement;
  private infoRect: HTMLElement;
  private elements: Array<string>;
  private readonly overview: string;

  constructor(overview: string, elements: Array<string>) {
    this.overview = overview;
    this.elements = elements;
  }

  createList() {
    this.infoBlock = createElement("div", ["infoBlock"]);
    this.info = createElement("div", ["info"]);
    this.infoRect = createElement("div", ["infoRect"]);
    this.info.textContent = this.overview;

    this.renderList();
    appendChild(this.infoBlock, this.info);
    appendChild(this.infoBlock, this.infoRect);
    return this.infoBlock;
  }

  private renderList() {
    this.infoRect.innerHTML = "";
    for (let i = 0; i < this.elements.length; i++) {
      const span = createElement("span");
      span.textContent = this.elements[i] as string;
      appendChild(this.infoRect, span);
    }
  }

  setList(list: Array<string>) {
    this.elements = list;
    this.renderList();
  }
}
