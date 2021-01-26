let view = {
  $(selector) {
    return document.querySelector(selector);
  },
  el: '.page > aside > #songsContainer',
  template: `
    <ul class="song-list">
      <li>歌曲1</li>
      <li>歌曲2</li>
      <li>歌曲3</li>
      <li class="active">歌曲4</li>
      <li>歌曲5</li>
      <li>歌曲6</li>
      <li>歌曲7</li>
      <li>歌曲8</li>
      <li>歌曲9</li>
      <li>歌曲10</li>
    </ul>
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