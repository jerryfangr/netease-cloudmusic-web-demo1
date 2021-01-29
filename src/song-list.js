import eventHub from './event-hub';
import { AV } from "./av";

let view = {
  el: '.page > aside > #songsContainer',
  dom: null,
  template: `
    <ul class="song-list"></ul>
  `,
  init() {
    this.dom = document.querySelector(this.el);
  },
  findAll(selector) {
    return this.dom.querySelectorAll(selector);
  },
  render(data) {
    if (data === undefined || data.songs.length === 0) {
      return this.dom.innerHTML = this.template;
    }
    
    this.songContainerDom = this.songContainerDom || this.dom.querySelector('.song-list');
    let html = ''
    data.songs && data.songs.forEach(song => {
      html += '<li data-id="' + song.id + '">' + song.name +'</li>';
    });
    this.songContainerDom.innerHTML = html;
  },
  activeItem (liDom) {
    this.deActive();
    liDom.classList.add('active')
  },
  deActive () {
    let activeDoms = this.findAll('.active');
    if (activeDoms.length > 0) {
      activeDoms.forEach(activeDom => {
        activeDom.classList.remove('active');
      })
    }
  }
}
view.init();

let model = {
  data: {
    songs: []
  },
  find () {
    var query = new AV.Query('Song');
    return query.find()
      .then(songs => {
        this.data.songs = songs.map((song => {
          let newSong = { ...song.attributes}
          newSong.id = song.id;
          return newSong;
        }))
        return this.data.songs;
      });
  },
  findBy (key, value) {
    let songs = this.data.songs;
    for (let i = 0; i < songs.length; i++) {
      if (songs[i][key] === value) {
        return songs[i];
      }
    }
  },
  findById (id) {
    return this.findBy('id', id);
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.preSelectDom = null;
    this.view.render(this.model.data);
    this.fetchSongs();
    this.bindEvents();
    this.bindEventHub();
  },
  fetchSongs () {
    this.model.find()
      .then(() => {
        this.view.render(this.model.data)
      })
  },
  bindEvents () {
    this.view.dom.addEventListener('click', e => {
      if (e.target.tagName === "LI" && this.preSelectDom !== e.target) {
        this.preSelectDom = e.target;
        this.view.activeItem(e.target);
        // let id = e.target.getAttribute('data-id');
        let song = this.model.findById(e.target.dataset.id);
        eventHub.emit('select', this.copy(song));
      }
    });
  },
  bindEventHub () {
    eventHub.on('upload', data => {
      this.view.deActive()
    })
    eventHub.on('create', data => {
      // 这里如果data是对象，且不能保证传过来的是新的，就要创建新对象
      this.model.data.songs.push(data);
      this.view.render(this.model.data)
    })
    eventHub.on("new", (data) => {
      this.view.deActive();
      this.preSelectDom = null;
    });
  },
  copy (obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;