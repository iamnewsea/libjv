<template>
  <div class="enum">
    <template v-if="!data2.length">
      <label>{{nodata_display}}</label>
    </template>

    <template v-if="readOnly">
      <el-tag v-for="item in value_displays" :key="item" :type="tagType">{{item}}</el-tag>
    </template>

    <template v-else>
      <template v-if="type == 'radio'">
        <el-radio-group v-model="value1" v-if="data2.length <= enumCount"
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
            url: {
                type: String, default() {
                    return ""
                }
            },
            urlMethod: {
                type: String, default() {
                    return "post"
                }
            },
            urlDataPath: {
                type: String, default() {
                    return "data"
                }
            },   //数据在返回json的路径
            // data 如果是数组，对象深度只能是一级或零级： [{id,name } , ...]  ,["中学","小学",...]
            // 到 data2的时候，全部是一级对象。
            data: {
                type: [Object, Array], default() {
                    return []
                }
            },
            clearable: {
                type: Boolean, default() {
                    return true
                }
            },
            enum: {
                type: String, default() {
                    return ""
                }
            },
            tagType: {
                type: String, default() {
                    return ""
                }
            },
            /**
             * 当data是Array的时候，需要指定 field的两个值,第一个是 key , 第2个是 value
             *
             * 返回值是选择对象的哪个属性。
             * 如果是 枚举, valueIsBoolean ,valueArray ,valueIsObject 那么 $emit的值是 item.value。
             * 如果想返回值是某个值， fields的值部分，使用 #开头。一般第一项是返回的keyField。
             *
             * 如果在卡片上： <selector  v-model="info.park" url="url" fields="code,name" />
             * 如果是查询条件： <selector  v-model="info.park" url="url" fields="#code,name"/>
             */
            fields: {
                type: String, default() {
                    return ""       //enum时默认是name,remark ， array时默认是value,label
                }
            },
            readOnly: {
                type: Boolean, default() {
                    return false
                }
            },
            enumCount: {
                type: Number, default() {
                    return 3
                }
            }, //使用 enum方式的个数
            //radio,checkbox
            type: {
                type: String, default() {
                    return "radio"
                }
            },
            //如果是多选，是数组， 如果是单选是对象或值。
            value: {
                type: [String, Array, Boolean, Number, Object], default() {
                    return "";
                }
            }
            // valueIsBoolean: {
            //     type: Boolean, default() {
            //         return false
            //     }
            // },
            //默认:如果是json，返回 key.如果是 valueArray ["a","b"] ，会返回值。 枚举会返回name,其它情况返回整条数据。
            //该字段仅对返回整条数据的情况有效,指定返回该条数据的哪个值
            // valueField: {type: String, default: ""}
        },
        watch: {
            url: {
                immediate: true, handler(v) {
                    if (!v) {
                        return;
                    }
                    var method = (this.urlMethod || "post").toLowerCase();

                    this.$http[method](v).then(res => {
                        this.setData(jv.evalExpression(res.data, this.urlDataPath));
                    });
                }
            },
            data: {
                deep: true, immediate: true, handler(v) {
                    if (jv.dataEquals(v, this.data2)) {
                        return;
                    }

                    this.setData(v);
                }
            },
            enum(v) {
                this.setData();
            },
            fields: {
                immediate: true, handler(v) {
                    this.setFields()
                }
            },
            value: {
                deep: true, immediate: true, handler(v) {
                    this.setValue(v);
                }
            },
        },
        computed: {
            nodata_display() {
                if (this.type == "radio") {
                    if (this.labelField) {
                        return this.value1 && this.value1[this.labelField];
                    } else {
                        return this.value1;
                    }
                }
                if (this.labelField) {
                    return this.value2 && this.value2.length && this.value2.map(it => it[labelField]).join(",")
                } else {
                    return this.value2 && this.value2.length && this.value2.join(",")
                }
            },
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
                valueIsBoolean: false,    //如果 data 包含 true,false 或 value值为boolean
                valueIsNumber: false,    //如果 data 只包含 数字Key！
                returnValueField: "",     //获取 fields 中[]包裹项
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
                    var method = (this.urlMethod || "post").toLowerCase();
                    this.$http[method](this.url).then(res => {
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
                        if (this.keyField == this.returnValueField) {
                            ret = v;
                        } else {
                            ret = this.data2.find(it => it[this.keyField] == v)

                            if (this.returnValueField) {
                                ret = jv.evalExpression(ret, this.returnValueField);
                            }
                        }
                        // if (this.valueField) {
                        //     ret = ret[this.valueField]
                        // }
                    }


                    //保留空值不转换
                    if (jv.isNull(ret) || (ret === "")) {
                        ret = "";
                    } else if (this.valueIsBoolean) {
                        ret = jv.asBoolean(ret)
                    } else if (this.valueIsNumber) {
                        ret = jv.asInt(ret);
                    }

                } else {
                    if (jv.isNull(v)) {
                        v = this.value2;
                    }


                    // if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray || (this.keyField == this.returnValueField)) {
                    //     ret = v;
                    // } else {
                    //
                    //
                    //     if (this.returnValueField) {
                    //         ret = ret.map(it => jv.evalExpression(it, this.returnValueField));
                    //     }
                    //     else{
                    //         ret = this.data2.filter(it => v.includes(it[this.keyField]));
                    //     }
                    //
                    //     // if (this.valueField) {
                    //     //     ret = ret.map(it => it[this.valueField])
                    //     // }
                    // }

                    if (this.valueIsBoolean) {
                        ret = ret.map(it => jv.asBoolean(it))
                    } else if (this.valueIsNumber) {
                        ret = ret.map(it => jv.asInt(it))
                    }
                }
                this.$emit("input", ret);
                this.$emit("change", ret);
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
            //可能是对象，也可能是值。在处理之前，先转成值。
            setValue(v) {
                v = jv.isNull(v) ? this.value : v;

                if (this.type == "radio") {
                    if (jv.isNull(v) || (v === "")) {
                        this.value1 = "";
                        return;
                    }

                    //如果 v 是对象，先转成值
                    var type = v.Type;
                    if (["map", "object"].includes(type)) {
                        if (!this.keyField) {
                            return;
                        }

                        v = v[this.keyField];
                    }

                    if (this.valueIsBoolean) {
                        v = jv.asBoolean(v)
                    } else if (this.valueIsNumber) {
                        v = jv.asInt(v);
                    }
                    // if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray || (this.returnValueField == this.keyField)) {
                    //
                    // }
                    //
                    //
                    // var v2 = v[this.keyField];

                    this.value1 = v;
                    return;
                }

                if (v === null) {
                    v = [];
                }

                var type = v.Type;
                //如果 v 是对象，先转成值
                if (["array", "set"].includes(type)) {
                    v = v.map(it => it[this.keyField]);
                }

                if (jv.dataEquals(v, this.value2)) {
                    return;
                }
                // if (jv.isNull(v)) {
                //     this.value2 = [];
                //     return;
                // }


                //解决 boolean类型问题
                // if (this.dataIsEnum || this.dataIsObject || this.dataIsValueArray || (this.returnValueField == this.keyField)) {
                //     if (this.valueIsBoolean) {
                //         this.value2 = v.map(it => jv.asBoolean(it));
                //     } else {
                //         this.value2 = v;
                //     }
                //     return;
                // }
                //
                // this.value2 = v.map(it => {
                //     var rv = it[this.keyField];
                //     if (this.valueIsBoolean) {
                //         return jv.asBoolean(rv);
                //     }
                //     return rv;
                // });


                if (this.valueIsBoolean) {
                    v.map(it => jv.asBoolean(it))
                } else if (this.valueIsNumber) {
                    v.map(it => jv.asInt(it))
                }

                this.value2 = v;
            },
            setFields() {
                var fields = (this.fields || "").split(",");
                var keyField = "";
                var valueField = "";
                if (this.dataIsEnum) {
                    keyField = fields[0] || "name";
                    valueField = fields[1] || "remark";

                } else if (this.dataIsValueArray || this.dataIsObject) {
                    keyField = fields[0] || "value";
                    valueField = fields[1] || "label";
                } else {
                    keyField = fields[0] || "id";
                    valueField = fields[1] || "name";
                }

                keyField = keyField.trim();
                valueField = valueField.trim();

                if (keyField.startsWith("#")) {
                    keyField = keyField.slice(1);
                    this.returnValueField = keyField;
                }

                if (valueField.startsWith("#")) {
                    valueField = valueField.slice(1);
                    this.returnValueField = valueField;
                }

                this.keyField = keyField;
                this.labelField = valueField;
            },
            setData(data) {
                if (this.enum) {
                    var data2 = jv.enum[this.enum];
                    if (data2) {
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
                    var keys = Object.keys(data);
                    if (("true" in data) && ("false" in data) && keys.length < 4) {
                        this.valueIsBoolean = true;
                    } else if (keys.every(it => it.IsNumberFormat())) {
                        this.valueIsNumber = true;
                    }

                    this.setFields();
                } else if (["array", "set"].includes(type)) {
                    this.setFields();
                    var v0 = data[0];
                    if (jv.isNull(v0) == false) {
                        this.dataIsValueArray = !v0.ObjectType;
                    }

                    var keys = data.map(it => it[this.keyField].toString());
                    if (keys.filter(it => {
                        return (it === "true") || (it === "false");
                    }).length == 2) {
                        this.valueIsBoolean = true;
                    } else if (keys.every(it => it.IsNumberFormat())) {
                        this.valueIsNumber = true;
                    }
                }

                this.setValue();

                var d2 = [];
                if (this.dataIsObject) {
                    var keys = Object.keys(data)
                    for (var key of keys) {
                        var value = data[key];

                        var item = {};
                        if (this.valueIsBoolean) {
                            item[this.keyField] = jv.asBoolean(key);
                        } else if (this.valueIsNumber) {
                            item[this.keyField] = jv.asInt(key);
                        } else {
                            item[this.keyField] = key;
                        }
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
                if (this.type == "radio" && d2.length == 1) {
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
