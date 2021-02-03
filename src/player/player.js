import { AV } from "../vendor/av";
import eventHub from '../vendor/event-hub';

let view = {
  el: '#app',
  template: `
  <h3>{{name}}</h3>
  <!-- <audio autoplay></audio> -->
  <audio src="{{url}}" controls></audio>
  <br>
  <button id="play">play</button>
  <button id="pause">pause</button>
  `,
  init() {
    this.dom = document.querySelector(this.el);
  },
  render (data) {
    let html = this.template;
    for (const key in data) {
      html = html.replace(`{{${key}}}`, data[key]);
    }
    this.dom.innerHTML = html;
    this.audioDom = this.dom.querySelector('audio');
  },
  play () {
    this.audioDom = this.audioDom || this.dom.querySelector('audio');
    this.audioDom.play();
  },
  pause () {
    this.audioDom = this.audioDom || this.dom.querySelector('audio');
    this.audioDom.pause();
  },

}

let model = {
  init () {
    this.data = { id: '', name: '', singer: '', url: '' };
    this.songQuery = new AV.Query('Song');
  },
  get (id) {
    return this.songQuery.get(id)
      .then(song => {
        let data = { ...song.attributes};
        data.id = id;
        return this.data = data;
      })
  },
  setData (data) {
    this.data = data;
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.model.init();
    this.initSong(() => {
      this.bindEvents();
    });
  },
  bindEvents() {
    this.view.dom.querySelector('#play').addEventListener('click', e => { this.view.play(); });
    this.view.dom.querySelector('#pause').addEventListener('click', e => { this.view.pause(); });
  },
  initSong (callback) {
    let songId = this.getSongId();
    this.model.get(songId)
    .then(song => {
      this.view.render(song);
      callback && callback();
    })
  },
  getSongId () {
    let search = window.location.search.indexOf('?') === -1 ? undefined : window.location.search.substring(1);
    let param = search.split('&').filter(v => v); // filter会忽略falsy 值得返回
    for (let i = 0; i < param.length; i++) {
      let kv = param[i].split('=');
      if (kv[0] === 'id') {
        return kv[1];
      }
    }
    return undefined;
  }
}

controller.init(view, model);

