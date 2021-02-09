<template>
    <div class="list-items">
        <template v-if="readOnly">
            <span v-for="(item,index) in items" :key="index">{{ items[index] }}</span>
        </template>
        <el-input v-else v-for="(item,index) in items" :key="index" v-model="items[index]" @change="change(index)"
                  @blur="change(index)">
            <template slot="append">
                <el-button v-if="canMoveDown && (index !== (items.length -1))" icon="el-icon-bottom"
                           @click="movedown_click(index)"></el-button>
                <el-button v-if="canMoveUp && index" icon="el-icon-up" @click="moveup_click(index)"></el-button>

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
        canMoveDown: {
            type: Boolean, default() {
                return false
            }
        },
        canMoveUp: {
            type: Boolean, default() {
                return false
            }
        },
        //列表数据
        value: {
            type: Array, default: () => {
                return [];
            }
        }
    },
    data() {
        return {
            items: []
        }
    },
    watch: {
        value: {
            immediate: true, deep: true, handler(val) {
                this.items = val
            }
        }
    },
    mounted() {
    },
    methods: {
        movedown_click(index){
            var temp = this.items[index];
            this.items[index] = this.items[index+1];
            this.items[index+1] = temp;
            this.$emit("value", this.items)
        },
        moveup_click(index){
            var temp = this.items[index];
            this.items[index] = this.items[index-1];
            this.items[index-1] = temp;
            this.$emit("value", this.items)
        },
        change(index) {
            if (this.items[index] == this.value[index]) {
                return;
            }
            this.$emit("value", this.items)
        },
        remove_click(index) {
            this.items.removeAt(index)
            this.$emit("value", this.items)
        },
        add_click() {
            this.items.push("");
            this.$emit("value", this.items);
        }
    }
}
</script>
