let view = {
  el: '.page-1 > section.playlists',
  init() {
    this.dom = document.querySelector(this.el);
  },
}

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
  },
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;