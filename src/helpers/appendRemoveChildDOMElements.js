export function appendChild(container, element) {
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

export function removeChild(container, element) {
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