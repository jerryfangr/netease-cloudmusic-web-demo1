import eventHub from './event-hub';

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
view.init();

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
    this.active();
    eventHub.on('upload', data => {
      this.active()
    })
    eventHub.on('select', data => {
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