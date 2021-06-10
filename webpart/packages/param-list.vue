<template>
    <div>
        <input-table
            :border="false"
            style="width:100%"
            defaultSort="group"
            v-model="properties"
            default-expand-all
            readOnly
            :tree-props="{children: children,hasChildren: 'hasChildren'}"
        >
            <el-table-column align="center" label="属性名" min-width="120px;">
                <template slot-scope="scope">
                    <el-input
                        v-if="parentIsArray(scope) == false"
                        v-model="scope.row.key"
                        class="sect"
                        chk="*"
                        chkmsg="输入属性名"
                    />
                    <div v-else style="display: inline-flex">{{ children }}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="属性中文名" min-width="120px;">
                <template slot-scope="scope">
                    <el-input
                        v-if="parentIsArray(scope) == false"
                        v-model="scope.row.name"
                        class="sect"
                        chk="*"
                        chkmsg="输入属性中文名"
                    />
                </template>
            </el-table-column>

            <el-table-column align="center" label="数据类型" min-width="180px;">
                <template slot-scope="scope">
                    <div>
                        <selector
                            enum="ComponentPropertyTypeEnum"
                            v-model="scope.row.type"
                            style="min-width:80px;"
                            class="sect"
                            chk="*"
                            chkmsg="输入数据类型"
                            @change="type_change(scope)"
                        />

                        <selector enum="ComponentPropertyFormatTypeEnum" v-model="scope.row.format"
                                  v-if="scope.row.type == 'Text'" style="min-width:80px;margin-left:4px;"></selector>

                        <el-checkbox v-model="scope.row.object_is_any" @change="type_change(scope)"
                                     v-if="scope.row.type == 'Object'" style="margin-left:4px;">任意对象
                        </el-checkbox>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="必填" width="120">
                <template slot-scope="scope">
                    <el-checkbox v-model="scope.must">必填</el-checkbox>
                </template>
            </el-table-column>
            <el-table-column align="center" label="默认值" width="120">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.value" v-if="parentIsArray(scope) == false"/>
                </template>
            </el-table-column>
            <el-table-column align="center" label="小类" width="120">
                <template slot-scope="scope">
                    <el-input
                        v-if="isRoot(scope)"
                        v-model="scope.row.group"
                        @change="group_change"
                    />
                </template>
            </el-table-column>

            <el-table-column align="left" width="168">
                <template slot="header" slot-scope="scope">
                    <el-button type="primary"
                               plain
                               icon="el-icon-plus"
                               circle style="padding: 5px;font-size:16px;"
                               @click="add_click(scope)"
                    ></el-button>
                </template>

                <template slot-scope="scope">
                    <el-button icon="el-icon-setting" plain circle @click="config_click(scope)" size="small"
                               type="primary" style="padding: 5px;font-size:16px;"
                    >
                    </el-button>

                    <el-button icon="el-icon-delete" plain circle @click="remove_click(scope)" size="small"
                               type="primary" style="padding: 5px;font-size:16px;">
                    </el-button>

                    <el-button type="primary"
                               v-if="scope.row.type == 'Object' && !scope.row.object_is_any"
                               icon="el-icon-plus"
                               plain circle style="padding: 5px;font-size:16px;"
                               @click="add_click(scope)"
                    ></el-button>
                </template>
            </el-table-column>

        </input-table>

        <el-dialog :visible.sync="config_dlg" append-to-body :title="`配置${config_row.name}`" :destroy-on-close="true">
            <kv label="配置项">{{ config_row.name }}</kv>
            <kv label="备注">
                <el-input v-model="config_row.remark"></el-input>
            </kv>
            <kv label="枚举数据" v-if="config_row.type == 'Radio' || config_row.type == 'Check'">
                <input-list v-model="config_row.enumData" fields=""></input-list>
            </kv>
            <kv label="长度范围" v-if="config_row.type == 'Text'">
                <div>
                    <el-input v-model="config_row.minLength" style="display: inline-block;width:120px;"></el-input>
                    到
                    <el-input v-model="config_row.maxLength" style="display: inline-block;width:120px;"></el-input>
                </div>
            </kv>
            <kv label="验证">
                <el-input v-model="config_row.chk"></el-input>
            </kv>
            <template slot="footer">
                <el-button type="primary" @click="dlg_confirm()">确定</el-button>
                <el-button @click="config_dlg = false;">取消</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import jv from "./enum"

export default {
    name: "param-list",
    props: {
        value: {
            type: Array, default: () => []
        },
        children: {
            type: String, default: () => "items"
        }
    },
    data() {
        return {
            properties: [],
            config_dlg: false,
            objectType: "",
            config_row: {name: ""},
        };
    },
    watch: {
        value: {
            immediate: true, handler(v) {
                if (jv.dataEquals(this.properties, v)) return;
                this.properties = v;
            }
        },
        properties: {
            immediate: true, handler(v) {
                this.$emit("input", v);
            }
        }
    },
    methods: {
        dlg_confirm() {
            this.config_dlg = false;
            var row = this.getRow(this.config_row.id);
            if (!row) return;

            Object.assign(row, this.config_row);
            this.reRender();
        },
        config_click(scope) {
            this.config_row = JSON.clone(scope.row);
            this.config_row.name = this.config_row.name || "";
            this.config_dlg = true;
        },
        isRoot(scope) {
            return this.properties.filter(it => it.id == scope.row.id).length;
        },
        parentIsArray(scope) {
            var p = this.getParentRow(scope.row.id);
            if (!p) return false;
            return p.type == 'Array';
        },
        reRender() {
            //强制重新赋值，解决不能输入的问题。
            this.properties = JSON.clone(this.properties);
        },
        getRow(rowId) {
            var item = null;
            this.properties.recursion(it => it[this.children], it => {
                if (it.id == rowId) {
                    item = it;
                    return false;
                }
            });
            return item;
        },
        getParentRow(rowId) {
            var item = null;
            if (this.properties.filter(it => it.id == rowId).length) {
                return null;
            }
            this.properties.recursion(it => it[this.children], it => {
                if (!it[this.children]) {
                    return;
                }
                if (it[this.children].filter(_it => _it.id == rowId).length) {
                    item = it;
                    return false;
                }
            });
            return item;
        },
        add_click(scope) {
            var item = {};
            item.id = jv.random();
            item.enumData = [];
            item.minLength = -1;
            item.maxLength = -1;

            if (scope.row) {
                var row = this.getRow(scope.row.id);
                row[this.children] = row[this.children] || [];
                row[this.children].push(item);
            } else {
                this.properties.push(item);
            }

            this.reRender();
        },
        remove_click(scope) {
            var rowId = scope.row.id
            var parentRow = this.getParentRow(rowId);
            if (parentRow == null) {
                this.properties.removeItem(it => it.id == rowId);
            } else {
                parentRow[this.children].removeItem(it => it.id == rowId);

                if (parentRow.type == 'Object') {
                    parentRow.object_is_any = true;
                    return;
                }
                if (!parentRow[this.children].length) {
                    parentRow.type = "";
                }
            }

            this.reRender();
        },
        type_change(scope) {
            if (scope.row.type == 'Array') {
                scope.row[this.children] = [];

                if (!scope.row[this.children].length) {
                    var item = {};
                    item.id = jv.random();
                    scope.row[this.children].push(item);
                }
            } else if (scope.row.type == 'Object') {
                if (scope.row.object_is_any) {
                    delete scope.row[this.children];
                    return;
                }
                scope.row[this.children] = [];

                if (!scope.row[this.children].length) {
                    var item = {};
                    item.id = jv.random();
                    scope.row[this.children].push(item);
                }
            } else {
                delete scope.row[this.children];
            }
            this.reRender();
        }
    }
}
</script>
