let view = {
  $(selector) {
    return document.querySelector(selector);
  },
  el: '.page > main',
  template: `
    <h1>新建歌曲</h1>
    <form class="form">
      <div class="row">
        <label for="">
          歌名
          <input type="text">
        </label>
      </div>
      <div class="row">
        <label for="">
          歌手
          <input type="text">
        </label>
      </div>
      <div class="row">
        <label for="">
          外链
          <input type="text">
        </label>
      </div>
      <div class="row action">
        <button type="submit">保存</button>
      </div>
    </form>
  `,
  render(data) {
    this.$(this.el).innerHTML = this.template;
  },
}
let model = {}
let controller = {
  init (view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;