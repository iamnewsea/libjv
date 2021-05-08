<template>
    <my-list v-bind="$attrs" v-model="tableData" :noQueryPart="true">
        <el-table-column type="index" clign="center" width="50"></el-table-column>

        <slot></slot>
        <el-table-column align="center" width="68">
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
                <el-button icon="el-icon-delete-solid" plain @click="remove_click(scope)" size="small"
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
            type: Boolean, default: () => false
        },
        // defaultSort: {
        //     type: String, default: () => ""
        // },
        // //ascending, descending
        // order: {
        //     type: String, default: () => ""
        // },
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
        // [{title,field,width}]
        // fields: {
        //     type: [String, Array], default: () => ""
        // }
    },
    data() {
        return {
            tableData: {data: []},
            // tableFields: [],
            // displayField: ""
        }
    },
    watch: {
        value: {
            immediate: true, deep: true, handler(val) {
                if (this.tableData.data == val) return;
                this.tableData.data = val
            }
        },
        "tableData.data": {
            immediate: true, deep: true, handler(val) {
                this.$emit("input", this.tableData.data)
            }
        }
        // fields: {
        //     immediate: true, deep: true, handler(val) {
        //         if (!val || !val.length) {
        //             this.tableFields = [];
        //             return;
        //         }
        //
        //         if (val.Type != "string") {
        //             this.tableFields = val;
        //             return;
        //         }
        //
        //         this.tableFields = val.split(",").map(it => {
        //             var sect = it.split(":");
        //             return {field: sect[0], title: sect[1]};
        //         });
        //     }
        // }
    },
    mounted() {
    },
    methods: {
        change() {
            this.$emit("input", this.tableData.data)
        },
        remove_click(scope) {
            var rowIndex = scope.$index;
            this.tableData.data.removeAt(rowIndex)
            this.$emit("input", this.tableData.data)
        },
        add_click() {
            this.tableData.data.push({});
            this.$emit("input", this.tableData.data);
        }
    }
}
</script>
