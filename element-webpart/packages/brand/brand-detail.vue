<!--<template>-->
  <!--<div>-->
    <!--<slot :info="info"></slot>-->
    <!--<el-tabs type="card" style="margin-top:20px;" v-model="activeName">-->
      <!--<el-tab-pane label="品牌信息" name="info">-->
        <!--<brand-info :brandId="brandId" @loaded="infoLoaded" :proxy="proxy" :action="action"></brand-info>-->
      <!--</el-tab-pane>-->
      <!--<el-tab-pane label="修改品牌" name="modify">-->
        <!--<brand-modified   :data="info" @loaded="infoLoaded" :proxy="proxy"></brand-modified>-->
      <!--</el-tab-pane>-->
    <!--</el-tabs>-->
  <!--</div>-->

<!--</template>-->

<!--<script type="text/ecmascript-6">-->
  <!--import BrandInfo from "./brand-info.vue"-->
  <!--import BrandModified from "./brand-modified.vue"-->

  <!--export default {-->
    <!--components: {BrandInfo,BrandModified},-->
    <!--name: "brand-detail",-->
    <!--props: {-->
      <!--brandId: {type: String, default: ""},-->
      <!--proxy: {type: Boolean, default: false}-->
    <!--},-->
    <!--computed: {-->
      <!--proxyValue() {-->
        <!--return (this.proxy ? "@" : "");-->
      <!--}-->
    <!--},-->
    <!--data() {-->
      <!--return {-->
        <!--activeName: "info",-->
        <!--info: {},-->
      <!--}-->
    <!--},-->
    <!--mounted() {-->
    <!--},-->
    <!--methods: {-->
      <!--infoLoaded(info) {-->
        <!--if (!info) return;-->
        <!--this.info = info;-->

        <!--this.$emit("loaded",this.info);-->
      <!--}-->
    <!--}-->
  <!--}-->
<!--</script>-->

<!--<style scoped>-->
  <!--&gt;>> .el-tabs__content{-->
    <!--border:1px solid #d9d9d9;-->
    <!--border-top-width:0;-->
    <!--padding:25px;-->
  <!--}-->
<!--</style>-->
