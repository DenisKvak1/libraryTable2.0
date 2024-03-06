import {iErrorProcessing, iModalPlugin, iObservable, iTableController, PLUGIN_STATE} from "../../../env/types";
import {Observable} from "../../../env/helpers/observable";
import {createElement} from "../../../env/helpers/createDOMElements";

export class ErrorProcessing implements iErrorProcessing{
  name: string;
  subscribeError: { unsubscribe:()=> void }
  state$: iObservable<PLUGIN_STATE>
  controller:iTableController
  constructor() {
    this.name = 'errorProcessing'
    this.state$ = new Observable<PLUGIN_STATE>(PLUGIN_STATE.INITIALIZED)
  }
  registration(controller:iTableController){
    this.controller = controller
    this.state$.next(PLUGIN_STATE.ADDED)
    this.state$.next(PLUGIN_STATE.PENDING)
    this.state$.subscribe(()=>{
      controller.pluginEvent$.next(this)
    })
    this.handlerError()
    this.state$.next(PLUGIN_STATE.READY)
  }
  private handlerError(){
    this.subscribeError = this.controller.error$.subscribe((error)=>{
      console.log(error)
      if(this.controller.plugins['modal']){
        let plug = this.controller.getPlugin('modal')
        let modalPlug:iModalPlugin = plug.plugin as iModalPlugin
        if(Array.isArray(error)){
          error = error.join('<br>')
        }
        let errorItem = createElement('h3',['errorText'])
        errorItem.innerHTML = error

        let modal = modalPlug.createModal(errorItem)
        modal.open()
      }
    })
  }
  unRegister(){
    this.state$.next(PLUGIN_STATE.REMOVED)
    this.subscribeError.unsubscribe()
  }
}