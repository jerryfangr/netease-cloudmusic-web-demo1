import './player.less'
import '../asserts/ali-svg';
import { AV } from "../vendor/av";
// import eventHub from '../vendor/event-hub';
import imageNeedle from '../asserts/needle.png';
import imageDisc from '../asserts/disc.png';
import imageDiscLight from '../asserts/disc_light.png';


let view = {
  el: '#app',
  init() {
    this.dom = document.querySelector(this.el);
  },
  render (data) {
    let { name = '', singer = '', cover = '#', url = '#' } = data;
    this.dom.querySelector('#blurBg').style = `background-image: url(${cover});`;
    this.dom.querySelector('img.pointer').src = imageNeedle;
    this.dom.querySelector('img.ring').src = imageDisc;
    this.dom.querySelector('img.light').src = imageDiscLight;
    this.dom.querySelector('img.cover').src = cover;
    this.dom.querySelector('.song-description>h1').textContent = name + '-' + singer;
    this.audioDom = this.audioDom || this.createAudio(url);
    this.discContainerDom = this.dom.querySelector('#discContainer');
  },
  createAudio (url) {
    let audio = document.createElement('audio');
    audio.src = url;
    document.body.appendChild(audio);
    return audio;
  },
  play () {
    this.audioDom = this.audioDom || this.dom.querySelector('audio');
    this.audioDom.play();
    this.discContainerDom.classList.add('playing');
  },
  pause () {
    this.audioDom = this.audioDom || this.dom.querySelector('audio');
    this.audioDom.pause();
    this.discContainerDom.classList.remove('playing');
  },
}

let model = {
  init () {
    this.data = { 
      song: {
        id:'', name: '', singer: '', url: '', cover: ''
      },
      status: 'paused'
    };
    this.songQuery = new AV.Query('Song');
  },
  get (id) {
    return this.songQuery.get(id)
      .then(song => {
        let data = { ...song.attributes};
        data.id = id;
        return this.data.song = data;
      })
  },
  setData (data) {
    this.data.song = data;
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.model.init();
    this.initSongToView(() => {
      this.bindEvents();
    });
  },
  bindEvents() {
    this.view.dom.querySelector('.icon-wrapper').addEventListener('click', e => { 
      this.toggleMusic();
    });
  },
  initSongToView (callback) {
    let songId = this.getSongId();
    this.model.get(songId)
    .then(song => {
      this.view.render(song);
      callback && callback();
    })
  },
  toggleMusic () {
    if (this.model.data.status === 'paused') {
      this.view.play();
      this.model.data.status = 'playing';
    } else {
      this.view.pause();
      this.model.data.status = 'paused';
    }
  },
  getSongId () {
    let search = window.location.search.indexOf('?') === -1 ? undefined : window.location.search.substring(1);
    let param = search.split('&').filter(v => v); // filter会忽略falsy值的返回
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

