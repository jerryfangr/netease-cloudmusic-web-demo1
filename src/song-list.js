import eventHub from './event-hub';

let view = {
  el: '.page > aside > #songsContainer',
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  find(selector) {
    return this.dom.querySelector(selector);
  },
  template: `
    <ul class="song-list">
      <li>歌曲1</li>
      <li>歌曲2</li>
      <li>歌曲3</li>
      <li>歌曲4</li>
      <li>歌曲5</li>
      <li>歌曲6</li>
      <li>歌曲7</li>
      <li>歌曲8</li>
      <li>歌曲9</li>
    </ul>
  `,
  render(data) {
    this.dom.innerHTML = this.template;
  },
  deActive () {
    let activeDom = this.find('.active');
    activeDom && activeDom.classList.remove('active');
  }
}
view.init();

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
    eventHub.on('upload', data => {
      this.view.deActive()
    })
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;