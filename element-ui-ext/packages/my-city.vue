<template>
  <el-cascader style="width:100%" placeholder="请选择地区"
               :options="citys"
               @active-item-change="cityChanges"
               @change="cityChange"
               :props="{value: 'c', label: 'n', children: 's'}"
               v-model="cityValue">
  </el-cascader>
</template>
<script type="text/javascript">
  import jv from "./vue-city"

  export default {
    name: 'my-city',
    props: {
      value: {type: Object, default: {code: "", name: ""}}
    },
    data() {
      return {cityValue: []}
    },
    computed: {
      citys() {
        return jv.citys;
      }
    },
    watch: {
      value: {
        deep: true, handler(value) {
          var code = value && value.code || "";
          jv.citys.confirm(code, it => {
            this.cityValue = jv.citys.getEachCitys(code).map(it => it.c);
          })
        }
      }
    },
    methods: {
      cityChange(vals){
        var city = jv.citys.findByCode(vals.last());
        this.$emit("input", {code: city.c, name: city.n});
      },
      cityChanges(vals) {
        var city = jv.citys.findByCode(vals.last());
        this.$emit("input", {code: city.c, name: city.n});
        jv.citys.loadChildCitys(vals.last())
      }
    }
  }
</script>
<style>


</style>
