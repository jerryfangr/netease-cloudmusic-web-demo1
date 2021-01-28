import AV from 'leancloud-storage'
import config from './config'

AV.init({ // your leancloud key
  appId: config.AV.appId,
  appKey: config.AV.appKey,
  serverURL: config.AV.serverURL,
});

export { AV };