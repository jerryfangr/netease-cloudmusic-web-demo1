let eventHub = {
  events: {},
  emit(eventName, data) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].forEach(callback => {
      callback.call(undefined, data);
    });
  },
  on (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  },
  off(eventName) {
    if (this.events[eventName] !== undefined) {
      delete this.events[eventName];
    }
  }
}

export default eventHub;