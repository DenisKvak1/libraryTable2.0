import { createElement } from "./createDOMElements";
import { Modal } from "../modules/Modal";
import { iModal } from "../env/types";

export function errorProcessing(errorText: Array<string> | string): void {
  const errorElement: HTMLElement = createElement("h2");
  errorElement.style.color = "red";

  if (Array.isArray(errorText)) {
    for (let index = 0; index < errorText.length; index++) {
      const errorLine = errorText[index];
      console.log(errorLine);
      errorElement.innerHTML += `${errorLine}<br>`;
    }
  } else {
    errorElement.innerHTML = errorText;
  }

  const modal: iModal = new Modal(errorElement, "error-modal-content", true);
  modal.openModal();
}

