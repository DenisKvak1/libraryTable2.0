import { createElement } from "../helpers/createDOMElements";
import { appendChild } from "../helpers/appendRemoveChildDOMElements";

export class Modal {
  constructor(content, idContent = "basicIdContent", destroyMode = false) {
    this.destroyMode = destroyMode;
    this.#createStyles();

    this.modal = createElement("div", ["modal"]);

    const closeBtn = createElement("span", ["close-btn"]);
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

  #createStyles() {
    const style = createElement("style", ["modalStyle"]);
    style.innerHTML = `
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          height: 100vh;
        }
    
        .modal {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 15px;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          border-radius: 5px;
          z-index: 999;
          overflow-y: auto;
          max-height: 80%;
          max-width: 80%;
        }
    
        .overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }
    
        .modal-content {
            overflow-y: auto;
            word-wrap: break-word;
        }
    
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
        }
      `;

    const existingStyle = document.head.querySelector(".modalStyle");

    if (!existingStyle) {
      appendChild(document.head, style);
    }
  }


  openModal() {
    document.body.style.overflow = "hidden";
    this.modal.style.display = "block";
    this.overlay.style.display = "block";
  }

  closeModal() {
    document.body.style.overflow = "initial";
    this.modal.style.display = "none";
    this.overlay.style.display = "none";
    if (this.destroyMode) {
      this.modal.remove();
      this.overlay.remove();
    }
  }

  setBackGroundColorModal(color) {
    this.modal.style.backgroundColor = color;
  }

  setBackGroundColorOverlay(color) {
    this.overlay.style.backgroundColor = color;
  }

  setMaxWidth(maxWidth) {
    this.modal.style.maxWidth = maxWidth;
  }

  setMaxHeight(maxHeight) {
    this.modal.style.maxHeight = maxHeight;
  }

  setFontFamily(font) {
    this.modalContent.style.fontFamily = font;
  }

  setFontSize(size) {
    this.modalContent.style.fontSize = `${size}px`;
  }
}