<template>
  <div>
    <slot :info="info"></slot>

    <el-tabs type="card" style="margin-top:20px;" v-model="activeName">
      <el-tab-pane label="商品信息" name="info">
        <product-detail-info v-model="info" @change="infoChanged"
                             :action="action"></product-detail-info>
      </el-tab-pane>
      <el-tab-pane label="图片" name="image" v-if="productId">
        <product-detail-image v-model="info"></product-detail-image>
      </el-tab-pane>
      <el-tab-pane label="参数表" name="parameter" v-if="productId">
        <product-detail-parameter v-model="info"></product-detail-parameter>
      </el-tab-pane>
      <el-tab-pane label="库存价格" name="sku" v-if="productId">
        <product-detail-sku v-model="info"></product-detail-sku>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script type="text/ecmascript-6">
  import ProductDetailInfo from "./ProductDetailInfo.vue"
  import ProductDetailImage from "./ProductDetailImage.vue"
  import ProductDetailParameter from './ProductDetailParameter.vue'
  import ProductDetailSku from './ProductDetailSku.vue'

  export default {
    components: {ProductDetailInfo, ProductDetailImage, ProductDetailParameter, ProductDetailSku},
    name: "product-detail",
    props: {
      productId: {type: String, default: ""},
      action: {type: String, default: "save"} //两种action: save,add
    },
    computed: {
    },
    data() {
      return {
        activeName: "info",
        info: {brand: {}, category: {name: '', code: ''}},
      }
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        if (!this.productId) return;

        return this.$http.post('/info/product/get', {productId: this.productId}).then((res) => {

          var json = {
            get guidePrice_yuan() {
              return parseFloat(this.guidePrice || 0) / 100;
            },
            set guidePrice_yuan(value) {
              this.guidePrice = parseInt(value * 100);
            },

            get salePrice_yuan() {
              return parseFloat(this.salePrice || 0) / 100;
            },
            set salePrice_yuan(value) {
              this.salePrice = parseInt(value * 100);
            }
          };

          Object.assign(json, res.data.data);

          this.info = json;

          this.$emit("loaded", this.info);
        });
      },
      infoChanged() {
        this.loadData();
      }
    }
  }
</script>

