import { createElement, createElementSvg } from "../helpers/createDOMElements";
import { appendChild } from "../helpers/appendRemoveChildDOMElements";
import { errorProcessing } from "../helpers/errorProcessing";
import { iChart } from "../env/types";
import { getElementById } from "../helpers/getDOMElementById";

type size = {
  width: number,
  height: number
}

export class Chart implements iChart {
  containerId: string;
  chartData: Array<number>;
  headerData: Array<string>;
  size: size;
  chartType: string;
  markCount: number;
  markColor: string;
  markWidth: number;
  markTextColor: string;
  lineColor: string;
  lineWidth: number;
  circleColor: string;
  circleRadius: number;
  columnColor: string;
  columnBorder: string;
  container: HTMLElement;
  chartContainer: HTMLElement;
  svgContainer: SVGElement;
  chartColumnContainer: HTMLElement;
  svgLineContainer: SVGElement;
  svgMarksContainer: SVGElement;

  constructor(containerId: string, data: Array<number>, headerData: Array<string>, size: size, chartType: string = "line") {
    this.containerId = containerId;
    this.chartData = data;
    this.headerData = headerData;
    this.size = size;
    this.chartType = chartType;
    this.markCount = 10;
    this.markColor = "#a0a0a0";
    this.markWidth = 0.1;
    this.markTextColor = "rgba(53, 53, 53, 0.9)";
    this.lineColor = "rgb(69, 97, 255)";
    this.lineWidth = 1;
    this.circleColor = "blue";
    this.circleRadius = 3;
    this.columnColor = "rgba(53, 53, 53, 0.575)";
    this.columnBorder = "0.5px solid rgba(53, 53, 53, 0.9)";
    this.renderBase();
    this.setChartType(this.chartType);
  }

  private renderBase(): void {
    let container = getElementById(this.containerId);
    if (container instanceof HTMLElement) {
      this.container = container;
    } else {
      errorProcessing(container);
    }
    this.chartContainer = createElement("div", ["containerChart"]);
    this.setContainerSize();
    appendChild(this.container, this.chartContainer);
  }

  private setContainerSize(): void {
    this.chartContainer.style.width = this.size.width + 55 + "px";
    this.chartContainer.style.height = this.size.height + 45 + "px";
  }

  private renderSvg(): void {
    const svgElement: SVGElement = createElementSvg("svg");
    svgElement.setAttribute("width", `${this.size.width}`);
    svgElement.setAttribute("height", `${this.size.height}`);
    appendChild(this.chartContainer, svgElement);
    this.svgContainer = svgElement;
  }

  private renderColumnChart(): void {
    this.chartColumnContainer = createElement("div", ["columnContainer"]);
    appendChild(this.chartContainer, this.chartColumnContainer);

    this.renderMarks();

    for (let i = 0; i < this.chartData.length; i++) {
      const item = this.chartData[i];
      const columnElement: HTMLElement = createElement("div");
      columnElement.style.height = (this.size.height / this.findMaxNumberInArray(this.chartData)) * item + "px";
      columnElement.style.width = this.size.width / this.chartData.length + "px";
      columnElement.style.background = this.columnColor;
      columnElement.style.border = this.columnBorder;
      appendChild(this.chartColumnContainer, columnElement);
    }

  }

  private renderLineChart(): void {
    if (!this.svgLineContainer) {
      this.svgLineContainer = createElementSvg("g", ["svgLineContainer"]);
      appendChild(this.svgContainer, this.svgLineContainer);
    }

    if (!this.svgContainer.getAttribute("xmlns")) {
      this.svgContainer.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      this.svgContainer.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    }

    for (let index = 0; index < this.chartData.length; index++) {
      const item = this.chartData[index];
      let x: number = (this.size.width / (this.chartData.length - 1)) * index;
      let y: number = this.size.height - (this.size.height / (this.findMaxNumberInArray(this.chartData) - this.findMinNumberInArray(this.chartData))) * (item - this.findMinNumberInArray(this.chartData));
      let x2: number = index + 1 < this.chartData.length ? (this.size.width / (this.chartData.length - 1)) * (index + 1) : 0;
      let y2: number = index + 1 < this.chartData.length ? this.size.height - (this.size.height / (this.findMaxNumberInArray(this.chartData) - this.findMinNumberInArray(this.chartData))) * (this.chartData[index + 1] - this.findMinNumberInArray(this.chartData)) : 0;

      let lineElement: SVGElement = createElementSvg("line");
      lineElement.setAttribute("x1", `${x}`);
      lineElement.setAttribute("y1", `${y}`);
      lineElement.setAttribute("x2", `${x2}`);
      lineElement.setAttribute("y2", `${y2}`);
      lineElement.setAttribute("stroke", this.lineColor);
      lineElement.setAttribute("stroke-width", `${this.lineWidth}`);

      let circleElement: SVGElement = createElementSvg("circle");
      circleElement.setAttribute("cx", `${x}`);
      circleElement.setAttribute("cy", `${y}`);
      circleElement.setAttribute("r", `${this.circleRadius}`);
      circleElement.setAttribute("fill", this.circleColor);

      if (index + 1 < this.chartData.length) {
        appendChild(this.svgLineContainer, lineElement);
      }
      appendChild(this.svgLineContainer, circleElement);
    }


    if (!this.svgMarksContainer) {
      this.renderMarks();
    }
  }

  private renderMarks(): void {
    if (!this.svgMarksContainer) {
      this.svgMarksContainer = createElementSvg("g", ["svgMarksContainer"]);
      appendChild(this.svgContainer, this.svgMarksContainer);
    }
    for (let index: number = 0; index <= this.markCount; index++) {
      let markingX: number = 0;
      let markingY: number = this.size.height - (this.size.height / this.markCount) * index;

      let markingX2: number = this.size.width;
      let markingY2: number = this.size.height - (this.size.height / this.markCount) * index;
      let lineElement: SVGElement = createElementSvg("line");
      lineElement.setAttribute("x1", `${markingX}`);
      lineElement.setAttribute("y1", `${markingY}`);
      lineElement.setAttribute("x2", `${markingX2}`);
      lineElement.setAttribute("y2", `${markingY2}`);
      lineElement.setAttribute("stroke", this.markColor);
      lineElement.setAttribute("stroke-width", `${this.markWidth}`);
      appendChild(this.svgMarksContainer, lineElement);


    }
    this.renderXAxis();
    this.renderYAxis();
  }

  private renderXAxis(): void {
    for (let index = 0; index < this.chartData.length; index++) {
      let textX: number = (this.size.width / (this.chartData.length - 1)) * index - 10;
      let textY: number = this.size.height + 25;
      let textElement: SVGElement = createElementSvg("text");
      textElement.setAttribute("x", `${textX}`);
      textElement.setAttribute("y", `${textY}`);
      textElement.setAttribute("font-size", "15px");
      textElement.setAttribute("fill", this.markTextColor);
      textElement.textContent = this.headerData[index];
      appendChild(this.svgMarksContainer, textElement);
    }
  }

  private renderYAxis(): void {
    const minNumber: number = this.findMinNumberInArray(this.chartData);
    const maxNumber: number = this.findMaxNumberInArray(this.chartData);

    for (let index: number = 0; index <= this.markCount; index++) {

      let textX: number = 0 - 30;
      let textY: number = this.size.height - (this.size.height / this.markCount) * index + 5;
      let textMark: number = Math.round((((maxNumber - minNumber) / this.markCount) * index + minNumber) * 100) / 100;


      let textElement: SVGElement = createElementSvg("text");
      textElement.setAttribute("x", `${textX}`);
      textElement.setAttribute("y", `${textY}`);
      textElement.setAttribute("font-size", "15px");
      textElement.setAttribute("fill", this.markTextColor);
      textElement.textContent = textMark.toString();

      appendChild(this.svgMarksContainer, textElement);
    }
  }


  private findMaxNumberInArray(arr: Array<number>): null | number {
    if (arr.length === 0) {
      return null;
    }
    let maxNumber: number = arr[0];
    for (let i: number = 1; i < arr.length; i++) {
      if (arr[i] > maxNumber) {
        maxNumber = arr[i];
      }
    }

    return maxNumber;
  }

  private findMinNumberInArray(arr: Array<number>): null | number {
    if (arr.length === 0) {
      return null;
    }
    let minNumber: number = arr[0];
    for (let i: number = 1; i < arr.length; i++) {
      if (arr[i] < minNumber) {
        minNumber = arr[i];
      }
    }
    return minNumber;
  }

  setChartType(chartType: string): void {
    if (chartType === "line") {
      this.chartContainer.innerHTML = "";
      this.svgMarksContainer = null;
      this.svgLineContainer = null;
      this.renderSvg();
      this.renderLineChart();
    } else if (chartType === "column") {
      this.chartContainer.innerHTML = "";
      this.svgMarksContainer = null;
      this.svgLineContainer = null;
      this.renderSvg();
      this.renderColumnChart();
    }
  }

  setChartData(chartData: Array<number>, headerData: Array<string>): void {
    if (Array.isArray(chartData) && chartData.length >= 2) {
      this.headerData = headerData;
      this.chartData = chartData;
      this.chartContainer.innerHTML = "";
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Неверные данные диаграммы. Пожалуйста, предоставьте массив данных.");
    }
  }

  setMarkColor(color: string): void {
    this.markColor = color;
    if (this.svgMarksContainer) {
      let children: Array<Element> = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const markElement = children[i];
          markElement.setAttribute("stroke", this.markColor);
        }
      }
    }
  }

  setMarkCount(count: number): void {
    if (typeof count === "number" && count > 2) {
      this.markCount = count;
      this.svgMarksContainer.remove();
      this.svgMarksContainer = null;
      this.renderMarks();
    } else {
      errorProcessing("Недопустимое значение счетчика. Укажите число, большее или равное 2.");
    }
  }

  setMarkWidth(width: number): void {
    this.markWidth = width;
    if (this.svgMarksContainer) {
      let children: Array<Element> = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const markElement = children[i];
          markElement.setAttribute("stroke-width", `${this.markWidth}`);
        }
      }
    }
  }

  setMarkTextColor(color: string): void {
    this.markTextColor = color;
    if (this.svgMarksContainer) {
      let children: Array<Element> = Array.from(this.svgMarksContainer.children).filter((item) => item.tagName === "text");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const markElement = children[i];
          markElement.setAttribute("fill", this.markTextColor);
        }
      }
    }
  }

  setLineColor(color: string): void {
    this.lineColor = color;
    if (this.svgLineContainer) {
      let children: Array<Element> = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const lineElement = children[i];
          lineElement.setAttribute("stroke", this.lineColor);
        }
      }
    }
  }

  setLineWidth(width: number): void {
    this.lineWidth = width;
    if (this.svgLineContainer) {
      let children: Array<Element> = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "line");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const lineElement = children[i];
          lineElement.setAttribute("stroke-width", `${this.lineWidth}`);
        }
      }
    }
  }

  setCircleColor(color: string): void {
    this.circleColor = color;
    if (this.svgLineContainer) {
      let children: Array<Element> = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "circle");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const circleElement = children[i];
          circleElement.setAttribute("fill", this.circleColor);
        }
      }
    }
  }

  setCircleRadius(radius: number): void {
    this.circleRadius = radius;
    if (this.svgLineContainer) {
      let children: Array<Element> = Array.from(this.svgLineContainer.children).filter((item) => item.tagName === "circle");
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const circleElement = children[i];
          circleElement.setAttribute("r", `${this.circleRadius}`);
        }
      }
    }
  }

  setColumnColor(color: string): void {
    this.columnColor = color;
    if (this.chartColumnContainer) {
      let children: Array<Element> = Array.from(this.chartColumnContainer.children);
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const circleElement = children[i] as HTMLElement;
          circleElement.style.backgroundColor = this.columnColor;
        }
      }
    }
  }

  setColumnBorder(borderData: string): void {
    this.columnBorder = borderData;
    if (this.chartColumnContainer) {
      let children: Array<Element> = Array.from(this.chartColumnContainer.children);
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const columnElement = children[i] as HTMLElement;
          columnElement.style.border = this.columnBorder;
        }
      }
    } else {
      errorProcessing("Неверный формат данных границы. Пожалуйста, укажите строковый формат.");
    }

  }

  setChartWidth(width: number): void {
    if (typeof width === "number" && width > 0) {
      this.size.width = width;
      this.chartContainer.innerHTML = "";
      this.setContainerSize();
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Недопустимая ширина диаграммы. Укажите положительное число.");
    }
  }

  setChartHeight(height: number): void {
    if (typeof height === "number" && height > 0) {
      this.size.height = height;
      this.chartContainer.innerHTML = "";
      this.setContainerSize();
      this.setChartType(this.chartType);
    } else {
      errorProcessing("Недопустимая высота диаграммы. Пожалуйста, укажите положительное число.");
    }

  }
}