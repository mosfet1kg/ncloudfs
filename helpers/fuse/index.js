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
          if (path === '/') return cb(0, ['helloworld.txt'])
          cb(0)
        },
        getattr: function (path, cb) {
          console.log('getattr(%s)', path)
          if (path === '/') {
            cb(0, {
              mtime: new Date(),
              atime: new Date(),
              ctime: new Date(),
              nlink: 1,
              size: 100,
              mode: 16877,
              uid: process.getuid ? process.getuid() : 0,
              gid: process.getgid ? process.getgid() : 0
            })
            return
          }

          if (path === '/helloworld.txt') {
            cb(0, {
              mtime: new Date(),
              atime: new Date(),
              ctime: new Date(),
              nlink: 1,
              size: 12,
              mode: 33188,
              uid: process.getuid ? process.getuid() : 0,
              gid: process.getgid ? process.getgid() : 0
            })
            return
          }

          cb(fuse.ENOENT)
        },
        open: function (path, flags, cb) {
          console.log('open(%s, %d)', path, flags)
          cb(0, 42) // 42 is an fd
        },
        read: function (path, fd, buf, len, pos, cb) {
          console.log('read(%s, %d, %d, %d)', path, fd, len, pos)
          var str = 'hello world\n'.slice(pos, pos + len)
          if (!str) return cb(0)
          buf.write(str)
          return cb(str.length)
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
