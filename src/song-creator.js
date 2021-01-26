import eventHub from './event-hub';

let view = {
  el: '.page > aside > .new-song',
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  template: `
    新建歌曲
  `,
  render(data) {
    this.dom.innerHTML = this.template;
  },
}
view.init();

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
    eventHub.on('upload', data => {
      this.active()
    })
  },
  active () {
    this.view.dom.classList.add('active');
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;