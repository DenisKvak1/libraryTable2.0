export function createElement(tag, classList = []) {
  let element = document.createElement(tag);
  if (Array.isArray(classList)) {
    classList.forEach((item) => {
      element.classList.add(item);
    });
  }
  return element;
}

export function createElementNS(tag, classList = []) {
  let element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (Array.isArray(classList)) {
    classList.forEach((item) => {
      element.classList.add(item);
    });
  }
  return element;
}