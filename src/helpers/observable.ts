import {iObservable} from "../env/types";

export class Observable implements iObservable{
  listeners: Record<string, ((eventData: any) => void)[]>

  subscribe(eventName:string, callback:(eventData: any) => void):{ unsubscribe: () => void } {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);

    return {
      unsubscribe: ():void => {
        this.listeners[eventName] = this.listeners[eventName].filter((listener) => listener !== callback);
      }
    };
  }

  next(eventName:string, eventData:any):void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        listener(eventData);
      });
    }
  }

  unsubscribeAll():void {
    this.listeners = {};
  }
}