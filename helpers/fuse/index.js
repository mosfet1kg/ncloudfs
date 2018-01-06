const fuse = require('fuse-bindings');
const ncloudFs = require('../ncloudApi');
const permission = require('./permission');
const fs = require('fs');
const join = require('path').join;

module.exports = ({ mountPath }) => {
  return {
    mount: ()=>{
      fuse.mount(mountPath, {
        readdir: function (path, cb) {
          console.log('readdir(%s)', path)
          if (path === '/') return cb(0, ['helloworld.txt']);
          cb(0)
        },
        getattr: function (path, cb) {
          console.log('getattr(%s)', path);

          ncloudFs.getFileAttr({ container: 'helloworld1', key: path }, (error, response) => {
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
            console.log( metaData );
            cb(0, metaData);
          });
        },
        open: function (path, flags, cb) {
          console.log('open(%s, %d)', path, flags)
          cb(0, 42) // 42 is an fd
        },
        read: function (path, fd, buf, len, pos, cb) {
          console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
          ncloudFs.readFile({ container:'helloworld1', key: path, pos, len}, (error, response) => {
            if ( error ) {
              console.log( error );
              return cb(0);
            }

            const { data, length } = response;

            if ( length === 0 ) {
              return cb(0);
            }

            buf.write(data);
            return cb( parseInt(length) );
          });
        },
        // write(path, fd, buffer, length, position, cb) {
        //   console.log( path, fd);
        // },
        // release: function (path, fd, cb) {
        //   console.log( 'release:', path, 'fd:', fd );
        //   cb(0);
        //   // fs.close( fd, (err, res) => {
        //   //   if ( err ) {
        //   //     console.log( err );
        //   //     return cb(0);
        //   //   }
        //   //
        //   //   cb(0);
        //   // })
        // }
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
          console.log('filesystem at ' + mountPath + ' unmounted')
        }
      });
    }
  }
};
