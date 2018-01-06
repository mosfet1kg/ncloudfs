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
          console.log('readdir(%s)', path);

          ncloudFs.getAllFileList({ container: 'helloworld1', key: path }, (error, fileList) => {
            if ( error ) {
              console.log( error );
              return cb(fuse.ENOENT);
            }

            if ( fileList.length > 0 ) {
              console.log( fileList );
              cb(0, fileList);
            } else {
              console.log('d');
              cb(0)
            }
          });
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
            return cb(0, metaData);
          });

        },
        open: function (path, flags, cb) {
          const toFlag = function(flags) {
            flags = flags & 3;
            if (flags === 0) return 'r';
            if (flags === 1) return 'w';
            return 'r+'
          };

          console.log('open(%s, %d)', path, flags);
          console.log(toFlag(flags));
          // cb(0, 42);
          //join('/Users/gbchoi/Documents/workspace/myfuse/testfolder', path)
          fs.open( join('/Users/gbchoi/Documents/workspace/myfuse/testfolder', path), 'w+', (err, fd)=>{
            if ( err ) {
              return console.log( err );
            }
            console.log( 'fd: ', fd );
            cb(0, fd);
          });
        },
        read: function (path, fd, buf, len, pos, cb) {
          console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
          // let str = 'hello world\n'.slice(pos, pos + len)
          // if (!str) return cb(0);
          // buf.write(str);
          // return cb(str.length)

          ncloudFs.readFile({ container:'helloworld1', key: path, pos, len}, (error, response) => {
            if ( error ) {
              console.log( error );
              cb(0);
              return;
            }

            const { data, length } = response;
            console.log( data );
            buf.write( data );
            cb(length);
          })

        },
        write(path, fd, buffer, length, position, cb) {
          console.log( path, fd);
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
          console.log('filesystem at ' + mountPath + ' unmounted')
        }
      });
    }
  }
};
