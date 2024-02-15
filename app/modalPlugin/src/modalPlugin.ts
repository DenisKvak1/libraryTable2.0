import {iModal, iModalPlugin, iObservable, pluginSTATE} from "../../../env/types";
import { Observable } from "../../../env/helpers/observable";
import { Modal } from "./modules/Modal";

export class ModalPlugin implements iModalPlugin {
  error$: iObservable<string | Array<string>>;
  state$: iObservable<pluginSTATE>
  modals: Array<iModal>;
  name: string;

  constructor() {
    this.name = "modal";
    this.state$ = new Observable<pluginSTATE>()
    this.error$ = new Observable<string | Array<string>>();
    this.modals = [];
  }

  registration():void {
    this.state$.next(pluginSTATE.LOADED)
  };
  createModal(content:string | Element, destroyMode:boolean = false) {
    let modal = new Modal(content, null, destroyMode);
    this.modals.push(modal)
    return modal
  }

  setContent(modal: iModal, content: Element | string) {
    if(this.modals.indexOf(modal)>=0){
      modal.setContent(content)
    } else {
      this.error$.next('Модальное окно не зарегестрированно')
    }
  }

  openModal(modal:iModal) {
    if(this.modals.indexOf(modal)>=0){
      modal.openModal()
    } else {
      this.error$.next('Модальное окно не зарегестрированно')
    }
  }

  closeModal(modal:iModal) {
    if(this.modals.indexOf(modal)>=0){
      modal.closeModal()
    } else {
      this.error$.next('Модальное окно не зарегестрированно')
    }
  }
  unRegister(){
    this.modals.forEach((modal)=> {
      modal.destroy()
    })
    this.modals = []
  }
}
