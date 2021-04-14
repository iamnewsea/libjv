<template>
    <my-list v-model="tableData" :noQueryPart="true">
        <el-table-column type="index" clign="center" width="50"></el-table-column>

        <el-table-column v-for="(item,index) in tableFields" :key="item.field" :label="item.title" align="center">
            <template slot-scope="scope">
                <el-input v-model="scope.row[item.field]" @change="change(scope.row)"
                          @blur="change(scope.row)"/>
            </template>
        </el-table-column>

        <el-table-column align="center">
            <template slot="header" slot-scope="scope">
                <el-button
                    type="primary"
                    plain
                    icon="el-icon-plus"
                    round
                    @click="add_click"
                ></el-button>
            </template>

            <template slot-scope="scope">
                <el-button icon="el-icon-delete-solid" plain @click="remove_click(scope.row)" size="small"
                           type="primary">
                </el-button>
            </template>
        </el-table-column>

        <template slot="query-button">
            <div></div>
        </template>
    </my-list>
</template>
<style scoped>
.list-items > div {
    margin-bottom: 8px;
}

.list-items > span {
    margin-right: 8px;
}

.list-items > span:last-child {
    margin-right: auto;
}
</style>
<script type="text/ecmascript-6">
export default {
    name: "input-table",
    inheritAttrs: false,
    props: {
        readOnly: {
            type: Boolean, default() {
                return false
            }
        },
        // canMoveDown: {
        //     type: Boolean, default() {
        //         return false
        //     }
        // },
        // canMoveUp: {
        //     type: Boolean, default() {
        //         return false
        //     }
        // },
        //列表数据
        value: {
            type: Array, default: () => []
        },
        // [{title,field}]
        fields: {
            type: String, default: () => ""
        }
    },
    data() {
        return {
            tableData: {data: []},
            tableFields: [],
            displayField: ""
        }
    },
    watch: {
        value: {
            immediate: true, deep: true, handler(val) {
                this.tableData.data = val
            }
        },
        fields: {
            immediate: true, deep: true, handler(val) {
                if (!val) {
                    this.tableFields = [];
                } else {
                    this.tableFields = val.split(",").map(it => {
                        var sect = it.split(":");
                        return {field: sect[0], title: sect[1]};
                    });
                }
            }
        }
    },
    mounted() {
    },
    methods: {

        change(row) {
            this.$emit("value", this.tableData.data)
        },
        remove_click(index) {
            this.tableData.data.removeAt(index)
            this.$emit("value", this.tableData.data)
        },
        add_click() {
            this.tableData.data.push({});
            this.$emit("value", this.tableData.data);
        }
    }
}
</script>
