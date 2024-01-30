import { createElement, createElementNS } from "../helpers/createDOMElements";
import { appendChild } from "../helpers/appendRemoveChildDOMElements";
import { errorProcessing } from "../helpers/errorProcessing";

export class Chart {
  constructor(containerId, data, headerData, size, chartType = "line") {
    this.containerId = containerId;
    this.chartData = data;
    this.headerData = headerData;
    this.size = size;
    this.chartType = chartType;
    this.markCount = 10;
    this.markColor = "#a0a0a0";
    this.markWidth = "0.1";
    this.markTextColor = "rgba(53, 53, 53, 0.9)";
    this.lineColor = "rgb(69, 97, 255)";
    this.lineWidth = 1;
    this.circleColor = "blue";
    this.circleRadius = 3;
    this.columnColor = "rgba(53, 53, 53, 0.575)";
    this.columnBorder = "0.5px solid rgba(53, 53, 53, 0.9)";
    this.#createStyles();
    this.#renderBase();
    this.setChartType(this.chartType);
  }

  #renderBase() {
    this.container = document.getElementById(this.containerId);
    this.chartContainer = createElement("div", ["containerChart"]);
    this.#setContainerSize();
    appendChild(this.container, this.chartContainer);
  }

  #setContainerSize() {
    this.chartContainer.style.width = this.size.width + "px";
    this.chartContainer.style.height = this.size.height + "px";
  }

  #renderSvg() {
    const svgElement = createElementNS("svg");
    svgElement.setAttribute("width", this.size.width);
    svgElement.setAttribute("height", this.size.height);
    appendChild(this.chartContainer, svgElement);
    this.svgContainer = svgElement;
  }

  #renderColumnChart() {
    this.chartColumnContainer = createElement("div", ["columnContainer"]);
    appendChild(this.chartContainer, this.chartColumnContainer);

    this.#renderMarks();

    this.chartData.forEach((item, index) => {
      const columnElement = createElement("div");
      columnElement.style.height = (this.size.height / this.#findMaxNumberInArray(this.chartData)) * item + "px";
      columnElement.style.width = this.size.width / this.chartData.length + "px";
      columnElement.style.background = this.columnColor;
      columnElement.style.border = this.columnBorder;
      appendChild(this.chartColumnContainer, columnElement);
    });
  }

  #renderLineChart() {
    if (!this.svgLineContainer) {
      this.svgLineContainer = createElementNS("g", ["svgLineContainer"]);
      appendChild(this.svgContainer, this.svgLineContainer);
    }

    if (!this.svgContainer.getAttribute("xmlns")) {
      this.svgContainer.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      this.svgContainer.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    }

    this.chartData.forEach((item, index) => {
      let x = (this.size.width / (this.chartData.length - 1)) * index;
      let y = this.size.height - (this.size.height / (this.#findMaxNumberInArray(this.chartData) - this.#findMinNumberInArray(this.chartData))) * (item - this.#findMinNumberInArray(this.chartData));
      let x2 = index + 1 < this.chartData.length ? (this.size.width / (this.chartData.length - 1)) * (index + 1) : 0;
      let y2 = index + 1 < this.chartData.length ? this.size.height - (this.size.height / (this.#findMaxNumberInArray(this.chartData) - this.#findMinNumberInArray(this.chartData))) * (this.chartData[index + 1] - this.#findMinNumberInArray(this.chartData)) : 0;

      let lineElement = createElementNS("line");
      lineElement.setAttribute("x1", x);
      lineElement.setAttribute("y1", y);
      lineElement.setAttribute("x2", x2);
      lineElement.setAttribute("y2", y2);
      lineElement.setAttribute("stroke", this.lineColor);
      lineElement.setAttribute("stroke-width", this.lineWidth);

      let circleElement = createElementNS("circle");
      circleElement.setAttribute("cx", x);
      circleElement.setAttribute("cy", y);
      circleElement.setAttribute("r", this.circleRadius);
      circleElement.setAttribute("fill", this.circleColor);

      if (index + 1 < this.chartData.length) {
        appendChild(this.svgLineContainer, lineElement);
      }
      appendChild(this.svgLineContainer, circleElement);
    });

    if (!this.svgMarksContainer) {
      this.#renderMarks();
    }
  }

  #renderMarks() {
    if (!this.svgMarksContainer) {
      this.svgMarksContainer = createElementNS("g", ["svgMarksContainer"]);
      appendChild(this.svgContainer, this.svgMarksContainer);
    }
    for (let index = 0; index <= this.markCount; index++) {
      let markingX = 0;
      let markingY = this.size.height - (this.size.height / this.markCount) * index;

      let markingX2 = this.size.width;
      let markingY2 = this.size.height - (this.size.height / this.markCount) * index;
      let lineElement = createElementNS("line");
      lineElement.setAttribute("x1", markingX);
      lineElement.setAttribute("y1", markingY);
      lineElement.setAttribute("x2", markingX2);
      lineElement.setAttribute("y2", markingY2);
      lineElement.setAttribute("stroke", this.markColor);
      lineElement.setAttribute("stroke-width", this.markWidth);
      appendChild(this.svgMarksContainer, lineElement);


    }
    this.#renderXAxis();
    this.#renderYAxis();
  }

  #renderXAxis() {
    this.chartData.forEach((item, index) => {
      let textX = (this.size.width / (this.chartData.length - 1)) * index - 10;
      let textY = this.size.height + 25;
      let textElement = createElementNS("text");
      textElement.setAttribute("x", textX);
      textElement.setAttribute("y", textY);
      textElement.setAttribute("font-size", "15px");
      textElement.setAttribute("fill", this.markTextColor);
      textElement.textContent = this.headerData[index];
      appendChild(this.svgMarksContainer, textElement);
    });
  }

  #renderYAxis() {
    const minNumber = this.#findMinNumberInArray(this.chartData);
    const maxNumber = this.#findMaxNumberInArray(this.chartData);

    for (let index = 0; index <= this.markCount; index++) {

      let textX = 0 - 30;
      let textY = this.size.height - (this.size.height / this.markCount) * index + 5;
      let textMark = Math.round((((maxNumber - minNumber) / this.markCount) * index + minNumber) * 100) / 100;


      let textElement = createElementNS("text");
      textElement.setAttribute("x", textX);
      textElement.setAttribute("y", textY);
      textElement.setAttribute("font-size", "15px");
      textElement.setAttribute("fill", this.markTextColor);
      textElement.textContent = textMark;

      appendChild(this.svgMarksContainer, textElement);
    }
  }

  #createStyles() {
    const style = createElement("style", ["chartStyle"]);
    const existingStyle = document.head.querySelector(".chartStyle");

    if (!existingStyle) {
      style.className = "tableStyle";
      style.innerHTML = `
          .containerChart{
            padding: 20px 20px 25px 35px;
          }
          .containerChart svg{
            overflow: visible;
            position: absolute;
          }
          .containerChart .columnContainer{
            display: flex;
            align-items: flex-end;
          }
        `;
      appendChild(document.head, style);
    }
  }

  #findMaxNumberInArray(arr) {
    if (arr.length === 0) {
      return null;
    }
    let maxNumber = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > maxNumber) {
        maxNumber = arr[i];
      }
    }

    return maxNumber;
  }

  #findMinNumberInArray(arr) {
    if (arr.length === 0) {
      return null;
    }
    let minNumber = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < minNumber) {
        minNumber = arr[i];
      }
    }
    return minNumber;
  }

  setChartType(chartType) {
    if (chartType === "line") {
      this.chartContainer.innerHTML = "";
      this.svgMarksContainer = null;
      this.svgLineContainer = null;
      this.#renderSvg();
      this.#renderLineChart();
    } else if (chartType === "column") {
      this.chartContainer.innerHTML = "";
      this.svgMarksContainer = null;
      this.svgLineContainer = null;
      this.#renderSvg();
      this.#renderColumnChart();
    }
  }

  setChartData(chartData, headerData) {
    if (Array.isArray(chartData) && chartData.length >= 2) {
      this.headerData = headerData;
      this.chartData = chartData;
      this.chartContainer.innerHTML = "";
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Неверные данные диаграммы. Пожалуйста, предоставьте массив данных.");
    }
  }

  setMarkColor(color) {
    this.markColor = color;
    if (this.svgMarksContainer) {
      let children = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        children.forEach((markElement) => {
          markElement.setAttribute("stroke", this.markColor);
        });
      }
    }
  }

  setMarkCount(count) {
    if (typeof count === "number" && count > 2) {
      this.markCount = count;
      this.svgMarksContainer.remove();
      this.svgMarksContainer = null;
      this.#renderMarks();
    } else {
      errorProcessing("Недопустимое значение счетчика. Укажите число, большее или равное 2.");
    }
  }

  setMarkWidth(width) {
    this.markWidth = width;
    if (this.svgMarksContainer) {
      let children = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        children.forEach((markElement) => {
          markElement.setAttribute("stroke-width", this.markWidth);
        });
      }
    }
  }

  setMarkTextColor(color) {
    this.markTextColor = color;
    if (this.svgMarksContainer) {
      let children = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "text");
      if (children.length > 0) {
        children.forEach((markElement) => {
          markElement.setAttribute("fill", this.markTextColor);
        });
      }
    }
  }

  setLineColor(color) {
    this.lineColor = color;
    if (this.svgLineContainer) {
      let children = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        children.forEach((lineElement) => {
          lineElement.setAttribute("stroke", this.lineColor);
        });
      }
    }
  }

  setLineWidth(width) {
    this.lineWidth = width;
    if (this.svgLineContainer) {
      let children = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        children.forEach((lineElement) => {
          lineElement.setAttribute("stroke-width", this.lineWidth);
        });
      }
    }
  }

  setCircleColor(color) {
    this.circleColor = color;
    if (this.svgLineContainer) {
      let children = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "circle");
      if (children.length > 0) {
        children.forEach((circleElement) => {
          circleElement.setAttribute("fill", this.circleColor);
        });
      }
    }
  }

  setCircleRadius(radius) {
    this.circleRadius = radius;
    if (this.svgLineContainer) {
      let children = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "circle");
      if (children.length > 0) {
        children.forEach((circleElement) => {
          circleElement.setAttribute("r", this.circleRadius);
        });
      }
    }
  }

  setColumnColor(color) {
    this.columnColor = color;
    if (this.chartColumnContainer) {
      let children = Array.from(this.chartColumnContainer.children);
      if (children.length > 0) {
        children.forEach((circleElement) => {
          circleElement.style.backgroundColor = this.columnColor;
        });
      }
    }
  }

  setColumnBorder(borderData) {
    if (typeof borderData === "string") {
      this.columnBorder = borderData;
      if (this.chartColumnContainer) {
        let children = Array.from(this.chartColumnContainer.children);
        if (children.length > 0) {
          children.forEach((columnElement) => {
            columnElement.style.border = this.columnBorder;
          });
        }
      }
    } else {
      errorProcessing("Неверный формат данных границы. Пожалуйста, укажите строковый формат.");
    }

  }

  setChartWidth(width) {
    if (typeof width === "number" && width > 0) {
      this.size.width = width;
      this.chartContainer.innerHTML = "";
      this.#setContainerSize();
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Недопустимая ширина диаграммы. Укажите положительное число.");
    }
  }

  setChartHeight(height) {
    if (typeof height === "number" && height > 0) {
      this.size.height = height;
      this.chartContainer.innerHTML = "";
      this.#setContainerSize();
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Недопустимая высота диаграммы. Пожалуйста, укажите положительное число.");
    }

  }
}