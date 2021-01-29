import eventHub from "./event-hub";
import { AV } from "./av";

let view = {
  el: ".page > main",
  template: `
    <div class="form-container">
      <h2>新建歌曲</h2>
      <form class="form">
        <div class="row">
          <label>
            歌名
            <input name="name" type="text" value="{{name}}">
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
            <input name="url" type="text" value="{{url}}">
          </label>
        </div>
        <div class="row action">
          <button type="submit">保存</button>
        </div>
      </form>
    </div>
  `,
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  render(data = [{ name: "", url: "" }]) {
    let placholders = ["name", "url"];
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
  close(element) { // form-container
    while (true) {
      if (!element || element.tagName === 'MAIN') {
        return element === null;
      }
      if (!element.classList.contains('form-container')) {
        element = element.parentNode;
      } else {
        break;
      }
    }

    element.classList.add('saved');
    element.querySelector('h2').textContent = "已保存";
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
    this.unsavedFileCount = 0;
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
    this.bindEvents();
    eventHub.on("upload", (data) => {
      this.view.render(data);
      this.model.unsavedFileCount = data.length || 0;
    });
    eventHub.on("select", (data) => {
      this.view.render([data]);
      this.model.unsavedFileCount = 1;
    });
  },
  bindEvents() {
    this.view.dom.addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.target.tagName === "FORM") {
        let form = e.target;
        this.model.create(new FormData(form))
          .then(() => {
            eventHub.emit('create', this.model.data);
            if (--this.model.unsavedFileCount > 0) {
              form.addEventListener('submit', this.preventDefault);
              return this.view.close(form);
            }
            this.view.reset()
          }) 
      }
    });
  },
  preventDefault (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
};

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
};

export default controller;
