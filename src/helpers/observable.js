export class Observable {
  constructor() {
    this.listeners = {};
  }

  subscribe(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);

    return {
      unsubscribe: () => {
        this.listeners[eventName] = this.listeners[eventName].filter((listener) => listener !== callback);
      }
    };
  }

  next(eventName, eventData) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        listener(eventData);
      });
    }
  }

  unsubscribeAll() {
    this.listeners = {};
  }
}