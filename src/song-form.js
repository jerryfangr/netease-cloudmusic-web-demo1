import eventHub from "./event-hub";
import { AV } from "./av";

let view = {
  el: ".page > main",
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
  render(data = [{ key: "", link: "" }]) {
    let placholders = ["key", "link"];
    let html = "";
    data.forEach((song) => {
      let template = this.template;
      placholders.forEach((string) => {
        template = template.replace(`{{${string}}}`, song[string] || "");
      });
      html += template;
    });
    this.dom.innerHTML = html;
  },
  reset () {
    this.render(undefined)
  }
};
view.init();

let model = {
  data: { id: "", name: "", singer: "", url: "" },
  init() {
    this.Song = AV.Object.extend("Song");
  },
  create(data) {
    this.normalizeData(data);
    let song = new this.Song();
    for (const key in this.data) {
      song.set(key, data.get(key));
    }
    return song.save().then((song) => {
      let { id, attributes } = song;
      // 该数据会被传递，确保不一样，Object.assign(this.data, { ...attributes });
      this.data = { ...attributes};
      this.data.id = id; // attributes id 为 null
    });
  },
  normalizeData(data) {
    data.get =
      data.get ||
      function (key) {
        return data[key];
      };
  },
};
model.init();

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render();
    eventHub.on("upload", (data) => {
      // console.log('song form 获取数据', data);
      this.view.render(data);
    });
    this.bindEvents();
  },
  bindEvents() {
    this.view.dom.addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.target.tagName === "FORM") {
        let form = e.target;
        let formData = new FormData(form);
        // console.log([form]);
        // console.log(formData.get("name"));
        this.model.create(formData)
        .then(() => {
          this.view.reset();
          eventHub.emit('create', this.model.data);
        }) 
      }
    });
  },
};

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
};

export default controller;
