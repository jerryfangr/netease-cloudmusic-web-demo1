import eventHub from '../vendor/event-hub';

let view = {
  el: '.page > aside > .new-song',
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  template: `新建歌曲`,
  render(data) {
    this.dom.innerHTML = this.template;
  },
  active () {
    this.dom.classList.add('active');
  },
  deActive () {
    this.dom.classList.remove('active');
  }
}


let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.view.render(this.model.data);
    this.active();
    this.bindEvents();
  },
  bindEvents () {
    this.view.dom.addEventListener('click', e => {
      this.active();
      eventHub.emit('admin-new');
    })
    eventHub.on('admin-upload', data => {
      this.active()
    })
    eventHub.on('admin-select', data => {
      this.view.deActive()
    })
  },
  active () {
    this.view.active();
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;