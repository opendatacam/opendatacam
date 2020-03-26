//requiring path and fs modules
const path = require('path');
const fs = require('fs');

const config = require('../../config.json');

class FileSystemManager {
    constructor () {
      this.filesPath = config.PATH_TO_YOLO_DARKNET;
      // this.filesPath = path.join(config.PATH_TO_YOLO_DARKNET, 'opendatacam_videos');
    }

    getFilesDirectoryPath() {
      return this.filesPath;
    }
  
    getFiles () {
      return new Promise((resolve, reject) => {
        fs.readdir(this.filesPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject(err);
            } 

            resolve(files)
        });
      })
    }
  }
  
  var FileSystemManagerInstance = new FileSystemManager()
  
  module.exports = FileSystemManagerInstance