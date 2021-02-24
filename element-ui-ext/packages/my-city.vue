<template>
    <el-cascader class="my-city" placeholder="请选择地区"
                 :props="props_data"
                 :multiple="multiple"
                 :emitPath="false"
                 @change="cityChange"
                 v-model="cityValue"
                 v-bind="$attrs"
    >
    </el-cascader>
</template>
<script type="text/javascript">
import jv from "./vue-city"

export default {
    name: 'my-city',
    props: {
        multiple: {
            type: Boolean, default: () => false
        },
        //对直辖市来说，1=2
        level: {
            type: [String, Number], default: () => 3
        },
        value: {
            type: [Object, Array]
            , default: () => {
                return {code: "", name: ""}
            }
        }
    },
    data() {
        return {
            cityValue: [],
            props_data: {
                lazy: true,
                lazyLoad: this.lazyLoad
            }
        }
    },
    watch: {
        value: {
            deep: true, immediate: true,
            handler(value) {
                var code = value && value.code || "";
                if (!code) {
                    this.cityValue = [];
                    return;
                }
                jv.city.confirm(code, this.level, it => {
                    this.cityValue = jv.city.getEachCitys(code).map(it => it.value);
                    // console.log(jv.cityData);
                })
            }
        }
    },
    methods: {
        lazyLoad(node, resolve) {
            jv.city.loadChildren(!node.level ? 0 : node.value, jv.asInt(this.level), it => {
                resolve(it);
            });
        },
        cityChange(vals) {
            var code = vals.last(),
                city = jv.city.getByCode(code);

            if (!city) {
                throw new Error("找不到城市:" + code);
            }
            //不传 name , 服务器自动设置name
            this.$emit("input", {code: city.value});
        }
    }
}
</script>
<style scoped>
.my-city {
    width: 100%;
}


</style>
