"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

require("spark-md5");

var _libjv = require("./libjv");

var _libjv2 = _interopRequireDefault(_libjv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_libjv2.default.getFileMd5 = function (file) {
    return new Promise(function (resole, reject) {

        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            chunkSize = 2097152,
            // read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0;
        var spark = new SparkMD5.ArrayBuffer();
        var frOnload = function frOnload(e) {
            spark.append(e.target.result); // append array buffer
            currentChunk++;
            if (currentChunk < chunks) loadNext();else {
                var d = "";
                resole(spark.end());
            }
        },
            frOnerror = function frOnerror() {
            reject(false);
        };

        function loadNext() {
            var fileReader = new FileReader();
            fileReader.onload = frOnload;
            fileReader.onerror = frOnerror;
            var start = currentChunk * chunkSize,
                end = start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };

        loadNext();
    });
};

_libjv2.default.dataURLtoBlob = function (dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return { data: u8arr, type: mime };
};

_libjv2.default.toByteUnit = function (value) {
    if (!value) return 0;
    value = value.toString().toUpperCase();

    var unit = value.slice(-1),
        unitCode = unit.charCodeAt();

    if (unitCode.Between(48, 57)) {
        return parseInt(value);
    }

    if (unit == "B") {
        value = value.slice(0, -1);
        unit = value.slice(-1);
    }

    value = parseFloat(value.slice(0, -1));

    if ("TGMK".indexOf(unit) < 0) {
        return 0;
    }

    var j = 0;
    if (unit == "K") {
        j = 10;
    }
    if (unit == "M") {
        j = 20;
    }
    if (unit == "G") {
        j = 30;
    }
    if (unit == "T") {
        j = 40;
    }

    return parseInt(value * Math.pow(2, j));
};

_libjv2.default.compressImage = function (op) {
    var imgDataBase64 = op.imageData,
        maxWidth = op.maxWidth,
        fileName = op.fileName || "",
        filter = op.filter || function () {
        return true;
    },
        //是否压缩的回调
    quality = op.quality || 0.8;

    var getImageContextTypeByExtName = function getImageContextTypeByExtName(fileNameExt) {
        return 'image/' + ((fileNameExt.match(/png|jpeg|bmp|gif/ig) || [])[0] || "jpeg");
    };

    return new Promise(function (resolve, reject) {
        // if (fileType != "img") {
        //   resolve(imgDataBase64);
        //   return;
        // }

        var image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function () {
            if (!image.naturalWidth) {
                reject("未能加载图片：" + fileName);
                return;
            }
            // jv.debug();
            if (filter(image) === false) {
                resolve(imgDataBase64);
                return;
            }

            //5.1 分支流程:如果图片宽度大于设置的最大宽度，则进行压缩，Md5,上传
            if (image.naturalWidth > maxWidth) {
                var canvas = document.createElement("canvas"),
                    ctx = canvas.getContext('2d'),
                    srcWidth = image.naturalWidth,
                    srcHeight = image.naturalHeight;

                canvas.width = Math.min(maxWidth, srcWidth);
                canvas.height = srcHeight * canvas.width / srcWidth;

                ctx.drawImage(image, 0, 0, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);

                //6.检查Md5,上传
                var ext = fileName.split('.').slice(1).last() || "png";
                resolve(canvas.toDataURL(getImageContextTypeByExtName(ext), quality));
                image = null;
                return;
            }
            //5.2 分支流程：如果是小图，则进行Md5,再上传
            else {
                    resolve(imgDataBase64);
                    return;
                }
        };
        image.src = imgDataBase64;
    });
};

/**
 * option:
 * imageBase64:
 * imageLocalPath: 如果 image_base64 为空，取这个。
 * postParam: 上传时额外带的数据
 * fileName:
 * processCallback:
 * axios:
 * maxWidth: 压缩使用。
 *
 */
_libjv2.default.doUploadFile = function (option) {
    option = option || {};
    var imgBase64 = option.imageBase64,
        fileName = option.fileName || "",
        process_callback = option.processCallback || function () {},
        post_param = option.postParam || {},
        axios = option.axios,
        maxWidth = option.maxWidth;

    // if (imgData.data.length > this.maxSize) {
    //     // this.percentage = 0;
    //     // jv.error("文件太大，超出许可范围！");
    //     return Promise.reject("文件太大，超出许可范围！")
    // }


    var ajaxPost = function ajaxPost(processedFile) {
        var file = processedFile;

        var formData = new FormData();
        formData.append(file.name.split("/").last(), file);
        for (var key in post_param) {
            formData.append(key, post_param[key]);
        }

        return axios.post(window.Server_Host + "/sys/upload", formData, {
            onUploadProgress: function onUploadProgress(e) {
                if (e.total > 0) {
                    e.percent = parseInt(e.loaded / e.total * 90);
                }
                process_callback(e.percent + 10);
            }
        }).then(function (res) {
            return Promise.resolve(res.data.data);
        });
    };

    //真正上传从 10% 开始。
    var doWork = function doWork(imgBase64) {
        var imgData = _libjv2.default.dataURLtoBlob(imgBase64),
            file = new Blob([imgData.data], { type: imgData.type });
        file.name = fileName;

        return _libjv2.default.getFileMd5(file).then(function (md5) {
            process_callback(5);

            var param = Object.assign({ md5: md5 }, post_param);

            // if (this.proxy && this.proxyCorpId) {
            //   param["_corp_id_"] = this.proxyCorpId
            // }

            //8.检查服务器文件的 Md5值。
            return axios.post("/sys/check_upload", param).then(function (res) {
                process_callback(10);
                //8.1 如果服务器存在该文件，返回
                if (res.data && res.data.id) {
                    process_callback(100);
                    return Promise.resolve(res.data);
                } else {
                    return ajaxPost(file);
                }
            });
        });
    };

    if (maxWidth) {
        return _libjv2.default.compressImage({
            imageData: imgBase64,
            fileName: fileName,
            maxWidth: maxWidth,
            filter: function filter(image) {
                //如果图片 <= 256 ,则不处理.
                if (image.naturalWidth <= maxWidth) {
                    return false;
                }
            }
        }).then(function (imageData) {
            return doWork(imageData);
        });
    }

    return doWork(imgBase64);
};

exports.default = _libjv2.default;