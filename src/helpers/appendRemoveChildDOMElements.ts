type ValidElements = HTMLElement | SVGElement;

export function appendChild(container: ValidElements, element: ValidElements): void | string {
  if (!container) return "Контейнер не валиден";
  if (!element) return "Элемент не валиден";
  container.appendChild(element);
}

export function removeChild(container: HTMLElement | SVGElement, element: HTMLElement | SVGElement): void | string {
  if (!container) return "Контейнер не валиден";
  if (!element) return "Элемент не валиден";
  container.removeChild(element);
}