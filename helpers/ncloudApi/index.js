const ncloud = require('ncloud');
const _ = require('lodash');
const uuid = require('uuid');
const assert = require('assert');
const EventEmitter = require('events');

let client = null;

module.exports = (function() {
  return {
    connect: ({oauth_consumer_key, oauth_consumer_secret}) => {
      client = ncloud.createClient({ oauth_consumer_key, oauth_consumer_secret });
    },
    getAllFileList: ({ container, key }, callback)=>{
      getAllFileInfo({ container, key }, (error, contents) => {
        if ( error ) {
          return callback( error );
        }

        const fileList = contents.map( el=> {
          return el.name;
        });

        callback( null, fileList );
      });
    },
    getFileAttr: ({ container, key }, callback) => {
      client.storage.findMetaData({ container, key }, (error, response) => {
        if ( error ) {
          return callback( error );
        }

        callback( null, response['resource-meta-info']);
      })
    },
    readFile: ({ container, key, pos, len }, callback) => {
      client.storage.downloadPartialFile({ container, key, pos, len }, (error, response) => {
        if ( error ) {
          return callback( error );
        }

        callback( null, response );
      })
    }
  }
})();

function getAllFileInfo ({container, key}, callback) {
  const eventEmitter = new EventEmitter();
  const eventName = `fileStorageScanner_${uuid.v4()}`;
  let output = [];
  let params = {
    container,
    key,
  };

  const listener = ()=>{
    useScanner();
  };

  const errorHandling = (error) => {
    console.log( error );
    eventEmitter.removeListener(eventName, listener);
    callback( error );
  };

  eventEmitter.on(eventName, listener);

  const useScanner = ()=>{
    client.storage.findFiles( params, (error, response) => {
      try {
        assert.ifError(error);

        const { Contents: contents, NextMarker: nextMarker } = response;
        output = [ ...output, ...contents ];

        if ( !_.isNull( nextMarker ) ) {
          params = {
            ...params, listMarker: nextMarker
          };
          eventEmitter.emit(eventName);
        } else {
          // detach eventEmitter
          eventEmitter.removeListener(eventName, listener);

          output = output.filter(el=>{
            // status 상태가 일반 상태(2)인 것만 필터링
            return el['resource-status'].toString() === '2';
          }).filter(el=>{
            return el['resource-type'].toString() !== '5';
          });

          callback( null, output );
        } // end if
      } catch(e){
        errorHandling(e);
      }
    });

  }; // end function userScanner();

  eventEmitter.emit(eventName);
} // end function getAllFileList
