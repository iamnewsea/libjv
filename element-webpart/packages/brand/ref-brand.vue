<template>
  <my-ref url="/info/brand/query"
          v-model="my_value"
          ref="list" name="品牌" @loaded="dataLoaded"
          :query="query" :multi="multi" :readOnly="readOnly">
    <el-table-column label="Logo">
      <template slot-scope="scope">
        <img :src="scope.row.logo.url" style="height:50px;" v-if="scope.row.logo.url"/>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="corp.name" label="所属修改"></el-table-column>
    <el-table-column prop="country.name" label="国别"></el-table-column>
    <el-table-column label="分类">
      <template slot-scope="scope"> {{scope.row.categories.map(function (it) {
        return it.name
      }).join(",")}}
      </template>
    </el-table-column>

    <template #query>
      <kv label="名称">
        <el-input v-model="query.name"></el-input>
      </kv>
    </template>
    <template #button>
      <slot><el-button>选择品牌</el-button></slot>
    </template>
  </my-ref>
</template>
<script>
  export default {
    name: "ref-brand",
    props: {
      readOnly: {type: Boolean, default: false},
      multi: {type: Boolean, default: false}, //多选
      value: {
        type: [Object, Array], default: function () {
          return []
        }
      }
    },
    data() {
      return {
        my_value: [],
        query: {name: ""}
      }
    },
    computed: {
    },
    watch: {
      value: {
        deep: true,
        handler(val) {
          if (jv.dataEquals(val, this.my_value)) return;

          if (val instanceof Array) {
            this.my_value = val.map(it => Object.assign({}, it));
          }
          else if (val.id) {
            this.my_value = Object.assign({}, val);
          }
          else {
            this.my_value = [];
          }
        }
      },
      my_value(val) {
        this.$emit("input", val);
      }
    },
    methods: {
      dataLoaded(res, op) {
        var json = res.data.data;
        json.forEach(it => {
          if (!it.logo) {
            it.logo = {url: ""}
          }

          if (!it.categories) {
            it.categories = []
          }
        })
      }
    }
  }
</script>
<style scoped>

</style>
