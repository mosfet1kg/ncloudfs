const fuse = require('fuse-bindings');
const ncloudFs = require('../ncloudApi');
const permission = require('./permission');
const fs = require('fs');
const rimraf = require('rimraf');
const join = require('path').join;
const dirname = require('path').dirname;

module.exports = ({ mountPath }) => {
  return {
    mount: ()=>{
      fuse.mount(mountPath, {
        readdir: function (path, cb) {
          console.log('readdir(%s)', path);

          ncloudFs.getAllFileList({ container: 'helloworld', key: path }, (error, fileList) => {
            if ( error ) {
              console.log( error );
              return cb(0);
            }

            if ( fileList.length > 0 ) {
              console.log( fileList );
              return cb(0, fileList);
            }

            cb(0);
          });
        },
        getattr: function (path, cb) {
          console.log('getattr(%s)', path);

          ncloudFs.getFileAttr({ container: 'helloworld', key: path }, (error, response) => {
            if ( error ) {
              return cb(fuse.ENOENT);
            }

            const { ['last-modified']: lastModified, ['resource-type']: resourceType, size} = response;
            const metaData = {
              mtime: new Date(parseInt( lastModified )),
              atime: new Date(parseInt( lastModified )),
              ctime: new Date(parseInt( lastModified )),
              nlink: 1,
              size: parseInt(size),
              mode: (resourceType.toString() === '1' || resourceType.toString() === '2') ? permission.FOLDER : permission.REG_FILE,
              uid: process.getuid ? process.getuid() : 0,
              gid: process.getgid ? process.getgid() : 0
            };

            cb(0, metaData);
          });
        },
        read: function (path, fd, buf, len, pos, cb) {
          console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
          ncloudFs.readFile({ container:'helloworld', key: path, pos, len}, (error, response) => {
            if ( error ) {
              console.log( error );
              return cb(0);
            }

            const { data, length } = response;

            if ( length === 0 ) {
              return cb(0);
            }

            data.copy( buf );

            return cb(  data.byteLength );
          });
        },
        open: function (path, flags, cb) {
          console.log('open(%s, %d)', path, flags);

          const absolutePath = join('/Users/gbchoi/Documents/workspace/myfuse/.mnt', path);
          const dir = dirname( absolutePath );

          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }

          const fd = fs.openSync( absolutePath, 'w+');

          cb(0, fd);
        },
        release: function (path, fd, cb) {
          console.log( 'release:', path, 'fd:', fd );
          // cb(0);
          fs.close( fd, (err, res) => {
            if ( err ) {
              console.log( err );
              return cb(0);
            }

            cb(0);
          })
        }
      }, (err) => {
        if (err) throw err;
        console.log('filesystem mounted on ' + mountPath)
      });

    },
    unmount: ()=>{
      fuse.unmount(mountPath, (err) => {
        if (err) {
          console.log('filesystem at ' + mountPath + ' not unmounted', err)
        } else {
          const dir = '/Users/gbchoi/Documents/workspace/myfuse/.mnt';

          rimraf(dir, () => {
            console.log('done');
          });

          console.log('filesystem at ' + mountPath + ' unmounted')
        }
      });
    }
  }
};
