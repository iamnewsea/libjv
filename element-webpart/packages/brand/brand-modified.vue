<!--<template>-->
  <!--<div>-->
    <!--<el-form ref="info" :model="info" label-width="120px">-->
      <!--<el-form-item label="名称:" chk="*">-->
        <!--<el-input v-model.trim="info.name" placeholder="请输入名称"></el-input>-->
      <!--</el-form-item>-->
      <!--&lt;!&ndash;  <el-form-item label="类型:">-->
          <!--<el-input v-model.trim="info.type" placeholder="请输入类型"></el-input>-->
        <!--</el-form-item>&ndash;&gt;-->

      <!--<el-form-item label="分类：">-->
        <!--<el-select v-model="info.category.code" placeholder="请选择">-->
          <!--<el-option-->
            <!--v-for="item in categories"-->
            <!--:key="item.code"-->
            <!--:label="item.name"-->
            <!--:value="item.code">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->

      <!--<el-form-item label="品牌：">-->
        <!--<el-select v-model="info.brand.id" placeholder="请选择">-->
          <!--<el-option-->
            <!--v-for="item in brands"-->
            <!--:key="item.id"-->
            <!--:label="item.name"-->
            <!--:value="item.id">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->


      <!--<el-form-item label="活动类型：" prop="type" class="label-test">-->
        <!--<el-select v-model="info.activityType" placeholder="请选择商品">-->
          <!--<el-option-->
            <!--v-for="(item,index) in ActivityTypeEnum"-->
            <!--:label="item.remark"-->
            <!--:value="item.name"-->
            <!--:key="index">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->

      <!--<el-form-item label="官方价格￥:">-->
        <!--<el-input style="width:120px" v-model.trim="info.guidePrice_yuan" placeholder="请输入官方价格"-->
                  <!--v-model.number="info.guidePrice_yuan"></el-input>-->
        <!--<span class="price">元</span>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="商品状态:">-->
        <!--<el-radio-group v-model="info.status">-->
          <!--<template v-for="item in ProductStatusEnum">-->
            <!--<el-radio :label="item.name">{{item.remark}}</el-radio>-->
          <!--</template>-->
        <!--</el-radio-group>-->
      <!--</el-form-item>-->

      <!--<el-form-item label="条形码:">-->
        <!--<el-input v-model.trim="info.barCode" placeholder="请输入条形码"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="口号:">-->
        <!--<el-input type="textarea" autosize resize="none" v-model.trim="info.slogan" placeholder="请输入口号"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="详情：">-->
        <!--<el-input type="textarea" v-model="info.remark" autosize resize="none"-->
                  <!--placeholder="请输入详情"></el-input>-->
        <!--<p>-->
          <!--<el-button style="margin:20px 0;" @click="UseProductTemplateClick">使用模板初始化商品详情-->
          <!--</el-button>-->
        <!--</p>-->
      <!--</el-form-item>-->
    <!--</el-form>-->


    <!--<el-button style="margin-left: 120px" type="primary" @click="SaveClick" size="large">保存</el-button>-->


  <!--</div>-->

<!--</template>-->

<!--<script>-->

  <!--export default ({-->
    <!--props: {-->
      <!--proxy: {type: Boolean, default: false},-->
      <!--action: {type: String, default: "save"} //两种action: save,add-->
    <!--},-->
    <!--computed: {-->
      <!--proxyValue() {-->
        <!--return (this.proxy ? "@" : "");-->
      <!--}-->
    <!--},-->
    <!--data() {-->
      <!--return {-->
        <!--productId: this.$route.query.id,-->
        <!--info: {brand: {}, category: {name: '', code: ''}},-->

        <!--brands: [],-->
        <!--categories: [],-->
        <!--//商品状态-->
        <!--ProductStatusEnum: jv.ProductStatusEnum.getData(),-->
        <!--ActivityTypeEnum: jv.ActivityTypeEnum.getData().filter(item => item.name !== "Coin1")-->

      <!--}-->
    <!--},-->
    <!--mounted() {-->
      <!--var count = 0;-->
      <!--var loaded = it => {-->
        <!--count++;-->
        <!--if (count == 3) {-->
          <!--this.$emit("loaded", this.info);-->
        <!--}-->
      <!--}-->
      <!--this.loadData().then(it => loaded());-->
      <!--this.brandList().then(it => loaded());-->
      <!--this.categoryList().then(it => loaded());-->
    <!--},-->
    <!--methods: {-->
      <!--loadData() {-->
        <!--if (!this.productId) return Promise.resolve();-->

        <!--return this.$http.post(this.proxyValue + '/info/product/get', {productId: this.productId}).then((res) => {-->
          <!--let json = Object.assign({-->
            <!--get guidePrice_yuan() {-->
              <!--return parseFloat(this.guidePrice || 0) / 100;-->
            <!--},-->
            <!--set guidePrice_yuan(value) {-->
              <!--this.guidePrice = parseInt(value * 100);-->
            <!--},-->

            <!--get salePrice_yuan() {-->
              <!--return parseFloat(this.salePrice || 0) / 100;-->
            <!--},-->
            <!--set salePrice_yuan(value) {-->
              <!--this.salePrice = parseInt(value * 100);-->
            <!--}-->
          <!--}, res.data.data);-->

          <!--this.info = json;-->
        <!--})-->
      <!--},-->
      <!--//点击使用模板初始化商品详情-->
      <!--UseProductTemplateClick() {-->
        <!--if (this.info.remark) {-->
          <!--return jv.error("请先删除详情内容，再使用模板初始化！");-->
        <!--}-->

        <!--this.info.remark = "原材料：\n\n" +-->
          <!--"物流：\n\n" +-->
          <!--"存储：\n\n" +-->
          <!--"生产：\n\n" +-->
          <!--"商品介绍:\n\n";-->
      <!--},-->
      <!--//点击保存-->
      <!--SaveClick() {-->
        <!--if (this.$refs['info'].chk() == false) {-->
          <!--return;-->
        <!--}-->

        <!--var json = Object.assign({}, this.info);-->

        <!--if (json.category) {-->
          <!--let category = this.categories.find(item => item.code == json.category.code);-->

          <!--if (category) {-->
            <!--json.category = {-->
              <!--id: category.id,-->
              <!--code: category.code,-->
              <!--name: category.name-->
            <!--}-->
          <!--}-->
        <!--}-->

        <!--if (json.brand) {-->
          <!--let brand = this.brands.find(item => item.id == json.brand.id);-->
          <!--if (brand) {-->
            <!--json.brand =  brand-->
          <!--}-->
        <!--}-->

        <!--delete json.images;-->
        <!--delete json.productImages;-->
        <!--delete json.examiningImages;-->
        <!--delete json.parameters;-->
        <!--delete json.skuDefine;-->
        <!--delete json.skuStockPrice;-->
        <!--delete json.ads;-->

        <!--this.$http.post(this.proxyValue + '/info/product/' + this.action, json).then(res => {-->
          <!--jv.info('保存成功');-->

          <!--if (this.action == "add") {-->
            <!--this.$router.push('/info/product/edit?id=' + res.data.data);-->
          <!--}-->
        <!--});-->
      <!--},-->
      <!--categoryList() {-->
        <!--var cacheKey = "app.shop.webpart.category";-->
        <!--this.categories = jv.cache.get(cacheKey) || [];-->
        <!--if (this.categories.length) {-->
          <!--return Promise.resolve();-->
        <!--}-->

        <!--return this.$http.post(this.proxyValue + "/info/product/categoryList").then(res => {-->
          <!--this.categories = res.data.data;-->

          <!--jv.cache.set(cacheKey, this.categories, 600);-->
        <!--})-->
      <!--},-->
      <!--brandList() {-->
        <!--var cacheKey = "app.shop.webpart.brands";-->
        <!--this.brands = jv.cache.get(cacheKey) || [];-->
        <!--if (this.brands.length) {-->
          <!--return Promise.resolve();-->
        <!--}-->

        <!--return this.$http.post(this.proxyValue + "/info/product/brandList").then(res => {-->
          <!--var corpBrand = res.data.value;-->
          <!--this.brands = [{name: "空"}];-->
          <!--if (corpBrand.name) {-->
            <!--corpBrand.name = corpBrand.name + " &#45;&#45; [企业自主品牌]"-->
            <!--this.brands.push(corpBrand);-->
          <!--}-->

          <!--this.brands.push(...res.data.data);-->

          <!--jv.cache.set(cacheKey, this.brands, 600);-->
        <!--})-->
      <!--},-->
    <!--}-->
  <!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--</style>-->
