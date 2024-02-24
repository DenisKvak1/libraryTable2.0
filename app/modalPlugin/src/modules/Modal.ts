import {IModalOptions, iModal, iModalOptionsFunc} from "../../../../env/types";
import {createElement} from "../../../../env/helpers/createDOMElements";
import {appendChild} from "../../../../env/helpers/appendRemoveChildDOMElements";


export class Modal implements iModal {
    private readonly destroyMode: boolean;
    private readonly modal: HTMLElement;
    private readonly modalContent: HTMLElement;
    private readonly overlay: HTMLElement;

    constructor(content: Element | string, idContent: string = "basicIdContent", destroyMode: boolean = false) {
        this.destroyMode = destroyMode;

        this.modal = createElement("div", ["modal"]);

        const closeBtn: HTMLElement = createElement("span", ["close-btn"]);
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", () => this.close());

        this.modalContent = createElement("div", ["modal-content"]);
        this.modalContent.id = idContent;
        if (typeof content === "string") {
            this.modalContent.innerHTML = content;
        } else if (content) {
            appendChild(this.modalContent, content);
        }
        this.overlay = createElement("div", ["overlay"]);
        this.overlay.addEventListener("click", () => this.close());

        appendChild(this.modal, closeBtn);
        appendChild(this.modal, this.modalContent);

        appendChild(document.body, this.modal);
        appendChild(document.body, this.overlay);
    }

    setOptions(options: IModalOptions) {
        let optionsFunc:iModalOptionsFunc = {
            width: (width: number) => this.modal.style.width = `${width}`,
            maxWidth: (maxWidth: number) => this.modal.style.maxWidth = `${maxWidth}`,
            height: (height: number) => this.modal.style.height = `${height}`,
            maxHeight: (maxHeight: number) => this.modal.style.width = `${maxHeight}`,
            bgColor: (color: string) => this.modal.style.backgroundColor = `${color}`,
            bgOverlayColor: (color: number) => this.overlay.style.backgroundColor = `${color}`
        }
        for (let key in  options){
            if(optionsFunc[key]){
                optionsFunc[key](options[key])
            }
        }
    };

    open(): void {
        document.body.style.overflow = "hidden";
        this.modal.style.display = "block";
        this.overlay.style.display = "block";
    }

    close(): void {
        document.body.style.overflow = "initial";
        this.modal.style.display = "none";
        this.overlay.style.display = "none";
        if (this.destroyMode) {
            this.modal.remove();
            this.overlay.remove();
        }
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