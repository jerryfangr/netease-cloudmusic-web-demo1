let view = {
  el: '.page-1 > section.playlists',
  template: `
  <li>
    <div class="cover">
      <img width=105 src="https://i.loli.net/2017/08/22/599ba7a0aea8b.jpg" alt="封面">
    </div>
    <p>两行文字两行文字两行文字两行文字两行文字</p>
  </li>
  `,
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