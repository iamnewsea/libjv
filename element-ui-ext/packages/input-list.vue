<template>
    <div class="list-items">
        <template v-if="readOnly">
            <el-tag v-for="(item,index) in items" :key="index">{{ getDisplay(item) }}</el-tag>
        </template>
        <el-input v-else v-for="(item,index) in items" :key="index"
                  v-model="valueField? items[index][valueField] : items[index]" @change="change(index)"
                  @blur="change(index)">
            <template slot="prepend">
                <slot name="prepend"></slot>
            </template>
            <template slot="append">
                <slot name="append"></slot>
                <!--                <el-button v-if="canMoveDown && (index !== (items.length -1))" icon="el-icon-bottom"-->
                <!--                           @click="movedown_click(index)"></el-button>-->
                <!--                <el-button v-if="canMoveUp && index" icon="el-icon-up" @click="moveup_click(index)"></el-button>-->

                <el-button icon="el-icon-delete" @click="remove_click(index)"></el-button>
            </template>
        </el-input>
        <el-button @click="add_click">增加</el-button>
    </div>
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
    name: "input-list",
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
        fields: {
            type: String, default() {
                return "";
            }
        }
    },
    data() {
        return {
            items: [],
            valueField: "",
            displayField: ""
        }
    },
    watch: {
        value: {
            immediate: true, deep: true, handler(val) {
                this.items = val
            }
        },
        fields: {
            immediate: true, deep: true, handler(val) {
                if (!val) {
                    this.valueField = "";
                    this.displayField = "";
                } else {
                    var sect = val.split(",");
                    this.valueField = sect[0];
                    this.displayField = sect[1];
                }
            }
        }
    },
    mounted() {
    },
    methods: {
        getDisplay(item) {
            if (!this.displayField) {
                return item;
            }
            var v = item[this.displayField];
            if (v.Type == "function") {
                return v();
            }
            return v;
        },
        movedown_click(index) {
            var temp = this.items[index];
            this.items[index] = this.items[index + 1];
            this.items[index + 1] = temp;
            this.$emit("value", this.items)
        },
        moveup_click(index) {
            var temp = this.items[index];
            this.items[index] = this.items[index - 1];
            this.items[index - 1] = temp;
            this.$emit("value", this.items)
        },
        change(index) {
            if (this.valueField) {
                if (this.items[index][this.valueField] == this.value[index][this.valueField]) {
                    return;
                }
            } else if (this.items[index] == this.value[index]) {
                return;
            }
            this.$emit("value", this.items)
        },
        remove_click(index) {
            this.items.removeAt(index)
            this.$emit("value", this.items)
        },
        add_click() {
            if (this.valueField) {
                var it = {};
                it[this.valueField] = "";
                this.items.push(it);
            } else {
                this.items.push("");
            }
            this.$emit("value", this.items);
        }
    }
}
</script>
