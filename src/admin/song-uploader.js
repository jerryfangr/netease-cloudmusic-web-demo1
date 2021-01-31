import axios from 'axios';
import eventHub from '../vendor/event-hub';

const STATE = {
  WAIT_SELECT: Symbol('select file'),
  NO_SELECTED: Symbol('nothing selected'),
  SELECTED_FILE: Symbol('selected some files'),
  FILE_EXISTS: Symbol('selected file exists'),
  UPLOADING_FILE: Symbol('uploading file'),
  UPLOAD_FAILED: Symbol('upload failed'),
  UPLOAD_SUCCESS: Symbol('upload success')
}

let view = {
  el: '.page > aside > .upload-area',
  dom: null,
  template: `
    <div id="uploadBox" class="upload-wrapper">
      <div id="filePreview" class="upload-preview"></div>
      <span id="uploadButton" class="upload-button">{{buttonText}}</span>
      <p id="uploadMessage">{{messageText}}</p>
    </div>
  `,
  init () {
    this.state = STATE.WAIT_SELECT;
    this.dom = document.querySelector(this.el);
    this.previewDom = this.find('#filePreview');
    this.render();
  },
  render(data) {
    let renderData = data || this.dataByState(this.state);
    let html = this.template;
    for (const key in renderData) {
      html = html.replace('{{'+key+'}}', renderData[key]);
    }
    this.dom.innerHTML = html;
    this.previewDom = this.find('#filePreview');
  },
  updateByState (state, fileInfo) {
    if (state && state !== this.state) {
      this.state = state;
      let data = this.dataByState(state, fileInfo);
      let buttonDom = this.find('#uploadButton');
      let messageDom = this.find('#uploadMessage');
      buttonDom.textContent = data.buttonText;
      messageDom.textContent = data.messageText;
      this.dom.classList.remove('loding');
      if (state === STATE.UPLOAD_SUCCESS) {
        this.previewDom.innerHTML = '';
      } else if (state === STATE.UPLOADING_FILE) {
        this.dom.classList.add('loding');
      }
    }
  },
  dataByState(state, fileInfo) {
    switch (state) {
      case STATE.WAIT_SELECT:
        return { buttonText: '选择文件', messageText: '支持拖曳上传，每个文件限制 0-30MB' };
      case STATE.NO_SELECTED:
        return { buttonText: '选择文件', messageText: '未选中任何文件' };
      case STATE.FILE_EXISTS:
        return { buttonText: '点击上传', messageText: '已存在['+fileInfo+']' };
      case STATE.SELECTED_FILE:
        return { buttonText: '点击上传', messageText: '等待添加...' };
      case STATE.UPLOADING_FILE:
        return { buttonText: '正在上传', messageText: '正在上传...' };
      case STATE.UPLOAD_SUCCESS:
        return { buttonText: '选择文件', messageText: '上传成功!' };
      case STATE.UPLOAD_FAILED:
        return { buttonText: '重新上传', messageText: '上传失败!' };
      default:
        return { buttonText: '选择文件', messageText: '未知错误!' };
    }
  },
  addPreview(info) {
    let fileInfo = "<span>" + info + '</span>';
    this.previewDom.insertAdjacentHTML('beforeend', fileInfo);
  },
  find (selector) {
    return this.dom.querySelector(selector);
  },
  createFileInput (callback) {
    let inputDom = document.createElement('input')
    inputDom.setAttribute("style", 'visibility:hidden');
    inputDom.setAttribute('type', 'file');
    inputDom.setAttribute('multiple', '');
    document.body.appendChild(inputDom);
    inputDom.addEventListener('change', e => {
      callback(e, inputDom, inputDom.files);
    });
    return inputDom;
  }
}

let model = {
  init() {
    this.token = undefined;
    this.timer = undefined;
    this.axios = axios.create({
      baseURL: 'http://localhost:39999/upload/',
      timeout: 10000,
    });
    this.update();
  },
  updateToken () {
    this.axios.get('/token')
      .then(res => {
        let data = JSON.parse(res.request.responseText);
        this.token = data.result.token;
      })
  },
  upload(uploadFiles) {
    //新建一个FormData对象，加文件数据
    var formData = new FormData();
    for (const key in uploadFiles) {
      formData.append(key, uploadFiles[key]);
    }
    let newToken = this.token;
    return this.axios.post('/music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        token: newToken
      }
    });
  },
  update () {
    this.updateToken();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.updateToken();
    }, 1 * 60 * 1000);
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.model.init();
    this.uploadFiles = null;
    this.bindEvents();
  },
  bindEvents() {
    document.addEventListener('webkitvisibilitychange', () => {
      this.model.update(); // 监确保来回切换页面后model token不过期
    })

    this.stopDefaultDrop();

    this.view.find('#uploadBox').addEventListener("drop", e => {
      let files = e.dataTransfer.files; //获取文件对象
      this.selectFiles(files);
    });

    this.view.find('#uploadButton').addEventListener('click', e => {
      if (this.view.state === STATE.UPLOADING_FILE) {return;}
      if ([STATE.WAIT_SELECT, STATE.NO_SELECTED, STATE.UPLOAD_SUCCESS].indexOf(this.view.state) !== -1) {
        this.inputDom = this.inputDom || this.view.createFileInput(() => {
          this.selectFiles(this.inputDom.files)
        });
        return this.inputDom.click();
      }
      if (this.uploadFiles === null) {
        return this.view.updateByState(STATE.NO_SELECTED);
      }
      this.view.updateByState(STATE.UPLOADING_FILE);
      this.uploadFileToServer();
    });
  },
  selectFiles(files) {
    if (!files || files.length == 0) { //检测是否是拖拽文件到页面的操作
      return;
    }
    this.uploadFiles = this.uploadFiles || {};
    for (let i = 0; i < files.length; i++) {
      if (this.uploadFiles[files[i].name] !== undefined) {
        return this.view.updateByState(STATE.FILE_EXISTS, files[i].name);
      }
      files[i].fileType = this.getFileType(files[i].name);
      this.view.addPreview(files[i].name);
      this.uploadFiles[files[i].name] = files[i];
    }
    this.view.updateByState(STATE.SELECTED_FILE);
  },
  stopDefaultDrop () {
    // 取消浏览器默认会打开在页面的事件
    this.stopDefault(document, "drop"); //拖离
    this.stopDefault(document, "dragleave"); //拖后放
    this.stopDefault(document, "dragenter"); //拖进
    this.stopDefault(document, "dragover"); //拖来拖去
  },
  uploadFileToServer () {
    return this.model.upload(this.uploadFiles)
      .then((res) => {
        let result = JSON.parse(res.request.responseText).result;
        let fileLinks = [];
        for (const key in result.urls) { // 转化为真正的网页链接编码
          fileLinks.push({name: key, url: encodeURI(result.urls[key])})
        }
        eventHub.emit('admin-upload', fileLinks);
        this.view.updateByState(STATE.UPLOAD_SUCCESS);
        this.uploadFiles = null;
      }, error => {
          console.log(error.response);
          this.view.updateByState(STATE.UPLOAD_FAILED);
      });
  },
  getFileType(filename) {
    let array = filename.split(".");
    if (array.length <= 1) {
      return "none";
    }
    return array[array.length - 1];
  },
  stopDefault(element, eventType) {
    element.addEventListener(eventType, function (e) {
      e.preventDefault();
    });
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;