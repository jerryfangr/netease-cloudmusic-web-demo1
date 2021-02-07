import eventHub from '../vendor/event-hub';
import { AV } from "../vendor/av";

let view = {
  el: ".page > main",
  template: `
    <div class="form-container">
      <h2>新建歌曲</h2>
      <form class="form">
        <div class="row">
          <label>
            封面
            <input name="cover" type="text" value="{{cover}}">
          </label>
        </div>
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
        <div class="row">
          <label>
            歌词
            <textarea name="lyric"cols="30" rows="10">{{lyric}}</textarea>
          </label>
        </div>
        <div class="row action">
          <button type="submit">保存</button>
        </div>
      </form>
    </div>
  `,
  init(data) {
    this.dom = document.querySelector(this.el);
    this.render(data);
  },
  render(data = [{ name: '', singer: '', url: '', cover: '', lyric:'' }]) {
    data = Array.isArray(data) ? data : [data];
    let html = '';
    data.forEach((song) => {
      let template = this.template;
      for (const key in song) {
        template = template.replace(`{{${key}}}`, song[key] || '');
      }
      template = template.replace(`{{lyric}}`, song.lyric || '');
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

let model = {
  init() {
    this.isCreate = true;
    this.Song = AV.Object.extend("Song");
    this.resetData({});
  },
  resetData (data) {
    this.data = { name: '', singer: '', url: '', cover: '', lyric: '' };
    Object.assign(this.data, data);
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


let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.model.init();
    this.view.init(this.model.data);
    this.formType = 'new';
    this.bindEvents();
    this.bindEventHub();
  },
  bindEventHub() {
    eventHub.on("admin-upload", (data) => {
      this.updateStatus('create', true);
      this.view.render(data);
      this.model.unsavedFileCount = data.length || 0;
    });
    eventHub.on("admin-select", (data) => {
      this.updateStatus('select', false);
      this.model.resetData(data[0]);
      this.view.render(this.model.data);
      this.model.unsavedFileCount = 1;
    });
    eventHub.on('admin-new', (data) => {
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
        eventHub.emit('admin-create', this.model.data);
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
        eventHub.emit('admin-update', data);
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
