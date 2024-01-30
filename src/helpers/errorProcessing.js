import { Modal } from "../modules/Modal";
import { createElement } from "./createDOMElements";

export function errorProcessing(errorText) {
  let errorElement = createElement("h2");
  errorElement.style.color = "red";
  if (Array.isArray((errorText))) {
    errorText.forEach((errorLine) => {
      console.log(errorLine);
      errorElement.innerHTML += `${errorLine}<br>`;
    });
  } else {
    errorElement.innerHTML = errorText;
  }
  let modal = new Modal(errorElement, "error-modal-content", true);
  modal.openModal();
}
