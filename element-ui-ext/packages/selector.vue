<template>
  <div class="enum">
    <template v-if="readOnly || !data2.length">
      <el-tag v-for="item in value_displays" :key="item" :type="tagType">{{item}}</el-tag>
    </template>

    <template v-else>
      <template v-if="type == 'radio'">
        <label v-if="!data2.length && value1 && labelField && value1[labelField]">{{value1[labelField]}}</label>
        <el-radio-group v-model="value1" v-else-if="data2.length <= enumCount"
                        @change="changed" :class="clearable? 'ri4c':''">
          <el-radio v-for="item in data2" :label="item[keyField]" @click.native.stop="item_click"
                    :key="item[keyField]">{{item[labelField]}}
          </el-radio>
        </el-radio-group>

        <el-select v-model="value1" placeholder="请选择" v-else :clearable="clearable"
                   @change="changed">
          <el-option
            v-for="item in data2"
            :key="item[keyField]"
            :label="item[labelField]"
            :value="item[keyField]">
          </el-option>
        </el-select>
      </template>
      <template v-else>
        <label v-if="!data2.length && labelField && value2.length">{{value2.map(it=>it[labelField]).join(",")}}</label>
        <el-checkbox-group v-model="value2" v-if="data2.length <= enumCount"
                           @change="changed(null)">
          <el-checkbox v-for="item in data2" :label="item[keyField]"
                       :key="item[keyField]">{{item[labelField]}}
          </el-checkbox>
        </el-checkbox-group>
        <el-select v-model="value2" multiple placeholder="请选择" v-else :clearable="clearable"
                   @change="changed">
          <el-option
            v-for=" item in data2"
            :key="item[keyField]"
            :label="item[labelField]"
            :value="item[keyField]">
          </el-option>
        </el-select>
      </template>
    </template>

  </div>
</template>
<script>
    export default {
        name: "selector",
        props: {
            // url 优先级 大于 data
            url: {type: String, default: ""},
            // data 如果是数组，对象深度只能是一级或零级： [{id,name } , ...]  ,["中学","小学",...]
            // 到 data2的时候，全部是一级对象。
            data: {
                type: [Object, Array], default() {
                    return []
                }
            },
            clearable: {type: Boolean, default: true},
            enum: {type: String, default: ""},
            tagType: {type: String, default: ""},
            //当data是Array的时候，需要指定 field的两个值,第一个是 key , 第2个是 value
            fields: {
                type: String, default() {
                    return ""
                }
            },
            readOnly: {type: Boolean, default: false},
            enumCount: {type: Number, default: 3}, //使用 enum方式的个数
            //radio,checkbox
            type: {type: String, default: "radio"},
            //如果是多选，是数组， 如果是单选是对象或值。
            value: {
                type: [String, Array, Boolean, Number, Object], default() {
                    return "";
                }
            },
            valueIsBoolean: {
                type: Boolean, default() {
                    return false
                }
            },
            //默认:如果是json，返回 key.如果是 valueArray ["a","b"] ，会返回值。 枚举会返回name,其它情况返回整条数据。
            //该字段仅对返回整条数据的情况有效,指定返回该条数据的哪个值
            // valueField: {type: String, default: ""}
        },
        watch: {
            url(v) {
                if (!v) {
                    return;
                }
                this.$http.post(v).then(res => {
                    this.setData(res.data.data);
                });
            },
            data: {
                deep: true, handler(v) {
                    if (jv.dataEquals(v, this.data2)) {
                        return;
                    }

                    this.setData(v);
                }
            },
            enum(v) {
                this.setData();
            },
            fields(v) {
                this.setFields()
            },
            value: {
                deep: true, handler(v) {
                    this.setValue(v);
                }
            },
        },
        computed: {
            value_displays() {
                var v2 = [];
                if (this.type == "radio") {
                    if (this.value1) {
                        v2 = [this.value1];
                    }
                } else {
                    v2 = this.value2;
                }

                var getKey = (item) => {
                    if (this.keyField) {
                        return item[this.keyField];
                    }
                    return item;
                };

                var getValue = (item) => {
                    if (this.labelField) {
                        return item[this.labelField];
                    }
                    return item;
                };

                if (this.data2.length) {
                    return this.data2.filter(it => v2.includes(getKey(it))).map(it => getValue(it));
                }

                return v2.map(it => getValue(it));
            }
        },
        data() {
            return {
                //内部使用的数据
                data2: [],
                //单选的值
                value1: "",
                //多选的值
                value2: [],
                //数据绑定的 keyField
                keyField: "",
                //数据绑定的 labelField
                labelField: "",
                dataIsEnum: false,
                dataIsValueArray: false,
                dataIsObject: false,
                value1_click_v1: "", //click下会有两次点击，记录第一次点击时的值
            };
        },
        created() {
            // this.label2 = ""; // readOnly 显示时用。
            this.init();
        },
        methods: {
            item_click(e) {
                if (!this.clearable) {
                    return;
                }
                var t = e.target;//.closest(".el-radio").getElementsByTagName("input")[0];
                if (!t || t.tagName != "INPUT") {
                    this.value1_click_v1 = t.closest(".el-radio").getElementsByTagName("input")[0].checked;
                    return
                }

                if (!this.value1_click_v1) {
                    return;
                }

                t.checked = false;
                this.value1 = "";
                this.changed();
            },
            init() {
                if (this.url) {
                    this.$http.post(this.url).then(res => {
                        this.setData(res.data.data);
                    });
                } else {
                    this.setData();
                }
            },
            changed(v) {
                var ret;
                if (this.type == "radio") {
                    if (jv.isNull(v)) {
                        v = this.value1;
                    }

                    if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray) {
                        ret = v;

                    } else {
                        ret = this.data2.find(it => it[this.keyField] == v)
                        // if (this.valueField) {
                        //     ret = ret[this.valueField]
                        // }
                    }

                    if (this.valueIsBoolean) {
                        ret = jv.asBoolean(ret)
                    }
                } else {
                    if (jv.isNull(v)) {
                        v = this.value2;
                    }

                    if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray) {
                        ret = v;
                    } else {
                        ret = this.data2.filter(it => v.includes(it[this.keyField]));
                        // if (this.valueField) {
                        //     ret = ret.map(it => it[this.valueField])
                        // }
                    }

                    if (this.valueIsBoolean) {
                        ret = ret.map(it => jv.asBoolean(it))
                    }
                }
                this.$emit("input", ret);
                this.$emit("change", ret)
                return;
            },
            dblclick() {
                if (this.readOnly) {
                    return;
                }
                if (this.type == "radio") {
                    this.value1 = "";
                } else {
                    this.value2 = [];
                }
                this.changed();
            },
            setValue(v) {
                v = jv.isNull(v) ? this.value : v;

                if (this.type == "radio") {
                    if (jv.isNull(v)) {
                        this.value1 = "";
                        return;
                    }

                    if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray || !this.keyField) {
                        if (this.valueIsBoolean) {
                            this.value1 = jv.asString(v)
                        } else {
                            this.value1 = v;
                        }
                        return;
                    }

                    var v2 = v[this.keyField];

                    this.value1 = this.valueIsBoolean ? jv.asString(v2) : v2;
                    return;
                }

                if (v === null) {
                    v = [];
                }

                if (jv.dataEquals(v, this.value2)) {
                    return;
                }
                // if (jv.isNull(v)) {
                //     this.value2 = [];
                //     return;
                // }


                //解决 boolean类型问题
                if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray) {
                    if (this.valueIsBoolean) {
                        this.value2 = v.map(it => jv.asBoolean(it));
                    } else {
                        this.value2 = v;
                    }
                    return;
                }
                this.value2 = v.map(it => {
                    var rv = it[this.keyField];
                    if (this.valueIsBoolean) {
                        return jv.asBoolean(rv);
                    }
                    return rv;
                });
            },
            setFields() {
                var def_fields = "";
                if (this.dataIsEnum) {
                    def_fields = "name,remark";
                } else if (this.dataIsValueArray || this.dataIsObject) {
                    def_fields = "value,label"
                }
                var fields = (this.fields || def_fields).split(",");
                this.keyField = fields[0];
                this.labelField = fields[1];
            },
            setData(data) {
                if (this.enum) {
                    var data2 = jv[this.enum];
                    if (data2 && data2.Type == "jvEnum") {
                        this.dataIsEnum = true;
                        data = data2.getData();
                        type = data.Type;
                    }
                } else {
                    data = data || this.data;
                }

                if (jv.isNull(data)) {
                    this.data2 = [];
                    return;
                }

                var type = data.Type;

                if (["object", "map"].includes(type)) {
                    this.dataIsObject = true;
                } else if (["array", "set"].includes(type)) {
                    var v0 = data[0];
                    if (jv.isNull(v0) == false) {
                        this.dataIsValueArray = !v0.ObjectType;
                    }
                }

                this.setFields();
                this.setValue();

                var d2 = [];
                if (this.dataIsObject) {
                    for (var key of Object.keys(data)) {
                        var value = data[key];
                        var item = {};
                        item[this.keyField] = key;
                        item[this.labelField] = value;
                        d2.push(item);
                    }
                } else if (this.dataIsValueArray) {
                    d2 = data.map(it => {
                        return {value: it, label: it}
                    });
                } else {
                    d2 = data;
                }

                if (jv.dataEquals(this.data2, d2)) {
                    return;
                }

                this.data2 = d2;

                //如果是单选，并且只有一个，自动选择。
                if(this.type == "radio" && d2.length == 1){
                    this.value1 = d2[0][this.keyField];
                    this.changed();
                }
            }
        }
    }
</script>
<style scoped>
  .v .enum {
    margin-left: 8px;
  }

  >>> .ri4c .el-radio__input.is-checked .el-radio__inner:hover {
    border-radius: 0;
  }

  >>> .ri4c .el-radio__input.is-checked .el-radio__inner:hover:after {
    border-radius: 0;
  }
</style>
