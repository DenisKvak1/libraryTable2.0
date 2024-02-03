import {createElement} from "../helpers/createDOMElements";
import {appendChild} from "../helpers/appendRemoveChildDOMElements";
import {iModal} from "../env/types";

export class Modal implements iModal{
  destroyMode:boolean
  modal: HTMLElement
  modalContent: HTMLElement
  overlay: HTMLElement
  constructor(content:HTMLElement | SVGElement | string, idContent:string = "basicIdContent", destroyMode:boolean = false) {
    this.destroyMode = destroyMode;

    this.modal = createElement("div", ["modal"]);

    const closeBtn:HTMLElement = createElement("span", ["close-btn"]);
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => this.closeModal());

    this.modalContent = createElement("div", ["modal-content"]);
    this.modalContent.id = idContent;
    if (typeof content === "string") {
      this.modalContent.innerHTML = content;
    } else if (content) {
      appendChild(this.modalContent, content);
    }
    this.overlay = createElement("div", ["overlay"]);
    this.overlay.addEventListener("click", () => this.closeModal());

    appendChild(this.modal, closeBtn);
    appendChild(this.modal, this.modalContent);

    appendChild(document.body, this.modal);
    appendChild(document.body, this.overlay);
  }


  openModal():void {
    document.body.style.overflow = "hidden";
    this.modal.style.display = "block";
    this.overlay.style.display = "block";
  }

  closeModal():void {
    document.body.style.overflow = "initial";
    this.modal.style.display = "none";
    this.overlay.style.display = "none";
    if (this.destroyMode) {
      this.modal.remove();
      this.overlay.remove();
    }
  }

  setBackGroundColorModal(color:string):void {
    this.modal.style.backgroundColor = color;
  }

  setBackGroundColorOverlay(color:string):void {
    this.overlay.style.backgroundColor = color;
  }

  setMaxWidth(maxWidth:string):void {
    this.modal.style.maxWidth = maxWidth;
  }

  setMaxHeight(maxHeight:string):void {
    this.modal.style.maxHeight = maxHeight;
  }
}