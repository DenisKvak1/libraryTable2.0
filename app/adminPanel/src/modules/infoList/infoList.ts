import { IInfoList } from "../../../../../env/types";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { adminPanelInfoList, adminPanelInfoListItem } from "./template";

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
    this.infoBlock = createElementFromHTML(adminPanelInfoList)
    this.info = this.infoBlock.querySelector('.info')
    this.infoRect = this.infoBlock.querySelector('.infoRect')
    this.info.textContent = this.overview;

    this.renderList();
    return this.infoBlock;
  }

  private renderList() {
    this.infoRect.innerHTML = "";
    for (let i = 0; i < this.elements.length; i++) {
      const span = createElementFromHTML(adminPanelInfoListItem)
      span.textContent = this.elements[i] as string;
      appendChild(this.infoRect, span);
    }
  }

  setList(list: Array<string>) {
    this.elements = list;
    this.renderList();
  }
}
