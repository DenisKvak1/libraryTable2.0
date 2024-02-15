import { iObservableBack } from "../../app/tableCore/src/env/types";

export class ObservableBack implements iObservableBack {
  listeners: Record<string, ((eventData: any) => void)[]>;

  constructor() {
    this.listeners = {};
  }

  subscribe(eventName: string, callback: (eventData: any) => void): { unsubscribe: () => void } {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);

    return {
      unsubscribe: (): void => {
        this.listeners[eventName] = this.listeners[eventName].filter((listener) => listener !== callback);
      }
    };
  }

  next(eventName: string, eventData: any): void {
    const listenersArray = this.listeners[eventName];

    if (listenersArray) {
      for (let i = 0; i < listenersArray.length; i++) {
        const listener = listenersArray[i];
        listener(eventData);
      }
    }
  }
  unsubscribeAll(): void {
    this.listeners = {};
  }
}