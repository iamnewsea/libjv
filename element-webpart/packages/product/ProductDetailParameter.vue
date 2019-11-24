<template>
  <div>
    <el-table border :data="parameters">
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
      value(val) {
        if (!val.id) return;
        this.parameters = Object.assign([], val.parameters);
      }
    },
    data() {
      return {
        parameters: [],
        loading: false,
        //商品状态
        ProductStatusEnum: jv.ProductStatusEnum.getData()
      }
    },
    methods: {
      loadParameters() {
        this.$http.post('/info/product/listParameters', {productId: this.productId},{proxy:true}).then((res) => {
          var json = res.data.data;
          json.forEach(it => {
            it._edit = false;
            it._action = "save";
          });
          this.parameters = json;
        });
      },
      add_click() {
        this.parameters.push({_edit: true, _action: 'add', _ori_value: {key: "", value: ""}})
      },
      edit_click(scope) {
        delete scope.row._ori_value;
        scope.row._ori_value = Object.assign({}, scope.row);
        scope.row._edit = true;
        this.parameters.splice(0, 0);
      },
      cancel_click(scope) {
        if (scope.row._action == "add") {
          this.parameters.splice(scope.$index, 1);
          return;
        }
        Object.assign(scope.row, scope.row._ori_value, {edit: false});
        this.parameters.splice(0, 0);
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
          parameterKey: row.key,
          parameterValue: row.value
        };

        this.$http.post('/info/product/' + row._action + 'Parameter', para,{proxy:true}).then((res) => {
          this.loadParameters();
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
          this.$http.post('/info/product/delParameter', para,{proxy:true}).then((res) => {
            this.loadParameters();
            jv.info('删除成功');
          });
        });
      }
    }
  })
</script>

<style scoped>
</style>
