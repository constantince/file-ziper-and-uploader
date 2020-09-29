const fs = require('fs');
const path = require('path');
const request = require('request');
const RawSource = require('webpack-sources').RawSource;
const jsZip = require('jszip');
const remove = require('rimraf');
const zip = new jsZip();

class FileZiperAndUploader {
    constructor(options) {
      options = options || {}
      this.options = {
        zipName: options.zipName || 'source-map.zip',
        token: options.token || '',
        url: options.url || 'http://localhost:8080/upload',
        js: 'http://www.baidu.com',
        target: options.target || /\.map$/,
        folderName: options.folderName
      };
    }

    apply(compiler) {

        compiler.hooks.emit.tapAsync('FileZiperAndUploader', (compilation, callback) => {
            const folder = zip.folder(this.options.folderName)
            for( let filename in compilation.assets ) {
                if(this.options.target.test(filename)) {
                    const source = compilation.assets[filename].source();
                    folder.file(filename, source);
                }
            }
            zip.generateAsync({type:"nodebuffer"}).then(content => {
                const outputpath = path.join(compilation.options.output.path, this.options.zipName);
                const relativePath = path.relative(
                    compilation.options.output.path,
                    outputpath
                );
                compilation.assets[relativePath] =  new RawSource(content);
                
                callback();
            });
        });


        compiler.hooks.afterEmit.tapAsync('FileZiperAndUploader', (compilation, callback) => {
            const zPath = path.join(compilation.options.output.path, this.options.zipName);
            this.send(zPath, callback);
        })
    }

    send(zipPath, callback) {
        request.post(this.options.url, {
            formData: {
                token: this.options.token,
                description: 'Sent on ' + new Date(),
                is_public: 1,
                sqlfiles: fs.createReadStream(zipPath)
            },
            json: true,
        }, function(err, res, body) {
            remove(zipPath, () => {
                if(err) {
                    console.log('err', err);
                } else {
                    console.log('return message:' + body);
                }
                callback();
            });
        })
    }
}

module.exports = FileZiperAndUploader;