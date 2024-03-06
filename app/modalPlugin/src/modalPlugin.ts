import { iModal, iModalPlugin, iObservable, iTableController, PLUGIN_STATE} from "../../../env/types";
import { Observable } from "../../../env/helpers/observable";
// @ts-ignore
import {Modal} from "./modules/modal/Modal";

export class ModalPlugin implements iModalPlugin {
  state$: iObservable<PLUGIN_STATE>
  modals: Array<iModal>;
  name: string;
  controller: iTableController

  constructor() {
    this.name = "modal";
    this.state$ = new Observable<PLUGIN_STATE.INITIALIZED>()
    this.modals = [];

  }

  registration(controller: iTableController):void {
    this.state$.next(PLUGIN_STATE.ADDED)
    this.state$.next(PLUGIN_STATE.PENDING)
    this.controller = controller
    this.state$.subscribe(()=>{
      this.controller.pluginEvent$.next(this)
    })
    this.state$.next(PLUGIN_STATE.READY)
  };
  createModal(content:string | Element):iModal {
    let modal = new Modal(content, null);
    this.modals.push(modal)
    return modal
  }
  unRegister(){
    this.modals.forEach((modal)=> {
      modal.destroy()
    })
    this.modals = []
    this.state$.next(PLUGIN_STATE.REMOVED)
  }
}
