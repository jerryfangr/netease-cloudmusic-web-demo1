let view = {
  $(selector) {
    return document.querySelector(selector);
  },
  el: '.page > aside > .new-song',
  template: `
    新建歌曲
  `,
  render(data) {
    this.$(this.el).innerHTML = this.template;
  },
}
let model = {}
let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;