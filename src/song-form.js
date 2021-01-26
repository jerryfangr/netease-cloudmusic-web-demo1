import eventHub from './event-hub';

let view = {
  el: '.page > main',
  template: `
    <h2>新建歌曲</h2>
    <form class="form">
      <div class="row">
        <label>
          歌名
          <input name="name" type="text" value="{{key}}">
        </label>
      </div>
      <div class="row">
        <label>
          歌手
          <input name="singer" type="text">
        </label>
      </div>
      <div class="row">
        <label>
          外链
          <input name="url" type="text" value="{{link}}">
        </label>
      </div>
      <div class="row action">
        <button type="submit">保存</button>
      </div>
    </form>
  `,
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  render (data=[{key:'',link:''}]) {
    let placholders = ['key', 'link'];
    let html = "";
    data.forEach(song => {
      let template = this.template;
      placholders.forEach(string => {
        template = template.replace(`{{${string}}}`, song[string] || '');
      })
      html += template;
    })
    this.dom.innerHTML = html;
  },
}
view.init();

let model = {};

let controller = {
  init (view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
    eventHub.on('upload', data => {
      // console.log('song form 获取数据', data);
      this.view.render(data);
    });
    this.bindEvents();
  },
  bindEvents () {
    this.view.dom.addEventListener('submit', e => {
      e.preventDefault();
    });
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;