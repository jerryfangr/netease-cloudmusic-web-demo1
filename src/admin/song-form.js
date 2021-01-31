import eventHub from "./event-hub";
import { AV } from "../vendor/av";

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
            <input name="singer" type="text" value="{{singer}}">
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
    this.render();
  },
  render(data = [{ name: '', singer: '', url: '' }]) {
    let html = '';
    let placholders = ['name', 'singer', 'url'];
    data.forEach((song) => {
      let template = this.template;
      placholders.forEach((string) => {
        template = template.replace(`{{${string}}}`, song[string] || '');
      });
      html += template;
    });
    this.dom.innerHTML = html;
    if (data.length === 1 && !!data[0].id) {
      this.setAllTitle('编辑歌曲');
    }
  },
  setAllTitle (title) {
    this.dom.querySelectorAll('h2').forEach(h2 => {
      h2.textContent = title;
    })
  },
  close(form) { // form-container
    this.setTitle(form, 'close', '已保存');
  },
  warning (form, content) {
    this.setTitle(form, 'warning', content);
  },
  save(form) {
    this.setTitle(form, undefined, "已保存 - " + new Date().toString().split('GMT')[0])
  },
  setTitle(form, className, content) {
    let formContainer = form.parentNode;
    formContainer.classList.remove('close');
    formContainer.classList.remove('warning');
    className && formContainer.classList.add(className);
    formContainer.querySelector('h2').textContent = content;
  },
  reset () {
    this.render(undefined)
  },
};
view.init();

let model = {
  data: { name: '', singer: '', url: '' },
  init() {
    this.isCreate = true;
    this.Song = AV.Object.extend("Song");
    this.unsavedFileCount = 0;
  },
  create(data) {
    let song = new this.Song();
    let result = this.setDataToSong(data, song);
    return !result ? result : song.save().then((song) => {
      let { id, attributes } = song;
      this.data = { ...attributes};
      this.data.id = id; // attributes id 为 null
    });
  },
  update(data) {
    let song = AV.Object.createWithoutData('Song', this.data.id);
    let result = this.setDataToSong(data, song);
    return !result ? result : song.save()
      .then(() => {
        return { ...this.data };
      });
  },
  setDataToSong(data, song) {
    this.normalizeData(data);
    for (const key in this.data) {
      this.data[key] = data.get(key);
      song.set(key, data.get(key));
    }
    this.data.id = song.id;
    return data.get('name') ? true : false;;
  },
  normalizeData(data) {
    data.get =
      data.get ||
      function (key) {
        return this[key];
      };
  },
};
model.init();

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.formType = 'new';
    this.bindEvents();
    this.bindEventHub();
  },
  bindEventHub() {
    eventHub.on("upload", (data) => {
      this.updateStatus('create', true);
      this.view.render(data);
      this.model.unsavedFileCount = data.length || 0;
    });
    eventHub.on("select", (data) => {
      this.updateStatus('select', false);
      this.model.data = data[0];
      this.view.render(data);
      this.model.unsavedFileCount = 1;
    });
    eventHub.on('new', (data) => {
      if (this.formType === 'new') { return; }
      this.updateStatus('new', true);
      this.reset();
    });
  },
  bindEvents() {
    this.view.dom.addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.target.tagName === "FORM") {
        if (this.model.isCreate) {
          this.createSong(e.target);
        } else {
          this.updateSong(e.target);
        }
      }
    });
  },
  updateStatus(formType, editStatus) {
    this.formType = formType;
    this.model.isCreate = editStatus;
  },
  createSong(form) {
    this.checkInput(form, this.model.create(new FormData(form), form), action => {
      action.then(() => {
        eventHub.emit('create', this.model.data);
        if (--this.model.unsavedFileCount > 0) {
          form.addEventListener('submit', this.preventDefault);
          return this.view.close(form);
        }
        this.formType = 'none';
        this.view.reset()
      }) 
    })
  },
  updateSong(form) {
    this.checkInput(form, this.model.update(new FormData(form), form), action => {
      action.then((data) => {
        this.view.save(form);
        eventHub.emit('update', data);
      })
    })
  },
  checkInput(form, result, callback) {
    if (result === false) {
      return this.view.warning(form, '至少输入歌名')
    }
    callback(result);
  },
  preventDefault (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  reset () {
    this.unsavedFileCount = 0;
    this.view.reset();
  }
};

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
};

export default controller;
