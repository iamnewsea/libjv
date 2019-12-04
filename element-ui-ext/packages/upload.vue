<template>
  <div class="avatar-uploader">
    <div class="el-upload" :class="'el-upload-' + index"
         v-for="(item,index) in myValue">
      <div class="el-upload-preview" v-if="item.id && item.fullUrl" onmouseleave="this.classList.remove('deleting')">
        <img class="avatar-uploader-icon" :src="item.fullUrl" v-if="item.fileType=='img'"/>
        <video v-else-if="item.fileType=='video'" :src="item.fullUrl" class="avatar-uploader-icon"
               controls="controls"></video>
        <div v-else class="avatar-uploader-icon upload-fill el-icon-document"
             :class="'upload-icon-'+ item.fileType"></div>
        <div class="el-upload-bg">
        </div>
        <div class="el-upload-icon confirm-icon">
          <el-tag type="danger" @click="onRemove(index,$event)" style="padding-left:12px;padding-right:12px;">确认删除?
          </el-tag>
        </div>
        <div class="el-upload-icon hover-icon" style="flex-direction: column;">
          <div>
            <i class="el-icon-view" @click="file_preview(index)"
               v-if="item.fileType == 'img' || item.fileType == 'video'"></i>
            <i class="el-icon-download" @click="file_download(index)" v-else></i>
            <i class="el-icon-delete"
               @click="$event.target.closest('.el-upload-preview').classList.add('deleting')"></i>
          </div>
          <div v-if="maxCount>1">
            <i class="el-icon-arrow-left" @click="move_left(index)" v-if="index>0"></i>
            <i class="el-icon-arrow-right" @click="move_right(index)" v-if="index < myValue.length -1"></i>
          </div>
        </div>
      </div>
      <!--      <div v-if="withRemark" class="withRemark">-->
      <!--        {{item.remark}}-->
      <!--      </div>-->
    </div>
    <el-progress type="circle" :percentage="percentage" v-if="percentage"></el-progress>
    <input type="file" name="file" style="display: none" @change="file_change" @click="file_click" v-bind="fileAttr">
    <div class="el-upload" @click="upload_Click"
         v-if="!myValue || (myValue.length < maxCount && !percentage)">

      <div class="el-upload-preview">
        <slot>
          <i class="el-icon-plus avatar-uploader-icon"></i></slot>
      </div>
    </div>

  </div>
</template>
<script>
    export default {
        name: "Upload",
        props: {
            value: {
                type: [Array, Object], default: function () {
                    var ret = [];
                    ret.defalt = true;
                    return ret;
                }
            },
            uid: {type: null, default: 0},     // 表示该图片所属的表的行Id.
            db: {type: String, default: ""},   // 表名.列表. 定义了 db ,自动调用服务器Api
            scales: {
                type: [String, Array], default: function () {
                    return [];  //"1:1", "16:9"
                }
            }, //空表示保持原始 宽:高
            // withRemark: {type: Boolean, default: false},
            maxCount: {type: Number, default: 1},
            maxWidth: {type: Number, default: 0},
            fileType: {type: String, default: "img"}, //上传的要求
            maxSize: {type: String, default: "5M"}
        },
        data() {
            return {
                myValue: [],
                percentage: 0,
                fileAttr: {},
                // imageRemark: "", //添加时使用.添加的图片文字
                scales_value: this.scales
            };
        },
        mounted() {
            this.setMyValue(this.value);
        },
        watch: {
            maxCount: {
                immediate: true, handler(v) {
                    this.setFileAttributes();
                }
            },
            value: {
                immediate: true, handler(v) {
                    this.setMyValue(v);
                }
            },
            scales: {
                immediate: true, handler(value) {
                    if (typeof (value) == "string") {
                        if (!value) {
                            this.scales_value = [];
                        } else {
                            this.scales_value = value.split(",");
                        }
                    } else if (!value) {
                        this.scales_value = [];
                    } else {
                        this.scales_value = value;
                    }

                    this.setFileAttributes()
                }
            }
        },
        methods: {
            setMyValue(v) {
                if (this.maxCount == 1) {
                    if (v.Type == "array" && v.default) {
                        throw new Error("上传1个文件时，value不能是数组");
                    }

                    if (this.myValue[0] && this.myValue[0].id == v.id) {
                        return;
                    }

                    this.myValue = [Object.assign({}, v)].filter(it => it.id).map(it => {
                        v.fileType = this.getFileType(it.url).type;
                        return v;
                    });
                    return;
                }

                if (v.Type != "array") {
                    throw new Error("上传多个文件时，value必须是数组。");
                }

                if (jv.dataEquals(this.myValue, v, (a, b) => {
                    return a.id == b.id;
                })) {
                    return;
                }

                this.myValue = v.map(it => {
                    var v = Object.assign({}, it || {});

                    v.fileType = this.getFileType(v.url).type;
                    return v;
                });
            },
            setFileAttributes() {
                var ret = {};
                if (this.maxCount == 1) {
                    this.fileAttr = ret;
                    return;
                }
                if (this.scales_value.length) {
                    this.fileAttr = ret;
                    return;
                }
                // if (!this.withRemark) return ret;

                this.fileAttr = {multiple: "multiple"};
            },
            upload_Click() {
                var input = this.$el.querySelector("input");
                if (input) {
                    input.click();
                }
            },
            file_click(e) {
                var v = {data: this.myValue}
                this.$emit("clicking", v);
                if (v.returnValue === false) {
                    e.preventDefault();
                    return false;
                }
            },
            file_change(e) {
                this.percentage = 0;
                var files = e.target.files;
                if (files.length + this.myValue.length > this.maxCount) {
                    jv.error("最多只能上传: " + this.maxCount + "个！");
                    return;
                }


                if (this.fileType != "*") {
                    var errorFileType = Array.from(files).some((rawFile, index) => {
                        var fileName = rawFile.name;
                        var chkItem = this.getFileType(fileName);
                        if (chkItem.type != this.fileType) {
                            jv.error("第" + (index + 1) + "个文件类型不允许，只能上传: " + chkItem.remark + "类型！");
                            return true;
                        }
                    });

                    if (errorFileType) {
                        return;
                    }
                }

                Promise.all(Array.from(files).map(file => this.uploadFile(file))).then(() => {
                    e.target.value = "";
                });
            },
            uploadFile(rawFile) {
                if (!rawFile) {
                    return Promise.reject(false);
                }
                // this.imageRemark = "";

                // var readFile = file => {
                //     return new Promise((r, e) => {
                //         var reader = new FileReader();
                //         reader.onload = () => {
                //             r(reader.result);
                //         };
                //         reader.readAsDataURL(file);
                //     });
                // };

                var fileName = rawFile.name, fileType = this.getFileType(fileName).type;

                if (fileType.type == "img" && this.scales_value.length == 0 && this.maxWidth > 0) {
                    return this.doUpload(rawFile, null, fileName, this.maxWidth);
                } else if (fileType.type == "img" && this.scales_value.length) {
                } else {
                    return this.doUpload(rawFile, null, fileName);
                }

                return jv.file2Base64Data(rawFile).then(base64 => {
                    jv.EditImage({
                        image: base64Data,
                        scales: this.scales_value,
                        fileName: fileName,
                        // imageRemark: this.withRemark ? "" : null,
                        //callback : 返回 base64 格式的图片数据
                        callback: (imageData, imageRemark) => {
                            if (!imageData) {
                                return Promise.reject("裁剪出错");
                            }
                            // this.imageRemark = imageRemark;

                            return this.doUpload(null, imageData, fileName, this.maxWidth);
                        }
                    });
                });
            },
            getFileType(fileName) {
                var dotIndex = fileName.lastIndexOf('.');
                if (dotIndex < 0) return false;

                var ext = fileName.slice(dotIndex + 1).toLowerCase();

                var typeDict = {};
                typeDict["img"] = {type: "img", exts: "png,jpg,gif,bmp,ico,icon".split(","), remark: "图片文件"};
                typeDict["doc"] = {type: "doc", exts: "doc,docx,xls,xlsx,pdf".split(","), remark: "office文档"};
                typeDict["video"] = {type: "video", exts: "mp4,avi,webm,ogg,mov".split(","), remark: "视频文件"};

                var findKey = Object.keys(typeDict).last(key => typeDict[key].exts.includes(ext));
                if (findKey) {
                    return typeDict[findKey];
                }

                return {type: ""};
            },
            //7.检查Md5,上传
            doUpload(file, imgBase64, fileName) {
                return jv.doUploadFile({
                    file: file,
                    imageBase64: imgBase64,
                    fileName: fileName,
                    axios: this.$http,
                    maxWidth: 0,
                    processCallback: p => this.percentage = p
                }).then(res=>{
                    if( !res){
                        console.log("上传文件错误")
                        return res;
                    }
                    this.emit(res.data.data, "add");
                    return res;
                });
                // this.percentage = 4;
                // var file = jv.base64Data2File(imgBase64, fileName);
                //
                // if (file.length > this.maxSize) {
                //     this.percentage = 0;
                //     jv.error("文件太大，超出许可范围！");
                //     return;
                // }
                //
                // //真正上传从 10% 开始。
                // jv.getFileMd5(file).then(md5 => {
                //     this.percentage = 6;
                //     var param = {md5: md5};
                //     // if (this.proxy && this.proxyCorpId) {
                //     //   param["Corp-Id"] = this.proxyCorpId
                //     // }
                //     //8.检查服务器文件的 Md5值。
                //     this.$http.post("/sys/check_upload", param).then(res => {
                //
                //         this.percentage = 8;
                //         //8.1 如果服务器存在该文件，返回
                //         var data = res.data.data;
                //         if (data && data.id) {
                //             this.percentage = 100;
                //             this.emit(data, "add");
                //             return;
                //         } else {
                //             this.post(file);
                //         }
                //     }, error => {
                //         this.percentage = 0;
                //     });
                // }, error => {
                //     this.percentage = 0;
                // });
            },
            // post(processedFile) {
            //     var file = processedFile || this.$el.querySelector("input");
            //
            //     const formData = new FormData();
            //     formData.append(file.name.split("/").last(), file);
            //
            //     this.$http.post(window.Server_Host + "/sys/upload", formData, {
            //         onUploadProgress: e => {
            //             if (e.total > 0) {
            //                 e.percent = parseInt(e.loaded / e.total * 90);
            //             }
            //             this.percentage = e.percent + 10;
            //         }
            //     }).then(res => {
            //         this.emit(res.data.data, "add");
            //     }).catch(e => {
            //         this.percentage = 0;
            //         jv.error(e);
            //     });
            // },
            move_left(index) {
                if (!index) return;

                this.myValue.swap(index - 1, index);
                this.emit(null, "swap", {index1: index - 1, index2: index});
            }
            ,
            move_right(index) {
                if (index == this.myValue.length - 1) return;

                try {
                    this.emit(null, "swap", {index1: index, index2: index + 1});
                    this.myValue.swap(index, index + 1);
                } catch (e) {
                }
            },
            emit(json, action, para) {
                this.percentage = 0;
                if (json) {
                    if (this.myValue.length > this.maxCount - 1) {
                        this.myValue.splice(0, this.myValue.length - this.maxCount + 1);
                    }

                    if (!("fileType" in json)) {
                        json.fileType = this.getFileType(json.url).type;
                    }
                    this.myValue.push(json);
                }

                this.$el.querySelector("input").value = "";

                if (this.maxCount == 1) {
                    var value = Object.assign({id: "", url: ""}, this.myValue[0]);

                    this.$emit("input", value);

                    if (this.db && this.uid) {
                        var param = {
                            db: this.db,
                            id: this.uid,
                            image: value
                        };
                        this.$http.post("/image/set", param).then(res => {
                            this.$emit("changed", value, this.uid);
                        });
                    } else {
                        this.$emit("changed", value, this.uid);
                    }
                } else {
                    this.$emit("input", this.myValue);


                    if (action == "add") {
                        para = Object.assign({}, json);//, {remark: this.imageRemark});
                    } else {
                        para = Object.assign({id: "", url: ""}, para);
                    }

                    if (this.db && this.uid) {
                        var param = {
                            // "Corp-Id": this.proxyCorpId,
                            action: action,
                            db: this.db,
                            id: this.uid,
                            image: {id: para.id, url: para.url},
                            index1: para.index1 || 0,
                            index2: para.index2 || 0
                        };
                        this.$http.post("/image/change", param).then(res => {
                            this.$emit("changed", this.myValue, action, para, this.uid);
                        });
                    } else {
                        this.$emit("changed", this.myValue, action, para, this.uid);
                    }
                }
            },
            onRemove(index, e) {
                e.target.closest(".avatar-uploader").classList.remove("deleting");

                var removeId = this.myValue[index].id;

                this.myValue.splice(index, 1);
                this.emit(null, "remove", {index: index, id: removeId, imageId: removeId});
            }
            ,
            file_preview(index) {
                jv.Preview({type: this.myValue[index].fileType, url: this.myValue[index].fullUrl});
            },
            file_download(index) {
                window.open(this.myValue[index].fullUrl, "download")
            }
        }
    }
</script>
<style>
  .avatar-uploader {
    display: flex;
    flex-wrap: wrap;
  }

  .avatar-uploader * {
    flex: 0;
  }

  /*.avatar-uploader .withRemark {*/
  /*  overflow: hidden;*/
  /*  text-overflow: ellipsis;*/
  /*  width: 140px;*/
  /*  margin: auto;*/
  /*  color: gray;*/
  /*  -webkit-line-clamp: 1;*/
  /*  -webkit-box-orient: vertical;*/
  /*  display: -webkit-box;*/
  /*  height: 36px;*/
  /*}*/

  .avatar-uploader .el-upload {
    cursor: pointer;
    position: relative;
    display: flex;
    margin: 0 8px 8px 0;
    /*overflow: hidden*/
  }

  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff
  }

  .avatar-uploader .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    vertical-align: top;
    font-size: 28px;
    color: #8c939d;
    width: 146px;
    text-align: center;
    height: 146px;
    min-height: 120px;
  }

  .avatar-uploader .avatar-uploader-icon:before {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140px;
    height: 140px;
  }

  .el-upload .el-icon-document:before {
    font-size: 64px;
  }

  .avatar-uploader .avatar-uploader-icon:hover {
    cursor: pointer;
    border-color: #20a0ff
  }

  .avatar-uploader .el-upload-preview {
    position: relative;
    width: 146px;
    min-width: 146px;
  }

  .avatar-uploader .el-upload-preview > div {
    display: none;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .avatar-uploader .el-upload-preview .upload-fill {
    display: block;
  }

  .avatar-uploader .el-upload-preview .el-upload-bg {
    background-color: #00000c;
    opacity: 0.5;
  }

  .avatar-uploader .el-upload-preview .el-upload-icon {
    font-size: 28px;
    color: white;
    width: 146px;
    text-align: center;
    display: none;
    align-items: center;
    justify-content: space-around;
  }

  /*.avatar-uploader .el-upload-preview .el-upload-icon > div {*/
  /*height: 72px;*/
  /*line-height: 72px;*/
  /*}*/

  .avatar-uploader .el-upload-preview .el-upload-icon i {
    margin: 5px;
  }

  .avatar-uploader .el-upload-preview:hover .el-upload-bg {
    display: block;
  }

  .avatar-uploader .el-upload-preview:hover .hover-icon {
    display: flex;
  }

  .avatar-uploader .el-upload-preview:hover .confirm-icon {
    display: none;
  }

  .avatar-uploader .deleting:hover .confirm-icon {
    display: flex;
  }

  .avatar-uploader .deleting:hover .hover-icon {
    display: none;
  }
</style>
