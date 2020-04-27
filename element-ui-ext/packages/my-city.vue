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
            return {cityValue: [], citys: jv.citys}
        },

        watch: {
            value: {
                deep: true, handler(value) {
                    var code = value && value.code || "";
                    jv.confirmCity(code, it => {
                        this.cityValue = jv.getEachCitys(this.citys, code).map(it => it.c);
                    })
                }
            }
        },
        methods: {
            cityChange(vals) {
                var city = jv.findCityByCode(vals.last());
                this.$emit("input", {code: city.c, name: city.n});
            },
            cityChanges(vals) {
                var city = jv.findCityByCode(vals.last());
                this.$emit("input", {code: city.c, name: city.n});
                jv.loadChildCitys(vals.last())

                this.citys = jv.citys;
            }
        }
    }
</script>
<style>


</style>
