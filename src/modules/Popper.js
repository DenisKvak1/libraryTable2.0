import { createElement } from "../../../../libraryTable2.0/src/helpers/createDOMElements";
import { appendChild } from "../../../../libraryTable2.0/src/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../libraryTable2.0/src/helpers/observable";

export class Popper {
  constructor(targetElement,content,x, viewShell = false, destroyMode = false) {
    this.x = x
    this.viewShell = viewShell
    this.targetElement = targetElement
    this.#createStyles();
    this.observable = new Observable();

    this.popper = createElement("div", ["popper"]);
    this.targetElement.addEventListener('mouseenter', ()=>this.openPopper())
    this.state = false
    document.addEventListener('mousemove', (event)=>{
      if(this.state){
        this.popperRect = this.popper.getBoundingClientRect()
        this.targetElementRect = this.targetElement.getBoundingClientRect()
        if(event.clientX<this.targetElementRect.left-1 || event.clientX>this.targetElementRect.right+1 || event.clientY<this.targetElementRect.top-1 || event.clientY>this.targetElementRect.bottom+1){
          if(event.clientX<this.popperRect.left || event.clientX>this.popperRect.right || event.clientY<this.popperRect.top || event.clientY>this.popperRect.bottom){
            this.closePopper()
          }
        }
      }
    })

    this.popperLeave = false
    this.targetLeave = false
    this.popperContent = createElement("div", ["popper-content"]);

    if (typeof content === "string") {
      this.popperContent.innerHTML = content;
    } else if (content) {
      appendChild(this.popperContent, content);
    }

    appendChild(this.popper, this.popperContent);
    appendChild(document.body, this.popper);
    this.renderPosition()
  }

  #createStyles() {
    const style = createElement("style", ["popperStyle"]);
    if(!this.viewShell){
      style.innerHTML = `
        .popper {
          display: none;
          position: absolute;
          background-color: #fff;
          border: 1px solid #ccc;
          padding: 1px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
      `;
    } else {
      style.innerHTML = `
        .popper {
          display: none;
          position: absolute;
          z-index: 999;
        }
      `;
    }

    const existingStyle = document.head.querySelector(".popperStyle");

    if (!existingStyle) {
      appendChild(document.head, style);
    }
  }


  openPopper(){
    this.state = true
    this.popper.style.display = "block";
  }
  renderPosition(){
    setTimeout(()=>{
      let targetElementRect =  this.targetElement.getBoundingClientRect()

      if(!this.x){
        this.popper.style.top = `${targetElementRect.top - this.popper.offsetHeight}px`;
        this.popper.style.left= `${targetElementRect.left+this.targetElement.offsetWidth/2-this.popper.offsetHeight/2}px`
      } else {
        this.popper.style.top = `${targetElementRect.top - this.popper.offsetHeight}px`;
        this.popper.style.left= `${this.x}px`
      }
    }, 0)
  }
  closePopper() {
    console.log('close')
    this.state = false
    this.popper.style.display = "none";
    this.#triggerEvent('close')

    this.popper.remove()
  }
  setX(x){
    this.x  = x
    this.renderPosition()
  }
  subscribe(eventName, callback) {
    return this.observable.subscribe(eventName, callback);
  }

  #triggerEvent(eventName, data) {
    this.observable.next(eventName, data);
  }
}