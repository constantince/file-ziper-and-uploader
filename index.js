const fs = require('fs');
const path = require('path');
const request = require('request');
const RawSource = require('webpack-sources').RawSource;
const jsZip = require('jszip');
const remove = require('rimraf');
const zip = new jsZip();

class FileZiperAndUploader {
    constructor(options = []) {
      // 默认参数值
      const defaultValue = {
        url: 'http://localhost:8080/upload',
        zipName: 'source-map.zip',
        target: /\.map$/
      }
      //处理不同的参数传入值类型
      if(Array.isArray(options)) {
          this.task = options.map(item => ({...defaultValue, ...item}))
      } else {
          this.task = [{...defaultValue, ...options}];
      }
    }

    createFolder = (compilation, opt, prev) => {
        // 在压缩任务中移除前一个任务文档
        if(prev) zip.remove(prev.folderName);
        //添加下一个压缩任务文档
        const folder = zip.folder(opt.folderName)
        for( let filename in compilation.assets ) {
            if( opt.target === 'all' || opt.target.test(filename) ) {
                const source = compilation.assets[filename].source();
                folder.file(filename, source);
            }
        }

        //开始压缩任务
        return new Promise((resolve, reject) => {
            zip.generateAsync({type:"nodebuffer"}).then(content => {
                const outputpath = path.join(compilation.options.output.path, opt.zipName);
                //相对路径转换
                const relativePath = path.relative(
                    compilation.options.output.path,
                    outputpath
                );
                //资源写入
                compilation.assets[relativePath] = new RawSource(content);
                //抛出结束任务
                resolve('done');
            });
        })
    }

    apply(compiler) {

        //异步资源生成钩子
        compiler.hooks.emit.tapAsync('FileZiperAndUploader', async (compilation, callback) => {
            for(let i=0; i<this.task.length; i++) {
                await this.createFolder(compilation, this.task[i], this.task[i - 1]);
            }

            callback();
        });


        //异步：资源生成后的钩子
        compiler.hooks.afterEmit.tapAsync('FileZiperAndUploader', (compilation, callback) => {
            let allFetch = [];
            //添加任务队列
            for(let i=0; i<this.task.length; i++) {
                const zPath = path.join(compilation.options.output.path, this.task[i].zipName);
                allFetch.push(this.send(zPath, this.task[i]));
            }

            //开始多任务处理请求
            Promise.all(allFetch).then(async res => {
                for(let i=0; i<res.length; i++) {
                   //请求成功后删除zip包
                   const result = await new Promise((resolve) => {
                        remove(res[i], () => {
                            resolve('done');
                            console.log('zip file sent and removed');
                        });
                    })
                }
                callback();
            });
        })
    }

    send(zipPath, opt) {
        //发送压缩后的资源包到指定的服务器
        return new Promise((reslove, reject) => {
            request.post(opt.url, {
                formData: {
                    token: opt.token,
                    description: 'Sent on ' + new Date(),
                    is_public: 1,
                    sqlfiles: fs.createReadStream(zipPath)
                },
                json: true,
            }, function(err, res, body) {
                if(err) {
                    reslove('err:', err); 
                } else {
                    reslove(zipPath); 
                }
            })
        })
    }
}

module.exports = FileZiperAndUploader;