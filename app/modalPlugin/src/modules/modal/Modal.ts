import { IModalOptions, iModal, iModalOptionsFunc, iObservable } from "../../../../../env/types";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { modalTemplate, overlayTemplate } from "./template";


export class Modal implements iModal {
  private modal: HTMLElement;
  private modalContent: HTMLElement;
  private overlay: HTMLElement;
  close$: iObservable<null>;
  content: Element | string
  idContent: string

  constructor(content: Element | string, idContent?: string) {
    this.close$ = new Observable<null>();
    this.content = content
    this.idContent = idContent
    this.startRender()
  }

  setOptions(options: IModalOptions) {

    let optionsFunc: iModalOptionsFunc = {
      width: (width: number) => this.modal.style.width = `${width}`,
      maxWidth: (maxWidth: number) => this.modal.style.maxWidth = `${maxWidth}`,
      height: (height: number) => this.modal.style.height = `${height}`,
      maxHeight: (maxHeight: number) => this.modal.style.width = `${maxHeight}`,
      bgColor: (color: string) => this.modal.style.backgroundColor = `${color}`,
      bgOverlayColor: (color: number) => this.overlay.style.backgroundColor = `${color}`,
      padding: (padding: string) => this.modal.style.padding = padding,
      borderRadius: (radius: string) => this.modal.style.borderRadius = radius
    };
    if(this.modal && this.overlay){
      for (let key in options) {
        if (optionsFunc[key]) {
          optionsFunc[key](options[key]);
        }
      }
    }
  };
  private startRender(){
    this.modal = createElementFromHTML(modalTemplate);
    const closeBtn: HTMLElement = this.modal.querySelector('.close-btn')
    closeBtn.addEventListener("click", () => this.close());
    this.modalContent = this.modal.querySelector('.modal-content');
    if (this.modalContent.id) {
      this.modalContent.id = this.idContent;
    }
    if (typeof this.content === "string") {
      this.modalContent.innerHTML = this.content;
    } else if (this.content) {
      appendChild(this.modalContent, this.content);
    }
    this.overlay = createElementFromHTML(overlayTemplate);
    this.overlay.addEventListener("click", () => this.close());
    appendChild(this.modal, closeBtn);
    appendChild(this.modal, this.modalContent);
  }
  private render(){
    appendChild(document.body, this.modal);
    appendChild(document.body, this.overlay);
  }
  open(): void {
    this.render()
    document.body.style.overflow = "hidden";
    this.modal.style.display = "block";
    this.overlay.style.display = "block";
  }

  close(): void {
    document.body.style.overflow = "initial";
    this.modal.style.display = "none";
    this.overlay.style.display = "none";
    this.modal.remove();
    this.overlay.remove();
    this.close$.next();
  }

  destroy() {
    this.modal.remove();
    this.overlay.remove();
  }

  setContent(content: string | Element): void {
    if (typeof content === "string") {
      this.modalContent.innerHTML = content;
    } else if (content) {
      appendChild(this.modalContent, content);
    }
  }
}