<template>
  <div class="enum" @dblclick="value2 = ''">
    <template v-if="mode == 'radio'">
      <el-radio-group v-model="value2" v-bind="[$props, $attrs]" v-if="Object.keys(data2).length <= enumCount">
        <el-radio v-for="(value,key) in data2" :label="key"
                  :key="key">{{value}}
        </el-radio>
      </el-radio-group>
      <el-select v-model="value2" placeholder="请选择" v-else>
        <el-option
          v-for="(value,key) in data2"
          :key="key"
          :label="value"
          :value="key">
        </el-option>
      </el-select>
    </template>
    <template v-else>
      <el-checkbox-group v-model="value2" v-bind="[$props, $attrs]" v-if="Object.keys(data2).length <= enumCount">
        <el-checkbox v-for="(value,key) in data2" :label="key"
                     :key="key">{{value}}
        </el-checkbox>
      </el-checkbox-group>
      <el-select v-model="value2" multiple  placeholder="请选择" v-else>
        <el-option
          v-for="(value,key) in data2"
          :key="key"
          :label="value"
          :value="key">
        </el-option>
      </el-select>
    </template>
  </div>
</template>
<script>
    export default {
        name: "selector",
        props: {
            url: {type: String, default: ""},
            data: {type: [Object, Array], default: []},

            //当 data 是 Array的时候，需要指定 field中的两个值 。 当data是Object的时候，指定 一个field 表示显示的值
            field: {
                type: String, default() {
                    return ""
                }
            },
            enumCount: {type: Number, default: 3}, //使用 enum方式的个数
            mode: {type: String, default: "radio"},
            value: {
                type: [String, Array, Object], default() {
                    return ""
                }
            }
        },
        watch: {
            data: {
                deep: true, handler(v) {
                    if (jv.dataEquals(v, this.data2)) {
                        return;
                    }
                    this.setData(v);
                }
            },
            url(v) {
                if (jv.dataEquals(v, this.url)) {
                    return;
                }
                this.$http.post(v).then(res => {
                    this.setData(res.data.data);
                });
            },
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
            this.value2 = this.value;
            this.init();

        }, methods: {
            init() {
                if (this.url) {
                    this.$http.post(this.url).then(res => {
                        this.setData(res.data.data);
                    });
                } else {
                    this.setData(this.data);
                }
            },
            setData(data) {
                if (jv.IsNull(data)) return;
                var dataType = data.Type;

                var d2 = {};
                if (["set", "array"].includes(dataType)) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var item = data[i];
                        d2[this.keyField ? item[this.keyField] : item] = this.valueField ? item[this.valueField] : item;
                    }
                } else {
                    for (var key of Object.keys(data)) {
                        var value = data[key];
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
