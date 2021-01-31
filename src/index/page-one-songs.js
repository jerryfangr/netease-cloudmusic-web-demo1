import { AV } from "../vendor/av";

let view = {
  el: '.page-1 > section.songs',
  template: `
  <li>
  <h3>{{name}}</h3>
    <p>
      <svg class="icon icon-sq">
        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-sq"></use>
      </svg>
      {{singer}}
    </p>
    <a class="playButton" href="{{url}}">
      <svg class="icon icon-play">
        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-play"></use
      </svg>
    </a>
  </li>
  `,
  init() {
    this.dom = document.querySelector(this.el);
    this.songListDom = this.dom.querySelector('ol#songs');
  },
  render (data) {
    let {songs} = data;
    songs.forEach(song => {
      let html = this.template;
      for (const key in song) {
        html = html.replace(`{{${key}}}`, song[key]);
      }
      this.songListDom.insertAdjacentHTML('beforeend', html)
    });
  }
}

let model = {
  data: {
    songs: []
  },
  find() {
    var query = new AV.Query('Song');
    return query.find()
      .then(songs => {
        this.data.songs = songs.map((song => {
          let newSong = { ...song.attributes }
          newSong.id = song.id;
          return newSong;
        }))
        return this.data.songs;
      });
  },
  findBy(key, value) {
    let songs = this.data.songs;
    for (let i = 0; i < songs.length; i++) {
      if (songs[i][key] === value) {
        return [songs[i], i];
      }
    }
  },
  findById(id) {
    return this.findBy('id', id)[0];
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    this.model.find()
      .then(() => {
        this.view.render(this.model.data)
      })
  },
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;