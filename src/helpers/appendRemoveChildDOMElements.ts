type ValidElements = HTMLElement | SVGElement;

export function appendChild(container:ValidElements, element:ValidElements):void | string {
  if (container) {
    if (element) {
      container.appendChild(element);
    } else {
      return "Элемент не валиден";
    }
  } else {
    return "Контейнер не валиден";
  }
}

export function removeChild(container:HTMLElement | SVGElement, element:HTMLElement | SVGElement):void | string {
  if (container) {
    if (element) {
      container.removeChild(element);
    } else {
      return "Элемент не валиден";
    }
  } else {
    return "Контейнер не валиден";
  }
}