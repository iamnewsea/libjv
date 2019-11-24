<template>
  <div>
    <el-table border :data="skuDefines">
      <el-table-column type="index" width="50" align="center"></el-table-column>
      <el-table-column label="属性名称" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row._edit">
            <el-input v-model="scope.row.key" chk="*"></el-input>
          </template>
          <template v-else>{{scope.row.key}}</template>
        </template>
      </el-table-column>
      <el-table-column label="属性值" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row._edit">
            <el-input v-model="scope.row.value"></el-input>
          </template>
          <template v-else>{{scope.row.value}}</template>
        </template>
      </el-table-column>
      <el-table-column operation="操作" label="操作" align="center" width="240">
        <template slot-scope="scope">
          <template v-if="scope.row._edit">
            <el-button size="small" @click="save_click(scope)">保存</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="edit_click(scope);">编辑</el-button>
          </template>
          <el-button size="small" @click="cancel_click(scope)"
                     :style="{visibility: scope.row._edit ? 'visible': 'hidden'}">取消
          </el-button>

          <el-button size="small" @click="delete_click(scope)"
                     :style="{visibility: scope.row._action == 'save' ? 'visible': 'hidden'}">删除
          </el-button>

        </template>
      </el-table-column>
    </el-table>
    <el-button style="margin-top:10px;" @click="add_click">添加</el-button>


    <div style="margin-top:40px;">库存设置</div>

    <el-table border :data="skuStockPrice">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="skuDefine" label="Sku定义" align="center"></el-table-column>
      <el-table-column label="库存" align="center">
        <template slot-scope="scope">
          <el-input-number size="small" v-model="scope.row.stock" :min="0"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="售价" align="center">
        <template slot-scope="scope">
          <el-input-number size="small" v-model="scope.row.salePrice" :min="0"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column :label="activityType_res + '售价'" align="center" v-if="activityType != 'Empty'">
        <template slot-scope="scope">
          <el-input-number size="small" v-model="scope.row.activityPrice" :min="0"></el-input-number>
        </template>
      </el-table-column>
    </el-table>

    <el-button style="margin-top:10px;" @click="SaveClick">保存库存价格</el-button>
  </div>

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
    watch:{
      value(val){
        if( !val.id) return;
        this.activityType = val.activityType;
          jv.ActivityTypeEnum.fillRes(this,"activityType");

        this.skuDefines = Object.assign([], val.skuDefines);
        this.skuStockPrice = Object.assign([], val.skuStockPrice);

        this.skuDefines.forEach(it => {
          it._edit = false;
          it._action = "save";
        });
      }
    },
    data() {
      return {
        loading: false,
        skuDefines: [],
        skuStockPrice: [],
        activityType: "",
        activityType_res: "",
        //商品状态
        ProductStatusEnum: jv.ProductStatusEnum.getData()
      }
    },
    methods: {
      loadSkus() {
        this.$http.post('/info/product/listProductSkuInfo',
            {productId: this.productId},
            {proxy:true}
          ).then((res) => {
          var json = res.data.data;
          json.skuDefines.forEach(it => {
            it._edit = false;
            it._action = "save";
          });

          this.skuDefines = json.skuDefines;
          this.skuStockPrice = json.skuStockPrice;
        });
      },
      add_click() {
        this.skuDefines.push({_edit: true, _action: 'add', _ori_value: {key: "", value: ""}})
      },
      edit_click(scope) {
        delete scope.row._ori_value;
        scope.row._ori_value = Object.assign({}, scope.row);
        scope.row._edit = true;
        this.skuDefines.splice(0, 0);
      },
      cancel_click(scope) {
        if (scope.row._action == "add") {
          this.skuDefines.splice(scope.$index, 1);
          return;
        }
        Object.assign(scope.row, scope.row._ori_value, {edit: false});
        this.skuDefines.splice(0, 0);
      },
      save_click(scope) {
        var rowIndex = scope.$index;
        if (scope.store.table.$el.querySelectorAll("table tbody")[0].rows[rowIndex].chk() == false) {
          return;
        }

        var row = scope.row;
        var para = {
          productId: this.productId,
          index: rowIndex,
          skuKey: row.key,
          skuValue: row.value
        };

        this.$http.post('/info/product/' + row._action + 'SkuDefine', para,{proxy:true}).then((res) => {
          this.loadSkus();
          jv.info('商品类型修改成功');
        });
      },

      delete_click(scope) {
        this.$confirm('确认删除 ' + scope.row.key + ' 吗？', '提示', {
          type: 'warning'
        }).then(() => {
          let para = {
            index: scope.$index,
            productId: this.productId
          };
          this.$http.post('/info/product/delSkuDefine', para,{proxy:true}).then((res) => {
            this.loadSkus();
            jv.info('删除成功');
          });
        });
      },
      //点击保存
      SaveClick() {
        this.$http.post('/info/product/saveSkuStock', {
          productId: this.productId,
          skuStockPrice: this.skuStockPrice
        },{proxy:true}).then(res => {
          jv.info('保存成功');
        });
      },
    }
  })
</script>

<style scoped>
</style>
