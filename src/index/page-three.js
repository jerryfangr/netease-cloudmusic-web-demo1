import eventHub from '../vendor/event-hub';

let view = {
  el: '#page > ol > .page-3',
  init() {
    this.dom = document.querySelector(this.el);
  },
  show () {
    this.dom.classList.add('active');
  },
  hide () {
    this.dom.classList.remove('active');
  }
  
}

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.bindEvents();
    this.bindEventHub();
  },
  bindEvents() {},
  bindEventHub () {
    eventHub.on('index-selectTab', data => {
      if (data === 'page-3') {
        this.view.show();
      } else {
        this.view.hide();
      }
    });
  }

}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;