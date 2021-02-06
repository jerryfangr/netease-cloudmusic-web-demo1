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
    let { name = '', singer = '', cover = '#', url = '#', lyric='' } = data;    
    this.dom.querySelector('#blurBg').style = `background-image: url(${cover});`;
    this.dom.querySelector('img.pointer').src = imageNeedle;
    this.dom.querySelector('img.ring').src = imageDisc;
    this.dom.querySelector('img.light').src = imageDiscLight;
    this.dom.querySelector('img.cover').src = cover;
    this.dom.querySelector('.song-description>h1').textContent = name + '-' + singer;
    let regex = /\[([\d :：.  ]+)\](.+)/i;
    let lyricPDoms = lyric.split('\n').map(content => {
      let p = document.createElement('p');
      let matches = content.match(regex);
      if (matches) {
        let timeParts = matches[1].split(/[:：]{1}/);
        let secondsFormat = (timeParts[0] - 0)*60 + (timeParts[1]-0);
        p.setAttribute('data-time', secondsFormat);
        p.textContent = matches[2];
      } else {
        p.textContent = content;
      }
      return p;
    });
    this.lyricDom = this.lyricDom || this.dom.querySelector('.lyric>.lines');
    lyricPDoms.forEach(p => {
      this.lyricDom.appendChild(p);
    })
    this.audioDom = this.audioDom || this.createAudio(url);
    this.discContainerDom = this.dom.querySelector('#discContainer');
  },
  createAudio (url) {
    let audio = document.createElement('audio');
    audio.src = url;
    // audio.setAttribute('controls', 'controls')
    document.body.appendChild(audio);
    return audio;
  },
  showLyricBy (time) {
    this.lyricPDoms = this.lyricPDoms || this.dom.querySelectorAll('.lyric>.lines>p');
    for (let i = 0; i < this.lyricPDoms.length; i++) {
      const currentP = this.lyricPDoms[i];
      const nextP = this.lyricPDoms[i + 1] || { hasError: true, dataset: { time: 24*60*60}};
      let dataTime = currentP.dataset.time - 0;
      let nextTime = nextP.dataset.time - 0;
      if (nextP.hasError || dataTime <= time && time < nextTime) {
        if (this.activeLyricP === currentP) { return; }
        this.preLyricP = nextP.hasError ? currentP : this.lyricPDoms[i - 1] || currentP; 
        this.activeLyricP = currentP;
        break;
      }
      this.preLyricP && this.preLyricP.classList.remove('active');
      this.activeLyricP.classList.add('active');
      let moveY = this.preLyricP.offsetTop - this.lyricDom.offsetTop;
      this.lyricDom.style.transform = 'translateY(' + (-moveY) + 'px)';
    }
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
        id:'', name: '', singer: '', url: '', cover: '', lyric: ''
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
    this.view.audioDom.addEventListener('ended', e => {
      this.view.pause();
      this.model.data.status = 'paused';
    });
    this.view.audioDom.addEventListener('timeupdate', e => {
      let currentTime = e.currentTarget.currentTime;
      this.view.showLyricBy(currentTime);
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

