<template>
  <el-form class="item-form" ref="pic" :model="info" label-width="120px">
    <div style="margin-bottom:20px;color:gray;">
      图片格式支持png、jpg、gif<br/>
      视频格式支持mp4,且最大不得超过100M
    </div>
    <el-form-item label="Logo:">
      <upload :maxCount="1"
              scales="1:1"
              :proxy="true"
              v-model="info.logo"
              :uid="info.id"
              db="productInfo.logo"
      >
      </upload>
    </el-form-item>

    <el-form-item label="视频:">
      <upload :maxCount="1"
              v-model="info.video"
              :proxy="true"
              maxSize="150MB"
              fileType="video"
              :uid="info.id"
              db="productInfo.video"
      >
      </upload>
    </el-form-item>
    <el-form-item label="横版广告图片:">
      <upload :maxCount="1"
              scales="16:9"
              :proxy="true"
              v-model="info.adImage"
              :uid="info.id"
              db="productInfo.adImage"
      >
      </upload>
    </el-form-item>


    <el-form-item label="轮播图片:">
      <upload
        v-model="info.showImages"
        :proxy="true"
        :maxCount="9"
        scales="1:1"
        :uid="info.id"
        db="productInfo.showImages"
      >
      </upload>
    </el-form-item>

    <el-form-item label="商品详情:">
      <upload
        v-model="info.images"
        :proxy="true"
        :maxCount="9"
        :scales="[]"
        :uid="info.id"
        db="productInfo.images"
      >
      </upload>
    </el-form-item>
  </el-form>

</template>

<script>
    export default ({
        props: {
            value: {
                type: Object, default: function () {
                    return {}
                }
            }
        },
        computed: {
            productId() {
                return this.value.id;
            }
        },
        data() {
            return {
                info: {},
            }
        },
        watch: {
            value(val) {
                this.info = Object.assign({}, val);
            }
        },
        methods: {}
    })
</script>

<style scoped>
  .item-form {
    padding-top: 0;
    padding-bottom: 0;
  }

  > > > .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    background-color: #fbfdff;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  > > > .avatar-uploader .el-upload:hover {
    border-color: #feac00;
  }

  > > > .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    line-height: 148px;
    text-align: center;
  }

  > > > .avatar {
    width: 148px;
    height: 148px;
    display: block;
  }

  > > > .upload-video .el-upload {
    width: 400px;
    height: 300px;
  }

  > > > .upload-video video {
    width: 400px;
    height: 300px;
  }
</style>
