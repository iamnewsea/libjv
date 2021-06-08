<template>
    <div>
        <kv label="数据类型">
            <selector
                enum="ComponentPropertyTypeEnum"
                v-model="data.type"
                class="sect"
                chk="*"
                chkmsg="输入数据类型"
            />
        </kv>


        <kv label="数组内数据类型" v-if="['Array'].includes(data.type)">
            <selector
                enum="ComponentPropertyTypeEnum"
                v-model="data.arrayItemType"
            />
        </kv>

        <kv label="文本格式" v-if="['Text'].includes(data.type)">
            <selector
                enum="ComponentPropertyFormatTypeEnum"
                v-model="data.format"
            />
        </kv>

        <kv label="选择数据" v-if="['Radio','Check'].includes(data.type)">
            <input-list
                v-model="data.enumData"
            />
        </kv>

        <kv label="对象属性" v-else-if="['Object'].includes(data.type)">
            <input-table v-model="data.objectType">
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
                <el-table-column align="center" label="属性备注">
                    <template slot-scope="scope">
                        <el-input
                            v-model="scope.row.remark"
                        />
                    </template>
                </el-table-column>
                <el-table-column align="center" label="属性类型">
                    <template slot-scope="scope">
                        <data-type v-model="scope.row.type"></data-type>
                    </template>
                </el-table-column>
            </input-table>
        </kv>

        <kv label="数组内可选数据" v-if="['Radio','Check'].includes(data.arrayItemType)">
            <input-list
                v-model="data.enumData"
            />
        </kv>
    </div>
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
