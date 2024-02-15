import {iErrorProcessing, iModalPlugin, iObservable, iTableController, pluginSTATE} from "../../../env/types";
import { Observable } from "../../../env/helpers/observable";
import { createElement } from "../../../env/helpers/createDOMElements";

export class ErrorProcessing implements iErrorProcessing{
  error$: iObservable<string | Array<string>>
  name: string;
  subscribeError: { unsubscribe:()=> void }
  state$: iObservable<pluginSTATE>

  constructor() {
    this.name = 'errorProcessing'
    this.state$ = new Observable<pluginSTATE>(pluginSTATE.INITIALIZED)
    this.error$ = new Observable<string | Array<string>>()
  }
  registration(controller:iTableController){

    this.subscribeError = controller.error$.subscribe((error)=>{
      console.log(error)
      if(controller.plugins['modal']){
        let plug = controller.getPlugin('modal')
        let modalPlug:iModalPlugin = plug.plugin as iModalPlugin
        if(Array.isArray(error)){
          error = error.join('<br>')
        }
        let errorItem = createElement('h3',['errorText'])
        errorItem.innerHTML = error

        let modal = modalPlug.createModal(errorItem, true)
        modalPlug.openModal(modal)
      }
    })
    this.state$.next(pluginSTATE.LOADED)
  }
  unRegister(){
    this.subscribeError.unsubscribe()
  }
}