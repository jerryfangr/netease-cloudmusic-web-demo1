import AV from 'leancloud-storage'
import config from './config'

console.log(config);
AV.init({ // your leancloud key
  appId: config.AV.appId,
  appKey: config.AV.appKey, 
  serverURL: config.AV.serverURL,
});
// const SongObject = AV.Object.extend('Playlist');
// const song = new SongObject();
// song.set('name', 'test');
// song.set('cover', 'test');
// song.set('creatorId', 'test');
// song.set('description', 'test');
// song.set('songs', ['s-1', 's-2']);
// song.save().then((song) => {
//   console.log('保存成功。')
// })

