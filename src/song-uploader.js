import axios from 'axios';
import eventHub from './event-hub';

let view = {
  el: '.page > aside > .upload-area',
  dom: null,
  init () {
    this.dom = document.querySelector(this.el);
  },
  find (selector) {
    return this.dom.querySelector(selector);
  }
}
view.init();

let model = {
  token: undefined,
  init() {
    this.axios = axios.create({
      baseURL: 'http://localhost:39999/upload/',
      timeout: 10000,
      // headers: { 'X-Custom-Header': 'foobar' }
    });
    this.updateToken();
    this.update && this.update();
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
  update() {
    setInterval(() => {
      this.updateToken();
    }, 1 * 60 * 1000)
  }
}

model.init();

let controller = {
  view: null,
  uploadFiles: null,
  init(view, model) {
    this.view = view;
    this.model = model;
    this.uploadBoxView = view.find('#uploadBox');
    this.previewView = view.find('#filePreview');
    this.uploadView = view.find('#uploadButton');
    this.messageView = view.find('#uploadMessage');
    this.bindEvents();
  },
  bindEvents() {
    this.stopDefaultDrop();
    this.uploadBoxView.addEventListener("drop", e => {
      var files = e.dataTransfer.files; //获取文件对象
      if (files.length == 0) { //检测是否是拖拽文件到页面的操作
        return false;
      }
      this.uploadFiles = this.uploadFiles || {};
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (this.uploadFiles[file.name] !== undefined) {
          this.messageView.textContent = "[" + file.name + "]，已存在";
          return;
        }
        file.fileType = this.getFileType(file.name);
        this.appendView(this.previewView, file.name)
        this.uploadFiles[file.name] = file;
      }

      this.messageView.textContent = "等待添加..."
    });

    this.uploadView.addEventListener('click', e => {
      this.messageView.textContent = "尝试上传..."
      if (this.uploadFiles === null) {
        return this.setStatus('unchoose')
      }
      this.uploadFileToServer();
    });
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
          fileLinks.push({
            key: key,
            link: encodeURI(result.urls[key])
          })
        }
        eventHub.emit('upload', fileLinks);
        this.setStatus('finish')
      }, error => {
        console.log([error]);
          this.setStatus('error')
      });
  },
  setStatus(status) {
    switch (status) {
      case 'finish':
        this.messageView.textContent = "上传完毕!"
        break;
      case 'reset':
        this.messageView.textContent = "拖曳上传，单次总和大小限制 50MB"
        break;
      case 'error':
        this.messageView.textContent = "上传失败"
        break;
      case 'unchoose':
        this.messageView.textContent = "未选择文件"
        break;
      default:
        this.messageView.textContent = "未知错误"
        break;
    }
    this.previewView.innerHTML = "";
    this.uploadFiles = null;
  },
  getFileType(filename) {
    let array = filename.split(".");
    if (array.length <= 1) {
      return "none";
    }
    return array[array.length - 1];
  },
  appendView(element, info) {
    let fileInfo = "<span>" + info + '</span>';
    element.insertAdjacentHTML('beforeend', fileInfo);
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