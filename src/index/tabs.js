import eventHub from '../vendor/event-hub';

let view = {
  el: '#page #tabs',
  init () {
    this.dom = document.querySelector(this.el);
  },
  active (liDom) {
    this.allLi = this.allLi || this.dom.querySelectorAll('li');
    this.allLi.forEach(element => {
      element.classList.remove('active');
    });
    liDom.classList.add('active');
  },
  findDomWith(tagName, dom) {
    while (true) {
      if (dom.tagName === tagName.toUpperCase()) {
        return dom;
      } else if (dom === this.dom) {
        return null;
      } else {
        dom = dom.parentNode;
      }
    }
  }
}

let model = {}

let controller = {
  init (view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.bindEvents();
  },
  bindEvents () {
    this.view.dom.addEventListener('click', e => {
      let liDom = this.view.findDomWith('li', e.target);
      if (liDom !== null) {
        console.log([liDom]);
        this.view.active(liDom);
        eventHub.emit('index-selectTab', liDom.dataset.tab);
      }
    });
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;