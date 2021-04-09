<template>
    <div class="enum" v-bind="$attrs">
        <template v-if="!data2.length">
            <slot name="empty"><label>{{ nodata_display }}</label></slot>
        </template>

        <template v-else-if="readOnlyStyle">
            <label v-for="item in value_displays" :key="item">{{ item }}</label>
        </template>

        <template v-else-if="keyField && labelField">
            <template v-if="type == 'radio'">
                <el-radio-group :size="size" v-model="value1" v-if="data2.length <= enumCount"
                                @change="changed" :class="clearable? 'ri4c':''">
                    <component :is="buttonStyle? 'el-radio-button': 'el-radio'" v-for="item in data2"
                               :label="item[keyField]" @click.native.stop="item_click"
                               :key="item[keyField]">{{ item[labelField] }}
                    </component>
                </el-radio-group>

                <el-select :size="size" v-model="value1" placeholder="请选择" v-else :clearable="clearable"
                           @change="changed" style="width:100%">
                    <el-option
                        v-for="item in data2"
                        :key="item[keyField]"
                        :label="item[labelField]"
                        :value="item[keyField]">
                    </el-option>
                </el-select>
            </template>
            <template v-else>
                <el-checkbox-group :size="size" v-model="value2" v-if="data2.length <= enumCount"
                                   @change="changed(null)">
                    <component :is="buttonStyle? 'el-checkbox-button' :'el-checkbox'" v-for="item in data2"
                               :label="item[keyField]"
                               :key="item[keyField]">{{ item[labelField] }}
                    </component>
                </el-checkbox-group>
                <el-select :size="size" v-model="value2" multiple placeholder="请选择" v-else :clearable="clearable"
                           @change="changed" style="width:100%">
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
        //如果是 url ，是否启用缓存，缓存对象 jv.cache
        cache: {
            type: Boolean, default() {
                return false
            }
        },
        buttonStyle: {
            type: Boolean, default() {
                return false;
            }
        },
        size: {
            type: String, default() {
                return "small"
            }
        },
        //数据在返回json的路径
        // data 如果是数组，对象深度只能是一级或零级： [{id,name } , ...]  ,["中学","小学",...]
        // 到 data2的时候，全部是一级对象。
        data: {
            type: [Object, Array], default() {
                return []
            }
        },
        clearable: {
            type: Boolean, default() {
                return false
            }
        },
        enum: {
            type: String, default() {
                return ""
            }
        },
        /**
         * 当data是Array的时候，需要指定 field的两个值,第一个是 key , 第2个是 value
         * v-model 永远表示 keyField
         * 如果是 枚举, valueIsBoolean ,valueArray ,valueIsObject 那么 $emit的值是 item.value。
         * 如果想返回值是某个值， fields的值部分，使用 #开头。一般第一项是返回的keyField。
         *
         * 如果想返回对象， v-model == {code,name} ：
         *  <selector v-model="info.park.code" url="url" fields="code,name" @change="(v,m)=>info.park.name = m.name"/>
         *  或
         *  <selector v-model="info.park.code" url="url" fields="code,name" @change="(v,m)=>info.park = m"/>
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
        //使用 enum方式的个数
        enumCount: {
            type: Number, default() {
                return 3
            }
        },
        //radio,checkbox
        type: {
            type: String, default() {
                return "radio"
            }
        },
        //如果是多选，是数组， 如果是单选是对象或值。
        //value 必须是 keyField 的内容。
        value: {
            type: [Array, Object], default() {
                return "";
            }
        },
        emptyText: {
            type: String, default() {
                return "(空)"
            }
        }
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
                this.ajaxUrl(v);
            }
        },
        data: {
            deep: true, immediate: true, handler(data) {
                if (!data) return;

                var type = data.Type;

                if (["object", "map"].includes(type)) {
                    var keys = Object.keys(data);
                    if (!keys.length) {
                        this.setData([]);
                        return;
                    }
                    if (("true" in data) && ("false" in data) && keys.length < 4) {
                        this.valueIsBoolean = true;
                    } else if (keys.every(it => it.isNumberFormat())) {
                        this.valueIsNumber = true;
                    }

                    if (this.valueIsBoolean) {
                        data = keys.map(it => {
                            return {name: it ? jv.asBoolean(it) : it, remark: data[it]};
                        });
                    } else {
                        data = keys.map(it => {
                            return {name: it, remark: data[it]};
                        });
                    }

                    this.keyField = "name"
                    this.labelField = "remark"
                }

                this.setData(data);
            }
        },
        enum: {
            immediate: true, handler(v) {
                if (!v) return;
                this.keyField = "name";
                this.labelField = "remark";
                var data = jv.enum[v];

                this.setData(data && data.getData() || []);
            }
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
        readOnly: {
            immediate: true, handler(v) {
                this.readOnlyStyle = v;
            }
        }
    },
    computed: {
        nodata_display() {
            if (this.type == "radio") {
                if (this.labelField) {
                    return this.value1 && this.value1[this.labelField] || this.emptyText;
                } else {
                    return this.value1 || this.emptyText;
                }
            }
            if (this.labelField) {
                return this.value2 && this.value2.map(it => it[this.labelField]).join(",") || this.emptyText
            } else {
                return this.value2 && this.value2.join(",") || this.emptyText
            }
        },
        value_displays() {
            var v2 = [];
            if (this.type == "radio") {
                if (!jv.isNull(this.value1)) {
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
            return v2;
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
            readOnlyStyle: false,
            dataIsValueArray: false,
            valueIsBoolean: false,    //如果 data 包含 true,false 或 value值为boolean
            valueIsNumber: false,    //如果 data 只包含 数字Key！

            value1_click_v1: "", //click下会有两次点击，记录第一次点击时的值
        };
    },
    created() {
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
        ajaxUrl(url) {
            url = url || this.url;

            if (!url) {
                this.setData([]);
                return;
            }

            var method = (this.urlMethod || "post").toLowerCase();

            if (this.cache) {
                var data = jv.cache["[selector]" + url];
                if (data) {
                    return this.setData(data);
                }
            }

            var query = {};
            this.$emit("param", query);
            //请求的是标准的列表接口，也可以直接返回 list
            this.$http[method](url, query).then(res => {
                this.$emit("loaded", res);
                var data = res.data;
                if (!data) {
                    this.setData([]);
                    return;
                }

                if (data.Type == "object") {
                    //是标准的列表接口
                    data = data.data;
                }
                // else data.Type == "array"

                if (this.cache) {
                    jv.cache["[selector]" + url] = data;
                }
                this.setData(data);
            });
        },
        changed(set_v) {
            var v = set_v, fullModel;
            if (this.type == "radio") {
                if (jv.isNull(v)) {
                    v = this.value1;
                }

                var nv = v;
                //保留空值不转换
                if (jv.isNull(v) || (v === "")) {
                    v = "";
                    nv = "";
                } else if (this.valueIsBoolean) {
                    nv = jv.asBoolean(v)
                } else if (this.valueIsNumber) {
                    nv = jv.asInt(v);
                }

                //先使用字符串格式值对 data2进行查找。
                fullModel = this.data2.filter(it => it[this.keyField] == v)[0];

                v = nv;
            } else {
                if (jv.isNull(v)) {
                    v = this.value2;
                }

                v = v.filter(it => !jv.isNull(it));

                var nv = v;
                if (this.valueIsBoolean) {
                    nv = v.map(it => jv.asBoolean(it))
                } else if (this.valueIsNumber) {
                    nv = v.map(it => jv.asInt(it))
                }

                //先使用字符串格式值对 data2进行查找。
                fullModel = this.data2.filter(it => it[this.keyField] == v);

                v = nv;
            }
            this.$emit("input", v);
            this.$emit("change", v, fullModel || {});
            return;
        },
        dblclick() {
            if (this.readOnlyStyle) {
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
            if (this.type == "radio") {
                this.setValue_1(v);
                return;
            }

            this.setValue_2(v);
        },
        setFields() {
            if (!this.fields) {
                return;
            }
            var fields = (this.fields || "").split(",");
            var keyField = fields[0] || "";
            var labelField = fields[1] || "";

            keyField = keyField.trim();
            labelField = labelField.trim();

            // if (keyField.startsWith("#")) {
            //     keyField = keyField.slice(1);
            //     this.vmodelFiled = keyField;
            // } else if (labelField.startsWith("#")) {
            //     labelField = labelField.slice(1);
            //     this.vmodelFiled = labelField
            // }
            // else{
            //     this.vmodelFiled = keyField;
            // }

            this.keyField = keyField;
            this.labelField = labelField;
        },
        setData(data) {
            if (jv.dataEquals(data, this.data2)) {
                return;
            }

            if (jv.isNull(data)) {
                data = [];
            }

            this.$emit("proc", data);

            var type = data.Type;
            if (["array", "set"].includes(type) && data.length) {
                var v0 = data[0];
                if (jv.isNull(v0) == false) {
                    this.dataIsValueArray = !v0.ObjectType;
                }

                if (this.dataIsValueArray) {
                    this.keyField = "name"
                    this.labelField = "remark"

                    data = data.map(it => {
                        return {name: it, remark: it}
                    });
                } else {
                    if (!this.keyField) {
                        //如果只有有两个，其中一个为 remark, 或 name.
                        var fields = Object.keys(v0);
                        if (fields.length >= 2) {
                            var remark_index = fields.indexOf("remark");
                            var name_index = fields.indexOf("name");
                            var id_index = fields.indexOf("id");

                            if (id_index >= 0) {
                                this.keyField = "id"
                                this.labelField = fields[id_index ? 0 : 1]
                            } else if (remark_index >= 0) {
                                this.keyField = fields[remark_index ? 0 : 1]
                                this.labelField = "remark"
                            } else if (name_index >= 0) {
                                this.keyField = fields[name_index ? 0 : 1]
                                this.labelField = "name"
                            }
                        }
                    }

                    if (!this.keyField) {
                        throw new Error("selector keyField不能为空！")
                    }

                    //需要提前定义 fields
                    var keys = data.map(it => it[this.keyField].toString());
                    if (keys.filter(it => {
                        return (it === "true") || (it === "false");
                    }).length == 2) {
                        this.valueIsBoolean = true;
                    } else if (keys.every(it => it.isNumberFormat())) {
                        this.valueIsNumber = true;
                    }
                }
            }

            this.setValue();

            if (jv.dataEquals(this.data2, data)) {
                return;
            }

            this.data2 = data.map(it => it)

            //如果是单选，并且只有一个，自动选择。
            if (this.type == "radio") {
                if (data.length == 1) {
                    this.value1 = data[0][this.keyField];
                }

                this.changed();
            }
        },
        //设置单选值
        setValue_1(v) {
            if (jv.isNull(v)) {
                v = this.value1;

                if (jv.isNull(v)) {
                    v = "";
                }
            }

            if (v === "") {
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
        },

        //设置多选值
        setValue_2(v) {
            if (jv.isNull(v)) {
                v = this.value2;

                if (jv.isNull(v)) {
                    v = [];
                }
            }

            if (["array", "set"].includes(v.Type) == false) {
                v = [];
            }

            v = v.filter(it => !jv.isNull(it));

            if (!v.length) {
                this.value2 = [];
                return;
            }

            //如果 v 是对象，先转成值
            // if (this.dataIsValueArray) {
            // } else {
            //     v = v.map(it => it[this.keyField]);
            // }

            if (this.valueIsBoolean) {
                v.map(it => jv.asBoolean(it))
            } else if (this.valueIsNumber) {
                v.map(it => jv.asInt(it))
            }

            this.value2 = v;
        },
    }
}
</script>
<style lang="scss">
.el-radio {
    margin-bottom: 6px;
}

.ri4c .el-radio__input.is-checked .el-radio__inner:hover {
    border-radius: 0;
}

.ri4c .el-radio__input.is-checked .el-radio__inner:hover:after {
    border-radius: 0;
}
</style>
