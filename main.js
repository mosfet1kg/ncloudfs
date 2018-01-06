require('dotenv').config();
const ncloudFs = require('./helpers/ncloudApi');
ncloudFs.connect({
  oauth_consumer_key: process.env.CONSUMER_KEY,
  oauth_consumer_secret: process.env.CONSUMER_SECRET
});

// const mountPath = path.join('./mnt'); //process.platform !== 'win32' ? path.join('./mnt') : 'M:\\';

const path = require('path');
const fuse = require('./helpers/fuse')({ mountPath: path.join('./mnt') });
fuse.mount();

process.on('SIGINT', function () {
  fuse.unmount();
});
