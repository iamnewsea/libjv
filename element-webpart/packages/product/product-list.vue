<template>
  <div>
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <a class="link" @click="EditClick(scope.row)">{{scope.row.name}}</a>
        </template>
      </el-table-column>
      <el-table-column label="Logo" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.logo.url"/>
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="类型" align="center"></el-table-column>
      <el-table-column prop="brand.name" label="品牌" align="center"></el-table-column>
      <el-table-column prop="guidePrice_res" label="官方价格（单位：元）" align="center"></el-table-column>
      <el-table-column prop="activityType_res" label="活动" align="center"></el-table-column>
      <el-table-column prop="status_res" label="状态" align="center"></el-table-column>
      <el-table-column label="Sku" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.skuDefines">
            {{item.key + ":" + item.value}}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" v-if="total>10"
                   :total="total" :currentPage.sync="page" @current-change="loadData"
                   style="float:right;margin-top:20px;">
    </el-pagination>
  </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: "product-list",
        computed: {},
        data() {
            return {
                loading: false,
                total: 1,
                page: 1,
                tableData: []
            }
        },
        mounted() {
            this.loadData();
        },
        methods: {
            loadData(page) {
                if (page) {
                    this.page = page;
                }

                this.loading = true;


                let para = {
                    skip: (this.page - 1) * 10,
                    take: 10
                };
                this.$http.post("/info/product/find", para).then(res => {
                    var json = res.data.data;
                    json.forEach(item => {
                        //商品状态
                        jv.ProductStatusEnum.fillRes(item, 'status');
                        jv.ActivityTypeEnum.fillRes(item, "activityType");
                        // item.price_res = (item.price / 100).toFixed(2);
                        item.guidePrice_res = (item.guidePrice / 100).toFixed(2);
                    });

                    // for (let i = 0; i < this.tableData.length; i++) {
                    //   this.tableData[i].price = (this.tableData[i].price / 100).toFixed(2)
                    // }

                    this.tableData = json;
                    //返回来的total只有第一次获取的时候才有值，第二次获取之后都是-1
                    if (this.skip == 0) {
                        this.total = res.data.total;
                    }

                    this.loading = false;
                })
            },

            EditClick(row) {
                this.$router.push('/info/product/edit?id=' + row.id);
            },
        }
    }
</script>

<style scoped>
  >>> .el-tabs__content {
    border: 1px solid #d9d9d9;
    border-top-width: 0;
    padding: 25px;
  }

  >>> img {
    height: 50px;
  }
</style>
