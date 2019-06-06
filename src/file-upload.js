import "spark-md5"
import jv from './libjv'

jv.getFileMd5 = function (file) {
  return new Promise((resole, reject) => {

    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        chunkSize = 2097152, // read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0;
    var spark = new SparkMD5.ArrayBuffer();
    var frOnload = function (e) {
          spark.append(e.target.result); // append array buffer
          currentChunk++;
          if (currentChunk < chunks)
            loadNext();
          else {
            var d = "";
            resole(spark.end());
          }
        },
        frOnerror = function () {
          reject(false);
        };

    function loadNext() {
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

jv.dataURLtoBlob = function (dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return {data: u8arr, type: mime};
}


jv.toByteUnit = function (value) {
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


jv.compressImage = function (op) {
  var imgDataBase64 = op.imageData,
      maxWidth = op.maxWidth,
      fileName = op.fileName,
      func = op.func || function () {
        return true;
      }, //是否压缩的回调
      quality = op.quality || 0.7;


  var getImageContextTypeByExtName = function (fileNameExt) {
    return 'image/' + ((fileNameExt.match(/png|jpeg|bmp|gif/ig) || []) [0] || "jpeg");
  };

  return new Promise((resolve, reject) => {
    // if (fileType != "img") {
    //   resolve(imgDataBase64);
    //   return;
    // }

    var image = document.createElement("img");

    image.onload = function () {
      if (!image.naturalWidth) {
        reject("未能加载图片：" + fileName)
        return;
      }

      if (func(image) === false) {
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
        var ext = fileName.split('.').slice(1).last();
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
}

// jv.checkUpload = function (setting) {
//   var vm = setting.vm;
//   var rawFile = setting.file;
//   var maxWidth = setting.maxWidth || 800;
//   var maxCount = setting.maxCount || 20;
//   var fileType = setting.fileType || "img";
//   var maxSize = jv.toByteUnit(setting.maxSize || "1M");  //KB
//
//   var checkFileType = function (fileName, fileType) {
//     var dotIndex = fileName.lastIndexOf('.');
//     if (dotIndex < 0) return false;
//
//     var ext = fileName.slice(dotIndex + 1).toLowerCase();
//
//     var typeDict = {};
//     typeDict["img"] = {type: "png,jpg,gif,bmp,ico,icon", remark: "图片文件"};
//     typeDict["doc"] = {type: "doc,docx,xls,xlsx,pdf", remark: "office文档"};
//     typeDict["video"] = {type: "mp4,avi,webm,ogg,mov", remark: "视频文件"};
//
//     var item = typeDict[fileType];
//     if (item) {
//       if (item.type.split(",").indexOf(ext) < 0) return item;
//     }
//     return;
//   }
//
//   var chkItem = checkFileType(rawFile.name, fileType)
//   if (chkItem) {
//     jv.error("文件类型不允许，只能上传: " + chkItem.type + "类型！");
//     return false;
//   }
//
//   /*
//    * 火狐找不到event
//    * 360没有closest方法
//    * */
//   var vmUpload = vm.$children.last().$children.last();//event.currentTarget.closest(".el-upload").__vue__;
//   if (maxCount > 1 && vmUpload.fileList.length > maxCount) {
//     jv.error("超出上传文件的数量限制，最多上传: " + maxCount + " 个文件！");
//     return false;
//   }
//   var pvm = vmUpload.$parent;
//   if (!vmUpload.action) {
//     pvm.action = vm.Upload_Url;
//   }
//   //pvm.withCredentials = true;
//   var success = vmUpload.onSuccess;
//
//   return new Promise((resolve, reject) => {
//     //7.检查Md5,上传
//     var doUpload = function (imgBase64) {
//
//       var imgData = jv.dataURLtoBlob(imgBase64);
//       //这里必须要用 [] 包一下。
//       var file = rawFile;// new File([imgData.data], rawFile.name, {type: imgData.type});
//       file.data = imgData.data;
//       //file.size = imgData.data.length;
//       file.uid = rawFile.uid;
//
//       if (file.size > maxSize) {
//         jv.error("文件太大，超出许可范围！");
//         reject({})
//         return;
//       }
//
//       jv.getFileMd5(file).then(md5 => {
//         //8.检查服务器文件的 Md5值。
//         vm.$http.post("/sys/fileCheckUpload", {md5: md5}).then(res => {
//
//           //8.1 如果服务器存在该文件，返回
//           if (res.data && res.data.id && !res.data.msg) {
//             if (success) {
//               success.call(vm, res.data, file, [file]);
//             }
//
//             vmUpload.httpRequest = function () {
//               new Promise((r, j) => {
//                 r(res)
//               });
//             }
//             resolve(file);
//             return;
//           }
//
//
//           if (file.size > jv.toByteUnit("10MB")) {
//             jv.info("正在上传，请稍等！");
//           }
//
//           resolve(file);
//         }, error => {
//           reject(error);
//         });
//       }, error => {
//         reject(error);
//       });
//     }
//
//
//     //1. 读取文件 ，在 onload读取完成时，进行第2步。
//     var reader = new FileReader();
//     reader.onload = () => {
//       //2. 预览本地
//       //if (setImgFunc) setImgFunc(reader.result);
//       //5. 真正的处理：压缩，Md5
//       jv.compressImage(reader.result, rawFile.name).then(imageData => {
//         doUpload(imageData);
//       }).catch(msg => {
//         console.log(msg);
//         return;
//       });
//     };
//     //readAsDataURL这个方法来读取数据，取出数据的url作为FileReader的result
//     reader.readAsDataURL(rawFile);
//   });
// }


export default jv;