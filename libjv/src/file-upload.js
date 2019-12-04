import "spark-md5"
import jv from './libjv'

jv.getFileMd5 = (file) => {
    return new Promise((resole, reject) => {

        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            chunkSize = 2097152, // read in chunks of 2MB
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0;
        var spark = new SparkMD5.ArrayBuffer();


        var frOnload, frOnerror, loadNext;
        frOnload = (e) => {
            spark.append(e.target.result); // append array buffer
            currentChunk++;
            if (currentChunk < chunks)
                loadNext();
            else {
                var d = "";
                resole(spark.end());
            }
        };

        frOnerror = () => {
            reject(false);
        };

        loadNext = () => {
            var fileReader = new FileReader();
            fileReader.onload = frOnload;
            fileReader.onerror = frOnerror;
            var start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };


        loadNext();
    });
}

//base64的字符串内容 转为 file 对象
jv.base64Data2File = (base64Data, fileName) => {
    var arr = base64Data.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    //这里必须要用 [] 包一下。
    return new Blob([u8arr], {type: mime, name: fileName});
};

//file对象 转为 base64字符串内容,返回 Promise 对象。
jv.file2Base64Data = (file) => {
    return new Promise((r, e) => {
        var reader = new FileReader();
        reader.onload = () => {
            r(reader.result);
        };
        reader.readAsDataURL(file);
    });
};


jv.toByteUnit = (value) => {
    if (!value) return 0;
    value = value.toString().toUpperCase();

    var unit = value.slice(-1), unitCode = unit.charCodeAt();

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
}


jv.compressImage = (op) => {
    var imgDataBase64 = op.imageData,
        maxWidth = op.maxWidth,
        fileName = op.fileName || "",
        filter = op.filter || (() => true), //是否压缩的回调
        quality = op.quality || 0.8;


    var getImageContextTypeByExtName = (fileNameExt) => {
        return 'image/' + ((fileNameExt.match(/png|jpeg|bmp|gif/ig) || []) [0] || "jpeg");
    };

    return new Promise((resolve, reject) => {
        // if (fileType != "img") {
        //   resolve(imgDataBase64);
        //   return;
        // }

        var image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            if (!image.naturalWidth) {
                reject("未能加载图片：" + fileName)
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
        }
        image.src = imgDataBase64;
    });
};

jv.uploadFileAjaxPost = (file, axios, post_param, percentCallback) => {

    const formData = new FormData();
    formData.append(file.name.split("/").last(), file);
    for (var key in post_param) {
        formData.append(key, post_param[key]);
    }

    return axios.post(window.Server_Host + "/sys/upload", formData, {
        onUploadProgress: e => {
            if (e.total > 0) {
                e.percent = parseInt(e.loaded / e.total * 90);
            }
            percentCallback(e.percent + 10);
        }
    }, {
        // "Content-Type": "multipart/form-data",  //文件上传不用添加。
        timeout: 1200000
    }).then(res => {
        percentCallback(100);
        return res;
    })
};

/**
 * option:
 * imageBase64: 必传
 * file: 优先使用 file , 如果 file 为空，则使用 imgBase64
 * postParam: 上传时额外带的数据
 * fileName: 必传
 * processCallback:
 * axios: 必传, this.$http
 * maxWidth: 压缩使用。
 *
 */
jv.doUploadFile = option => {
    option = option || {};
    var imgBase64 = option.imageBase64,
        file = option.file,   // imgBase64 和 file ,优先使用 file , 如果 file 为空，则使用 imgBase64
        fileName = option.fileName || "file",
        process_callback = option.processCallback || (() => {
        }),
        post_param = option.postParam || {},
        axios = option.axios,
        maxWidth = option.maxWidth;

    if (!imgBase64 && !file) {
        return Promise.reject("找不到文件数据")
    }

    // if (imgData.data.length > this.maxSize) {
    //     // this.percentage = 0;
    //     // jv.error("文件太大，超出许可范围！");
    //     return Promise.reject("文件太大，超出许可范围！")
    // }

    //真正上传从 10% 开始。
    var doWork = file => {
        return jv.getFileMd5(file)
            .then(md5 => {
                process_callback(5);

                var param = Object.assign({md5: md5}, post_param);

                // if (this.proxy && this.proxyCorpId) {
                //   param["_corp_id_"] = this.proxyCorpId
                // }

                //8.检查服务器文件的 Md5值。
                return axios.post("/sys/check_upload", param)
                    .then(res => {
                        process_callback(10);
                        //8.1 如果服务器存在该文件，返回 data 属性，且 data 属性有 id
                        var data = res.data.data;
                        if (data && data.id) {
                            process_callback(100);
                            return res;
                        } else {
                            return jv.uploadFileAjaxPost(file, axios, post_param, process_callback)
                        }
                    });
            }).catch(err => {
                process_callback(0);
            });
    };


    process_callback(1);
    var ret = Promise.resolve(imgBase64);

    if (maxWidth) {
        if (!imgBase64) {
            ret = jv.file2Base64Data(file)
        } else {
            ret = Promise.resolve(imgBase64);
        }


        ret = ret
            .then(imgBase64 => jv.compressImage({
                imageData: imgBase64,
                fileName: fileName,
                maxWidth: maxWidth,
                filter: (image) => {
                    process_callback(2);
                    //如果图片 <= 256 ,则不处理.
                    if (image.naturalWidth <= maxWidth) {
                        return false;
                    }
                }
            }));
    }


    return ret
        .then(imgBase64 => {
            if (imgBase64) {
                return jv.base64Data2File(imgBase64)
            }
            return file;
        }).then(file => {
            process_callback(3);
            return doWork(file)
        });
};


export default jv;