<template>
  <div>
    <el-dialog title="预览" :visible.sync="p.preview_show" top="auto" width="auto" :center="true" @close="preview_closed">
      <img :src="p.url" v-if="p.type=='img'" class="preview_dom" id="preview_image_dom"/>
      <video :src="p.url" @loadeddata="loaded=false" class="preview_dom" v-if="p.type=='video'"
             controls="controls" id="video_dom"></video>
    </el-dialog>

    <el-dialog title="编辑图片" :visible.sync="p.edit_show" @opened="edit_opened" @closed="edit_closed"
               :close-on-click-modal="false" top="auto" width="80%" :center="true">
      <div style="margin-bottom: 10px;display:flex;justify-content: space-between;">
        <el-radio-group v-model="p.scale" size="medium" @change="Image_Scale_Change">
          <el-radio-button :label="s" v-for="s in p.scales" :key="s">{{s}}裁剪</el-radio-button>
        </el-radio-group>
        <div>
          <el-button v-show="p.remark !== null" @click="image_remark_show=true;" type="info"
                     icon="el-icon-edit">
            输入图片信息
          </el-button>
        </div>
        <el-button style="text-align:right;" type="primary" size="small" @click="image_ok_click()"
                   icon="el-icon-check">确定
        </el-button>
      </div>
      <!--      <img id="edit_image_dom" @load="editImageLoaded" :src="p.url" v-show="p.url"-->
      <!--           style="max-width:100%;"/>-->

      <vue-cropper v-show="p.url"
                   ref="cropper"
                   :aspect-ratio="p.scale_number"
                   :src="p.url"
                   alt="图片"
      ></vue-cropper>

    </el-dialog>

    <el-dialog :visible.sync="image_remark_show" title="输入图片信息" top="auto" width="auto" :center="true">
      <el-input
        type="textarea"
        class="img_text"
        :autosize="{ minRows: 2, maxRows: 8}"
        placeholder="请输入图片的文本内容"
        v-model="p.remark">
      </el-input>
    </el-dialog>


    <div style="display:none" ref="download_div"></div>
    <a style="display: none" target="_self" ref="link_a"></a>
  </div>
</template>
<!--<style>-->
<!--@import "~es-jcrop/css/Jcrop.css";-->
<!--</style>-->
<style scoped>
  >>> .el-dialog__wrapper {
    display: flex;
  }

  >>> .el-dialog {
    margin: auto;
  }

  >>> .preview_dom {
    max-width: 80vw;
    max-height: 80vh;
    width: auto;
    height: auto;
  }

</style>
<script>
    import VueCropper from 'vue-cropperjs';
    import 'cropperjs/dist/cropper.css';
    // import "es-jcrop/js/Jcrop";
    /*
    参数对象{
    type: ["img","video","doc",file]
    url: "",
    scales: [ "16:9","1:1" ],
    scale: "1:1" //当前默认比例
    remark: ""   //备注
    callback: function(imageData,imageRemark){}  //编辑完成后的回调.
    }
    */

    export default {
        components: {VueCropper},
        name: "image-edit",
        props: {
            option: {edit_show: true},
//      image_url: "",
//      video_url: "",
//      image_scale: "", // 宽:高
//      image_scales: [],
//      image_remark: null,
//      image_callback: false
        },
        data() {
            return {
                p: {
                    scale: "",
                    scales: [],
                    scale_number: NaN,
                    edit_show: false,
                    preview_show: false,
                    callback: function () {
                    }
                },
                image_remark_show: false
            };
        },
        // updated(){
        //     var p = this.p;
        //     var p1= "data:image/bmp;base64,Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCAAAAA"
        //     if (p.type == "img") {
        //         document.getElementById("preview_image_dom").src = p1;
        //         setTimeout(()=>{
        //             document.getElementById("preview_image_dom").src = p.url;
        //         },1);
        //     }
        //     else if (p.type == "video") {
        //         document.getElementById("video_dom").src = p1;
        //         setTimeout(()=>{
        //             document.getElementById("video_dom").src = p.url;
        //         },1);
        //     }
        // },
        created() {
            var self = this;
            //预览图片,图片前后应该带着文字
            //{ type:['img','video'] , url:'表示全路径的URL信息' }
            jv.openPreview = jv.Preview = p => {
                if (!p || !p.url) {
                    return;
                }

                Object.assign(self.p, p,
                    {
                        preview_show: true
                    });
            };

            //编辑图片,图片前后应该带着文字
            //{ type:['img','video'] , url:'', scales:["16:9"] , scale:"", remark:"", callback:"" }
            jv.openEditImage = jv.EditImage = p => {
                p.url = p.image || p.url;
                if (!p || !p.url) {
                    return;
                }
                Object.assign(self.p, p,
                    {
                        edit_show: true,
                        scale: p.scale || p.scales[0]
                    });
            };

            jv.downloadFile = url => {
                if (!url) return;
                console.log(url);
                var div = this.$refs["download_div"];
                div.innerHTML = "";
                div.innerHTML = "<iframe src=\"" + url + "\" />";
            }

            jv.open = (url,target)=>{
                if( !url){
                    return;
                }
                var link = this.$refs["link_a"];
                if( target){
                    link.setAttribute("target",target);
                }
                link.setAttribute("href",url);
                link.trigger(jv.createEvent("click", {}));
            }
        },
        watch: {
            option: {
                deep: true, handler(value) {
                    if (!value) return;
                    this.p = value;
                }
            },
            p: {
                deep: true, handler(value) {
                    if (value.url) {
                        // if (jv.edit__Image) {
                        //     jv.edit__Image.destroy();
                        //     jv.edit__Image = null;
                        // }
                    }

                    if (value.preview_show && value.type == 'video' && value.url) {
                        document.getElementById("video_dom").pause();
                    }

                    this.Image_Scale_Change();
                }
            }
        },
        methods: {
            Image_Scale_Change() {
                // if (!jv.edit__Image) return;
                if (!this.p.scale) {
                    this.p.scale_number = NaN;
                    return;
                }
                var temp = this.p.scale.split(":")
                this.p.scale_number = parseInt(temp[0]) / parseInt(temp[1] || 1);

                // var image = document.getElementById("edit_image_dom");
                // var ret = this.getSuitImageSize(image, scale);
                // // jv.edit__Image.setOptions({
                // //     setSelect: ret,
                // //     animateTo: ret,
                // //     aspectRatio: 0
                // // });
                //
                // jv.edit__Image.setOptions({
                //     setSelect: ret,
                //     animateTo: ret,
                //     aspectRatio: scale
                // });
            },
            // previewImageLoaded(e) {
            //   // var image = e.target;
            //   // image.closest(".el-dialog").style.width = "auto";//.width("auto");
            // },
            preview_closed() {
                this.p.url = "";
                this.p.type = "";
            },

            edit_opened() {
                // if (p.url) {
                //     var image = document.getElementById("edit_image_dom");
                //     this.editImageLoaded({target: image});
                // }
            },
            edit_closed() {
                this.p.url = "";
                this.p.cancel && this.p.cancel();
            },
            editImageLoaded(e) {
                // if (jv.edit__Image) {
                //     jv.edit__Image.destroy();
                //     jv.edit__Image = null;
                // }

                var image = e.target;
                var temp = this.p.scale.split(":")
                var scale = parseInt(temp[0]) / parseInt(temp[1] || 1);
                var self = this;
                var ret = this.getSuitImageSize(image, scale);

                // window.jQuery(image).Jcrop({
                //   setSelect: ret,
                //   animateTo: ret,
                //   aspectRatio: scale,
                //   minSize: [100, 100],
                //   allowSelect: true
                // }, function () {
                //   jv.edit__Image = this;
                //   self.Image_Scale_Change();
                //
                //   //image.closest(".el-dialog").style.width = "auto";//.width("auto");
                // });
            },
            getSuitImageSize(img, scale) {
                var style = img.ownerDocument.defaultView.getComputedStyle(img);
                var width = parseInt(style.width), height = parseInt(style.height);
                var ret = {};
                ret.width = width;
                ret.height = parseInt(width / scale);
                ret.left = 0;
                ret.top = (height - ret.height) / 2;
                if (ret.height > height) {
                    ret.height = height;
                    ret.width = parseInt(height * scale);

                    ret.top = 0;
                    ret.left = (width - ret.width) / 2;
                }

                return [ret.left, ret.top, ret.left + ret.width, ret.top + ret.height];
            },
            image_ok_click() {
                // if (!jv.edit__Image) {
                //     console.error("找不到 jv.edit__Image !")
                //     return;
                // }


                var cropperImage = this.$refs.cropper;

                var canvas = document.createElement("canvas"),
                    ctx = canvas.getContext('2d'),
                    // corpBox = cropperImage.getCropBoxData(),
                    data = cropperImage.getData();
                // zoom = data.width / parseInt(corpBox.width);

                // var sect = jv.edit__Image.getSelection();
                //
                // Object.keys(sect).forEach(it => {
                //     sect[it] = sect[it] * zoom;
                // });

                canvas.width = data.width;
                canvas.height = data.height;

                // 在canvas绘制前填充白色背景
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);


                var image = new Image();
                image.crossOrigin = "anonymous";
                image.onload = () => {
                    ctx.drawImage(image, 0, 0, data.width, data.height, 0, 0, data.width, data.height);

                    var ext = this.p.fileName.split('.').slice(1).last();
                    var extType = "jpeg";
                    if (ext) {
                        extType = (ext.match(/png|jpeg|bmp|gif/) || []) [0] || extType;
                    }

                    this.p.callback && this.p.callback(canvas.toDataURL('image/' + extType, 0.7), this.p.remark);
                    this.p.edit_show = false;

                    canvas = null;
                    ctx = null;
                };
                image.src = cropperImage.getCroppedCanvas().toDataURL();
            },
        }
    }
</script>
