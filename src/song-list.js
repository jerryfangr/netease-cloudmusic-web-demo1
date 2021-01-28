import eventHub from './event-hub';

let view = {
  el: '.page > aside > #songsContainer',
  dom: null,
  init() {
    this.dom = document.querySelector(this.el);
  },
  find(selector) {
    return this.dom.querySelector(selector);
  },
  template: `
    <ul class="song-list"></ul>
  `,
  render(data) {
    if (data === undefined || data.songs.length === 0) {
      return this.dom.innerHTML = this.template;
    }

    let songContainer = this.dom.querySelector('.song-list');
    let html = ""
    data.songs && data.songs.forEach(song => {
      html += "<li>" + song.name +"</li>";
    });
    songContainer.innerHTML = html;
  },
  deActive () {
    let activeDom = this.find('.active');
    activeDom && activeDom.classList.remove('active');
  }
}
view.init();

let model = {
  data: {
    songs: []
  }
}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.render(this.model.data);
    eventHub.on('upload', data => {
      this.view.deActive()
    })
    eventHub.on('create', data => {
      // 这里如果data是对象，且不能保证传过来的是新的，就要对data clone
      // 以防一直存同一个对象的引用，或者被对面改了数据
      this.model.data.songs.push(data);
      this.view.render(this.model.data)
    })
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;