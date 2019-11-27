<template>
  <div style="display: inline-block">
    <div @click="popClick">
      <span v-for="(item,index) in oriValue" :key="index" class="tag-product-name"
            :style="{minWidth: computeWidth(item.name.length)}">

          <el-tag :key="item.id" @click.prevent.stop="popClick"
                  :closable="true" :close-transition="true"
                  @close.prevent.stop="removeTagClose(item.id,$event)" style="margin-right:18px;">
           <template v-if="minNumber>0 && oriValue.length>minNumber">{{index + 1}}.</template> {{item.name}}
          </el-tag>
        </span>
      <slot name="button" v-if="!oriValue.length">
        <el-button>选择{{name}}</el-button>
      </slot>
    </div>

    <el-dialog ref="dialog" :title="'选择 ' +name" :visible.sync="popOpen" :center="true" width="80%" style="padding:20px;">
      <div class="query">
        <slot name="query"></slot>
      </div>

      <div style="text-align:right;margin:0 0 20px;">
        <el-button v-if="query_length" @click="doQuery">查询</el-button>
        <el-dropdown split-button type="primary" trigger="click"
                     @click="handleClick" v-if="this.multi">
          选择 {{dbRefValue.length}} 项
          <el-dropdown-menu slot="dropdown" title="选中对其删除" style="width:200px;">
            <el-dropdown-item v-for="item in dbRefValue" :key="item.id" :command="item.id">{{item.name}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <my-list ref="list" :url="url" :query="query" :page-size="take" @loaded="dataLoaded"
               @row-dblclick="dbClick"
               @row-click="tableRowClick">
        <el-table-column width="55" v-if="this.multi">
          <template slot-scope="scope">
            <div :class="{ 'el-icon-check': scope.row.checked}" style="color:blue"/>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          width="55">
        </el-table-column>
        <slot></slot>
      </my-list>
    </el-dialog>
  </div>
</template>
<script>
  import MyList from "./my-list.vue"

  export default {
    components: {MyList},
    name: "my-ref",
    props: {
      readOnly: {type: Boolean, default: false},
      open: {type: Boolean, default: false},
      multi: {type: Boolean, default: false}, //多选
      url: {type: String, default: ""},
      take: {type: Number, default: 10},
      minNumber: {type: Number, default: 3},
      name: {type: String, default: ""}, //多选
      id: {type: [Object, String, Number], default: ""},    //标志数据，在change时传回。
      query: {
        type: Object, default: function () {
          return {}
        }
      },
      value: {
        type: [Object, Array], default: function () {
          return []
        }
      }
    },
    data() {
      return {
        query_length: 0,
        dbRefValue: [],    //实时数据。
        oriValue: [],
        popOpen: this.open
      }
    },
    watch: {
      value: {
        deep: true,
        handler(value) {
          if (jv.dataEquals(value, this.oriValue)) return;
          if (value instanceof Array) {
            this.oriValue = value.map(it => Object.assign({}, it));
          } else if (value.id) {
            this.oriValue = [Object.assign({}, value)];
          } else {
            this.oriValue = [];
          }


          this.dbRefValue = Object.assign([], this.oriValue);
        }
      }
    },
    methods: {
      doQuery() {
        this.$refs["list"].loadData(1);
      },
      dataLoaded(res, option) {
        var json = res.data.data;
        json.forEach(it => {
          it.checked = (this.dbRefValue.findIndex(item => item.id == it.id) >= 0);
        })

        return this.$emit("loaded", res, option);
      },
      // page_Change(page){
      //   this.skip = (page -1)* this.take;
      // },
      computeWidth(charCount) {
        var ret = "";
        //1个字符宽度为10, 空为60
        if (charCount < 5) return "110px";
        if (charCount < 15) return "220px";
        return "330px";
      },
      removeTagClose(id) {
        var index = this.dbRefValue.findIndex(it => it.id == id)
        this.dbRefValue.splice(index, 1);
        this.handleClick();
        return false;
      },
      tableRowClick(row) {
        if (!this.multi) {
          return;
        }
        row.checked = !row.checked;
        var index = this.dbRefValue.findIndex(it => it.id == row.id)
        if (row.checked) {
          if (index < 0) {
            this.dbRefValue.push(row);
          } else {
            //错误.
            console.log("可能出错了.")
            console.log(this.dbRefValue)
            console.log(row)
          }
        } else {
          this.dbRefValue.splice(index, 1);
        }
      },
      popClick() {
        if (this.readOnly) {
          return;
        }

        this.dbRefValue = Object.assign([], this.oriValue);
        this.popOpen = true;

        this.$nextTick(it => {
          this.query_length = this.$refs.dialog.$el.querySelector(".query").children.length;
          this.$refs["list"].loadData(1);
        });
      },
      handleClick() {
        this.popOpen = false;

        // //比较是否相同.
        // if (jv.dataEquals(this.oriValue, this.dbRefValue)) return;

        if (this.multi) {
          this.$emit('input', this.dbRefValue);
          var changed = {added: [], deleted: []};

          //公共Id部分
          var commIds = this.dbRefValue.map(it => it.id).intersect(this.oriValue.map(it => it.id));

          //两部分。 add , delete
          this.dbRefValue.filter(newValue => {
            if (commIds.some(id => id == newValue.id) == false) {
              changed.added.push(newValue);
            }
          });

          this.oriValue.filter(oldValue => {
            if (commIds.some(id => id == oldValue.id) == false) {
              changed.deleted.push(oldValue);
            }
          });

          //比较是否相同.
          if (!changed.added.length && !changed.deleted.length) return;
          this.$emit("change", changed, this.id)
        } else {
          this.$emit('input', this.dbRefValue[0]);
          this.$emit("change", this.dbRefValue[0], this.id)
        }
        this.oriValue = Object.assign([], this.dbRefValue);
      },
      dbClick(row, event) {
        if (this.multi) return;
        this.dbRefValue = [row];

        this.handleClick();
      }
    }
  }
</script>
