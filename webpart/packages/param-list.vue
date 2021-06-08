<template>
    <input-table
        style="width:100%"
        defaultSort="group"
        v-model="info.properties"
        @add="it=>it.type = {}"
    >
        <el-table-column type="expand">
            <template slot-scope="scope">
                <div>
                    <data-type v-model="scope.row.type"></data-type>
                </div>
            </template>
        </el-table-column>

        <el-table-column align="center" label="属性名">
            <template slot-scope="scope">
                <el-input
                    v-model="scope.row.key"
                    class="sect"
                    chk="*"
                    chkmsg="输入属性名"
                />
            </template>
        </el-table-column>
        <el-table-column align="center" label="属性中文名">
            <template slot-scope="scope">
                <el-input
                    v-model="scope.row.name"
                    class="sect"
                    chk="*"
                    chkmsg="输入属性中文名"
                />
            </template>
        </el-table-column>
        <el-table-column align="center" label="备注">
            <template slot-scope="scope">
                <el-input v-model="scope.row.remark"/>
            </template>
        </el-table-column>
        <el-table-column align="center" label="默认值" width="120">
            <template slot-scope="scope">
                <el-input v-model="scope.row.value"/>
            </template>
        </el-table-column>
        <el-table-column align="center" label="小类" width="120">
            <template slot-scope="scope">
                <el-input
                    v-model="scope.row.group"
                    @change="group_change"
                />
            </template>
        </el-table-column>


    </input-table>
</template>
<script>
import jv from "./enum"

export default {
    name: "dataType",
    props: {
        value: {
            type: Object, default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            data: {}
        };
    },
    computed: {
        value: {
            immediate: true, handler(v) {
                this.data = v;
            }
        }
    }
}
</script>
