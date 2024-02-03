import { createElement } from "./createDOMElements";
import {Modal} from "../modules/Modal";
import {iModal} from "../env/types";

export function errorProcessing(errorText:Array<string>|string):void {
  let errorElement:HTMLElement = createElement("h2");
  errorElement.style.color = "red";
  if (Array.isArray((errorText))) {
    errorText.forEach((errorLine) => {
      console.log(errorLine);
      errorElement.innerHTML += `${errorLine}<br>`;
    });
  } else {
    errorElement.innerHTML = errorText;
  }
  let modal:iModal = new Modal(errorElement, "error-modal-content", true);
  modal.openModal();
}
