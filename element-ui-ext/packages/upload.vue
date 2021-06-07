<template>
    <div class="avatar-uploader" v-bind="c_attrs">
        <input type="file" name="file" style="display: none" @change="file_change" @click="file_click" v-bind="fileAttr"
               v-if="!readOnly">

        <div class="el-upload" :class="'el-upload-' + index" v-for="(item,index) in myValue">
            <div class="el-upload-preview" v-if="item.id && item.fullUrl"
                 onmouseleave="this.classList.remove('deleting')">
                <div v-bind="img_attrs" class="avatar-uploader-icon preview--img" @click="img_click(index)"
                     :style="{backgroundImage: 'url(' + item.fullUrl + ')'}"
                     v-if="item.fileType=='img'"/>

                <template v-else-if="item.fileType=='video'">

                    <div v-bind="img_attrs" v-if="h5" class="avatar-uploader-icon preview--img"
                         @click="video_click(index)"
                         :style="{backgroundImage: 'url(' + (item.logo || poster) + ')'}"/>

                    <video v-bind="video_attrs" v-else
                           :src="item.fullUrl"
                           :poster="item.logo || poster"
                           class="avatar-uploader-icon"></video>
                </template>

                <div v-bind="file_attrs" v-else class="avatar-uploader-icon upload-fill el-icon-document preview--sub"
                     :class="'upload-icon-'+ item.fileType">
                    {{ item.showName }}
                </div>

                <template v-if="h5">
                    <div class="h5-remove" @click="onRemove(index,$event)" v-if="!readOnly">
                        <slot name="remove">
                            <i class="el-icon-circle-close"></i>
                        </slot>
                    </div>
                </template>
                <template v-else>
                    <div class="el-upload-bg preview--sub">
                    </div>
                    <div class="el-upload-icon confirm-icon preview--sub" v-if="!readOnly">
                        <el-tag type="danger" @click="onRemove(index,$event)"
                                style="padding-left:12px;padding-right:12px;">确认删除?
                        </el-tag>
                    </div>
                    <div class="el-upload-icon hover-icon preview--sub" style="flex-direction: column;">
                        <div>
                            <i class="el-icon-view" @click="file_preview(index)"
                               v-if="item.fileType == 'img' || item.fileType == 'video'"></i>
                            <i class="el-icon-download" @click="file_download(index)" v-else></i>
                            <i class="el-icon-delete" v-if="!readOnly"
                               @click="$event.target.closest('.el-upload-preview').classList.add('deleting')"></i>
                        </div>
                        <div v-if="maxCount>1 && !readOnly">
                            <i class="el-icon-arrow-left" @click="move_left(index)" v-if="index>0"></i>
                            <i class="el-icon-arrow-right" @click="move_right(index)"
                               v-if="index < myValue.length -1"></i>
                        </div>
                    </div>
                </template>

            </div>
            <!--      <div v-if="withRemark" class="withRemark">-->
            <!--        {{item.remark}}-->
            <!--      </div>-->

            <el-progress type="circle" :percentage="item.percentage"
                         v-else-if="item.percentage>0 && item.percentage<100"></el-progress>
        </div>


        <div class="el-upload" @click="upload_Click" v-if="!readOnly && ( !myValue ||  myValue.length < maxCount )">
            <div class="el-upload-preview">
                <slot>
                    <i class="el-icon-plus avatar-uploader-icon"></i></slot>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "upload",
    props: {
        value: {
            type: [Array, Object], default: () => []
        },
        readOnly: {
            type: Boolean, default: () => false
        },
        uid: {
            type: null, default: () => 0
        },     // 表示该图片所属的表的行Id.
        db: {
            type: String, default: () => ""
        },   // 表名.列表. 定义了 db ,自动调用服务器Api
        scales: {
            //"1:1", "16:9"
            type: [String, Array], default: () => []
        }, //空表示保持原始 宽:高
        // withRemark: {type: Boolean, default: false},
        maxCount: {
            type: Number, default: () => 1
        },
        maxWidth: {
            type: Number, default: () => 0
        },
        fileType: {
            type: String, default: () => ""
        },
        exts: {
            type: [String, Array], default: () => []
        },
        //上传的要求
        maxSize: {
            type: String, default: () => "5M"
        },
        h5: {
            //h5模式，没有浮层。
            type: Boolean, default: false
        },
        poster: {
            //默认的封面。如果找不到，使用默认的。
            type: String, default: () => ""
        },
        videoTime: {
            //单位是秒，上传视频的时长限制
            type: Number, default: 0
        },
        axiosConfig: {
            type: Object, default: () => {
                return {};
            }
        }
    },
    data() {
        return {
            myValue: [],
            fileAttr: {},
            // imageRemark: "", //添加时使用.添加的图片文字
            scales_value: [],
            exts_value: []
        };
    },
    mounted() {
        this.setMyValue(this.value);
    },
    computed: {
        c_attrs() {
            var ret = {};
            Object.keys(this.$attrs)
                .filter(key => !key.startsWith("video-") &&
                    !key.startsWith("img-") &&
                    !key.startsWith("file-"))
                .forEach(key => {
                    ret[key] = this.$attrs[key];
                });

            return ret;
        },
        video_attrs() {
            var ret = {};
            Object.keys(this.$attrs)
                .filter(key => key.startsWith("video-"))
                .forEach(key => {
                    ret[key.slice(6)] = this.$attrs[key];
                });

            return ret;
        },
        img_attrs() {
            var ret = {};
            Object.keys(this.$attrs)
                .filter(key => key.startsWith("img-"))
                .forEach(key => {
                    ret[key.slice(4)] = this.$attrs[key];
                });

            return ret;
        },
        file_attrs() {
            var ret = {};
            Object.keys(this.$attrs)
                .filter(key => key.startsWith("file-"))
                .forEach(key => {
                    ret[key.slice(5)] = this.$attrs[key];
                });

            return ret;
        }
    },
    watch: {
        maxCount: {
            immediate: true, handler(v) {
                this.setFileAttributes();
            }
        },
        value: {
            immediate: true, depth: true, handler(v) {
                this.setMyValue(v);
            }
        },
        exts: {
            immediate: true, handler(value) {
                if (typeof (value) == "string") {
                    if (!value) {
                        this.exts_value = [];
                    } else {
                        this.exts_value = value.split(",");
                    }
                } else if (!value) {
                    this.exts_value = [];
                } else {
                    this.exts_value = value;
                }
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
        // video_load(e, index) {
        //     var item = this.myValue[index];
        //     //如果有logo用logo
        //     if (item.logo) {
        //         return;
        //     }
        //
        //     setTimeout(() => {
        //         var video = e.target;
        //         var canvas = document.createElement('canvas');
        //         canvas.width = video.videoWidth;
        //         canvas.height = video.videoHeight;
        //
        //         canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        //
        //         var poster = canvas.toDataURL('image/png');
        //
        //         //可能是 data:base64
        //         if (poster.length < 16) {
        //             poster = this.poster;
        //         }
        //
        //         item.poster = poster;
        //         this.myValue.pushAll();
        //     }, 50);
        // },
        video_click(index) {
            if (!this.h5) return;
            this.file_preview(index);
        },
        img_click(index) {
            if (!this.h5) return;
            this.file_preview(index);
        },
        setItem(fileItemData) {
            delete fileItemData.percentage;
            var name = fileItemData.name || (fileItemData.url && fileItemData.url.split("/").last());
            fileItemData.fileType = jv.getFileType(name).type;
            fileItemData.showName = name.slice(-12);
        },
        setMyValue(v) {
            if (this.maxCount == 1) {
                if (v.Type == "array") {
                    v = v[0] || {};
                }

                if (jv.dataEquals(this.myValue[0], v)) {
                    return;
                }

                this.myValue = [Object.assign({}, v)].filter(it => it.id).map(it => {
                    this.setItem(it);
                    // v.fileType = this.getFileType(it.url).type;
                    return it;
                });
                return;
            }

            if (v.Type != "array") {
                throw new Error("上传多个文件时，value必须是数组。");
            }

            if (jv.dataEquals(this.myValue, v)) {
                return;
            }

            this.myValue = v.map(it => {
                var v = Object.assign({}, it || {});

                this.setItem(v);
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
            var input = this.$el.querySelector("input[type=file]");
            if (input) {
                input.click();
            } else {
                jv.error("找不到input.file");
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
        clear_value() {
            this.$el.querySelector("input[type=file]").value = "";
        },
        file_change(e) {
            var files = e.target.files;
            if (files.length + this.myValue.length > this.maxCount) {
                jv.error("最多只能上传: " + this.maxCount + "个！");
                this.clear_value();
                return;
            }


            var errorFileType = Array.from(files).some((rawFile, index) => {
                var fileName = rawFile.name;
                var chkItem = jv.getFileType(fileName);

                if ((this.fileType || '*') != "*") {
                    if (chkItem.type != this.fileType) {
                        var needType = (jv.fileTypes[this.fileType] || {}).remark || this.fileType;
                        jv.error(`第 ${index + 1} 个文件 ${chkItem.remark || chkItem.ext} 不允许，需要 ${needType} 类型！`);
                        return true;
                    }
                }

                if (this.exts_value.length) {
                    if (!this.exts_value.includes(chkItem.ext)) {
                        var needType = this.exts_value.join(",");
                        jv.error(`第 ${index + 1} 个文件 ${chkItem.remark || chkItem.ext} 不允许，需要 ${needType} 类型！`);
                        return true;
                    }
                }
            });

            if (errorFileType) {
                this.clear_value();
                return;
            }

            var result = true;
            this.$emit("change",files,val=>{
                if( val === false){
                    result = false;
                }
            })

            if(result === false){
                return;
            }


            Promise.all(Array.from(files).map(file => this.uploadFile(file)))
                .finally(() => {
                    this.clear_value();
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

            var fileName = rawFile.name, fileType = jv.getFileType(fileName);

            var item = {percentage: 1, name: fileName, fileType: fileType.type, ext: fileType.ext};
            this.myValue.push(item);

            //如果定义了 @upload , 则调用自己的函数 。
            if (this.$listeners.upload) {
                return new Promise((resolve, reject) => {
                    /**
                     * 如果要阻止继续处理,upload事件需要处理第3个回调参数： @upload="(rawFile,item)"
                     * 通过设置 item.percentage = 0  取消上传。
                     * 通过设置 item.percentage = 100  完成上传。
                     */
                    item.percentage = 2;

                    this.$emit("upload", rawFile, item);

                    //循环兼听
                    jv.await(500, -1, () => {
                        if (item.percentage === 0) {
                            this.myValue.removeItem(item);
                            reject();
                            return false;
                        }
                        if (item.percentage === 100) {
                            this.emit(item, "add");
                            resolve();
                            return false;
                        }
                    });
                })
            }


            if (fileType.type == "img" && this.scales_value.length) {
                return jv.file2Base64Data(rawFile).then(base64Data => {
                    jv.openEditImage({
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

                            return this.doUpload(null, imageData, fileName, item);
                        },
                        cancel: () => {
                            this.myValue.splice(this.myValue.length - 1, 1);
                        }
                    });
                });
            } else if (fileType.type == "video" && this.videoTime) {
                var self = this;

                var audioElement = new Audio(URL.createObjectURL(rawFile));
                audioElement.addEventListener("loadedmetadata", e => {
                    var video = e.target;
                    if (video.duration > self.videoTime) {
                        jv.error("视频时长超过 " + self.videoTime + "秒");
                        self.myValue.removeItem(item);
                        return;
                    }

                    this.doUpload(null, base64Data, fileName, item);
                });
            } else {
                return this.doUpload(rawFile, null, fileName, item);
            }
        },

        //7.检查Md5,上传
        doUpload(file, imgBase64, fileName, item) {
            return jv.doUploadFile({
                file: file,
                imageBase64: imgBase64,
                fileName: fileName,
                axios: this.$http,
                axiosConfig: this.axiosConfig,
                maxWidth: this.maxWidth,
                processCallback: p => item.percentage = p
            }).then(res => {
                if (!res) {
                    console.error("上传文件错误");
                    item.percentage = 0;
                    return res;
                }
                Object.assign(item, res.data.data);
                this.myValue.pushAll();
                this.emit(item, "add");
                return res;
            }).catch(res => {
                console.error(res);
                this.myValue.splice(this.myValue.length - 1, 1);
            });
        },
        move_left(index) {
            if (!index) return;

            this.myValue.swap(index - 1, index);
            this.emit(null, "swap", {index1: index - 1, index2: index});
        }
        ,
        move_right(index) {
            if (index == this.myValue.length - 1) return;

            this.emit(null, "swap", {index1: index, index2: index + 1});
            this.myValue.swap(index, index + 1);
        },

        //单文件的时候，设置文件
        // set1(json) {
        //     if (this.maxCount != 1) return;
        //
        //
        //     this.$el.querySelector("input").value = "";
        //     this.myValue.splice(0, this.myValue.length, json);
        //
        //     var value = Object.assign({id: "", url: ""}, json).deleteJsonKeys("percentage", "fullUrl", "fileType","logoSize","showName");
        //
        //
        //     if (this.db && this.uid) {
        //         var param = {
        //             db: this.db,
        //             id: this.uid,
        //             image: value
        //         };
        //         this.$http.post("/image/set", param).then(res => {
        //             this.$emit("input", value);
        //             this.$emit("changed", value, this.uid);
        //         });
        //     } else {
        //         this.$emit("input", value);
        //         this.$emit("changed", value, this.uid);
        //     }
        // },

        /**
         *
         * @param json 要添加的数据
         * @param action 动作： add,remove,swap
         * @param para 参数：当前数据
         */
        emit(json, action, para) {
            if (json) {
                this.setItem(json);
                // if (!("fileType" in json)) {
                //     json.fileType = this.getFileType(json.url).type;
                // }
                // this.myValue.push(json);
            }

            this.$el.querySelector("input").value = "";

            if (this.maxCount == 1) {
                var value = Object.assign({
                    id: "",
                    url: ""
                }, json).deleteJsonKeys("percentage", "fileType", "logoSize", "showName");


                if (this.db && this.uid) {
                    var param = {
                        db: this.db,
                        id: this.uid,
                        image: value
                    };
                    this.$http.post("/image/set", param).then(res => {
                        this.$emit("input", value);
                        this.$emit("change", value, this.uid, action);
                    });
                } else {
                    this.$emit("input", value);
                    this.$emit("change", value, this.uid, action);
                }
            } else {
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

                    //全部上传完一次性 change .
                    if (this.myValue.every(it => it.id)) {
                        this.$http.post("/image/change", param).then(res => {
                            this.$emit("input", this.myValue);
                            this.$emit("change", this.myValue, this.uid, action, para);
                        });
                    }
                } else {
                    if (this.myValue.every(it => it.id)) {
                        this.$emit("input", this.myValue);
                        this.$emit("change", this.myValue, this.uid, action, para);
                    }
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
            jv.openPreview({type: this.myValue[index].fileType, h5: this.h5, url: this.myValue[index].fullUrl});
        },
        file_download(index) {
            jv.downloadFile(this.myValue[index].fullUrl)
        }
    }
}
</script>
<style lang="scss">

.avatar-uploader {
    display: flex;
    flex-wrap: wrap;

    .avatar-uploader * {
        flex: 0;
    }

    .el-upload {
        cursor: pointer;
        position: relative;
        display: flex;
        margin: 0 8px 8px 0;
        /*overflow: hidden*/
    }


    .el-upload:hover {
        border-color: #20a0ff
    }


    .avatar-uploader-icon {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        vertical-align: top;
        font-size: 14px;
        color: #8c939d;
        width: 146px;
        text-align: center;
        height: 146px;
        min-height: 120px;
    }

    .avatar-uploader-icon:before {
        display: flex;
        justify-content: center;
        align-items: center;
        /*width: 140px;*/
        /*height: 140px;*/
        margin: 10px;
    }

    .avatar-uploader-icon:hover {
        cursor: pointer;
        border-color: #20a0ff
    }

    .el-icon-plus {
        display: flex;
        justify-items: center;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 28px;
    }


    .el-icon-document:before {
        font-size: 64px;
    }

    .h5-remove {
        .el-icon-circle-close {
            position: absolute;
            right: -12px;
            top: -12px;
            font-size: 24px;
            opacity: 0.6;
        }
    }


    .el-upload-preview {
        position: relative;
        width: 146px;
        min-width: 146px;

        /*video::-webkit-media-controls {*/
        /*    display: none !important;*/
        /*}*/

        /**子级元素标志*/
        .preview--sub {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }

        /**背景预览图*/
        .preview--img {
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center center;
        }

        .upload-fill {
            position: relative;
            display: flex;
            justify-items: center;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .el-upload-bg {
            background-color: #00000c;
            opacity: 0.5;
        }

        .el-upload-icon {
            font-size: 28px;
            color: white;
            width: 146px;
            text-align: center;
            display: none;
            align-items: center;
            justify-content: space-around;
        }

        .el-upload-icon i {
            margin: 5px;
        }
    }

    .el-upload-preview:hover {
        .el-upload-bg {
            display: block;
            border-radius: 6px;
        }

        .hover-icon {
            display: flex;
        }

        .confirm-icon {
            display: none;
        }
    }

    .deleting:hover {
        .confirm-icon {
            display: flex;
        }


        .hover-icon {
            display: none;
        }
    }
}


/*.avatar-uploader .el-upload-preview .el-upload-icon > div {*/
/*height: 72px;*/
/*line-height: 72px;*/
/*}*/

</style>
