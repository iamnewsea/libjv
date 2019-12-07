<template>
  <div class="enum" @dblclick="value2 = ''">
    <template v-if="mode == 'radio'">
      <el-radio-group v-model="value2" v-bind="[$props, $attrs]">
        <el-radio v-for="(item,index) in data" :label="keyField ? item[keyField] : item "
                  :key="index">{{valueField ? item[valueField] : item}}
        </el-radio>
      </el-radio-group>
    </template>
    <template v-else>
      <el-checkbox-group v-model="value2" v-bind="[$props, $attrs]">
        <el-checkbox v-for="(item,index) in data" :label="keyField ? item[keyField] : item "
                     :key="index">{{valueField ? item[valueField] : item}}
        </el-checkbox>
      </el-checkbox-group>
    </template>
  </div>
</template>
<script>
    export default {
        name: "selector",
        props: {
            data: {type: Array, default: []},
            field: {
                type: String, default() {
                    return "id,name"
                }
            },
            mode: {type: String, default: "radio"},
            value: {
                type: [String, Array, Object], default() {
                    return ""
                }
            }
        },
        watch: {
            value: {
                deep: true, handler(v) {
                    if (jv.dataEquals(v, this.value2)) {
                        return;
                    }
                    this.value2 = v;
                }
            },
            value2: {
                deep: true, handler(v) {

                    if (jv.dataEquals(v, this.value)) {
                        return;
                    }
                    this.$emit("input", v);
                }
            }
        },
        data() {
            return {
                value2: this.mode == "radio" ? "" : [],
                keyField: "",
                valueField: ""
            };
        },
        mounted() {
            var fields = (this.field || "").split(",")
            this.keyField = fields[0];
            this.valueField = fields[1];
        }
    }
</script>
<style>
  .v .enum {
    margin-left: 8px;
  }
</style>
