import eventHub from '../vendor/event-hub';
import playlists from './page-one-playlists';
import songs from './page-one-songs';

let view = {
  el: '#page > ol > .page-1',
  init() {
    this.dom = document.querySelector(this.el);
  },
  show () {
    this.dom.classList.add('active');
  },
  hide () {
    this.dom.classList.remove('active');
  }
  
}

let model = {}

let controller = {
  init(view, model) {
    this.view = view;
    this.model = model;
    this.view.init();
    // this.bindEvents();
    this.bindEventHub();
    this.loadModules();

  },
  bindEvents() {},
  bindEventHub () {
    eventHub.on('index-selectTab', data => {
      if (data === 'page-1') {
        this.view.show();
      } else {
        this.view.hide();
      }
    });
  },
  loadModules () {
    playlists.defaultInit();
    songs.defaultInit();
  }
}

controller.defaultInit = function () {
  controller.init.call(controller, view, model);
}

export default controller;