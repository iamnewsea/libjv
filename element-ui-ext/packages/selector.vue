<template>
  <div class="enum" @dblclick="value2 = ''">
    <template v-if="mode == 'radio'">
      <el-radio-group v-model="value2" v-bind="[$props, $attrs]">
        <el-radio v-for="(value,key) in data2" :label="key"
                  :key="key">{{value}}
        </el-radio>
      </el-radio-group>
    </template>
    <template v-else>
      <el-checkbox-group v-model="value2" v-bind="[$props, $attrs]">
        <el-checkbox v-for="(value,key) in data2" :label="key"
                     :key="key">{{value}}
        </el-checkbox>
      </el-checkbox-group>
    </template>
  </div>
</template>
<script>
    export default {
        name: "selector",
        props: {
            data: {type: [Object, Array], default: []},
            //当 data 是 Array的时候，需要指定 field中的两个值 。 当data是Object的时候，指定 一个field 表示显示的值
            field: {
                type: String, default() {
                    return ""
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
                data2: {},
                value2: this.mode == "radio" ? "" : [],
                keyField: "",
                valueField: ""
            };
        },
        created() {
            var fields = (this.field || "").split(",")
            this.keyField = fields[0];
            this.valueField = fields[1];

            this.setData();

        }, methods: {
            setData() {
                if (jv.IsNull(this.data)) {
                    this.data2 = {};
                    return;
                }

                var dataType = this.data.Type;

                var d2 = {};
                if (["set", "array"].includes(dataType)) {
                    for (var i = 0, len = this.data.length; i < len; i++) {
                        var item = this.data[i];
                        d2[this.keyField ? item[this.keyField] : item] = this.valueField ? item[this.valueField] : item;
                    }
                } else {
                    for (var key of Object.keys(this.data)) {
                        var value = this.data[key];
                        d2[key] = this.keyField ? value[this.keyField] : value;
                    }
                }

                this.data2 = d2;
            }
        }
    }
</script>
<style>
  .v .enum {
    margin-left: 8px;
  }
</style>
