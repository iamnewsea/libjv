<template>
  <el-cascader style="width:100%" placeholder="请选择地区"
               :props="props_data"
               :emitPath="false"
               @change="cityChange"
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
            return {
                cityValue: [],
                props_data: {
                    lazy: true,
                    lazyLoad(node, resolve) {
                        jv.city.loadChildren(!node.level ? 0 : node.value,resolve );
                    }
                }
            }
        },

        watch: {
            value: {
                deep: true, immediate: true,
                handler(value) {
                    var code = value && value.code || "";
                    jv.city.confirm(code, it => {
                        this.cityValue = jv.city.getEachCitys(code).map(it => it.value);
                    })
                }
            }
        },
        methods: {
            cityChange(vals) {
                var code = vals.last();
                var city = jv.city.getByCode(code);
                this.$emit("input", {code: city.value, name: city.label});
            }
        }
    }
</script>
<style>


</style>
