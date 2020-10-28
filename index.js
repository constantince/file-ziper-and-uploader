"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileZiperAndUploader = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var request_1 = __importDefault(require("request"));
var webpack_sources_1 = require("webpack-sources");
var jszip_1 = __importDefault(require("jszip"));
var rimraf_1 = __importDefault(require("rimraf"));
var find_1 = __importDefault(require("find"));
var FileZiperAndUploader = /** @class */ (function () {
    function FileZiperAndUploader(options) {
        this.createFolder = function (compilation, opt, totalZipName) {
            //添加下一个压缩任务文档
            var zip = new jszip_1.default();
            var folder = zip.folder('');
            for (var filename in compilation.assets) {
                //多任务压缩包不能互相包含
                if (opt.target.test(filename) && totalZipName.indexOf(filename) === -1) {
                    var source = compilation.assets[filename].source();
                    if (folder)
                        folder.file(filename, source);
                }
            }
            //开始压缩任务
            return new Promise(function (resolve, reject) {
                zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
                    var outputpath = path_1.default.join(compilation.options.output.path, opt.zipName);
                    //相对路径转换
                    var relativePath = path_1.default.relative(compilation.options.output.path, outputpath);
                    //资源写入
                    compilation.assets[relativePath] = new webpack_sources_1.RawSource(content);
                    //抛出结束任务
                    resolve('done');
                });
            });
        };
        // 默认参数值
        var defaultValue = {
            url: 'http://localhost:8080/upload',
            zipName: 'source-map.zip',
            target: /\.map$/
        };
        //处理不同的参数传入值类型
        if (Array.isArray(options)) {
            this.task = options.map(function (item) { return (__assign(__assign({}, defaultValue), item)); });
        }
        else {
            this.task = [__assign(__assign({}, defaultValue), options)];
        }
        //全部和非全部需要区分：有些文件并非通过编译生成 not all files generated by webpack.
        this.compilerList = this.task.filter(function (v) { return v.target !== 'all'; });
        this.allList = this.task.filter(function (v) { return v.target === 'all'; });
    }
    FileZiperAndUploader.prototype.apply = function (compiler) {
        var _this = this;
        var emitAsync = function (compilation, callback) { return __awaiter(_this, void 0, void 0, function () {
            var totalZipName, compilerList, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        totalZipName = this.task.map(function (v) { return v.zipName; });
                        compilerList = this.compilerList;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < compilerList.length)) return [3 /*break*/, 4];
                        if (!(compilerList[i].target !== 'all')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createFolder(compilation, compilerList[i], totalZipName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        callback();
                        return [2 /*return*/];
                }
            });
        }); };
        //异步资源生成钩子
        compiler.hooks.emit.tapAsync('FileZiperAndUploader', emitAsync);
        var afterEmit = function (compilation, callback) { return __awaiter(_this, void 0, void 0, function () {
            var allFetch, i, zPath;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allFetch = [];
                        //先行压缩all列表
                        return [4 /*yield*/, this.zipEntireFolder(compilation, this.allList)];
                    case 1:
                        //先行压缩all列表
                        _a.sent();
                        //添加任务队列
                        for (i = 0; i < this.task.length; i++) {
                            zPath = path_1.default.join(compilation.options.output.path, this.task[i].zipName);
                            allFetch.push(this.send(zPath, this.task[i]));
                        }
                        // //开始多任务处理请求
                        Promise.all(allFetch).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            var _loop_1, i;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _loop_1 = function (i) {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: 
                                                    //请求成功后删除zip包
                                                    return [4 /*yield*/, new Promise(function (resolve) {
                                                            rimraf_1.default(res[i], function () {
                                                                resolve('done');
                                                                console.log('zip file sent and removed');
                                                            });
                                                        })];
                                                    case 1:
                                                        //请求成功后删除zip包
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        i = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!(i < res.length)) return [3 /*break*/, 4];
                                        return [5 /*yield**/, _loop_1(i)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        callback();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); };
        //异步：资源生成后的钩子
        compiler.hooks.afterEmit.tapAsync('FileZiperAndUploader', afterEmit);
    };
    //压缩整个打包文件 all时调用
    FileZiperAndUploader.prototype.zipEntireFolder = function (compilation, opt) {
        var zip = new jszip_1.default();
        return new Promise(function (reslove) {
            var currPath = compilation.options.output.path; //文件的绝对路径 当前当前js所在的绝对路径
            find_1.default.file(currPath, function (file) {
                file.forEach(function (_fileName) {
                    var _fn = path_1.default.relative(currPath, _fileName).replace(/\\/g, '/');
                    if (!/\.zip/.test(_fn))
                        zip.file(_fn, fs_1.default.readFileSync(_fileName)); //压缩目录添加文件
                });
                zip.generateAsync({
                    type: "nodebuffer",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 9
                    }
                }).then(function (content) {
                    if (Array.isArray(opt)) {
                        opt.forEach(function (v) {
                            fs_1.default.writeFileSync(currPath + "/" + v.zipName, content, "utf-8"); //将打包的内容写入 当前目录下的 result.zip中
                        });
                    }
                    reslove('done');
                });
            });
        });
    };
    FileZiperAndUploader.prototype.send = function (zipPath, opt) {
        //发送压缩后的资源包到指定的服务器
        return new Promise(function (reslove) {
            request_1.default.post(opt.url, {
                formData: {
                    token: opt.token,
                    description: 'Sent on ' + new Date(),
                    is_public: 1,
                    sqlfiles: fs_1.default.createReadStream(zipPath)
                },
                json: true,
            }, function (err) {
                if (err) {
                    reslove('err:' + err);
                }
                else {
                    reslove(zipPath);
                }
            });
        });
    };
    return FileZiperAndUploader;
}());
exports.FileZiperAndUploader = FileZiperAndUploader;
