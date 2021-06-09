<template>
    <div class="input-list">
        <el-tag
            class="list-item"
            :key="tag"
            v-for="tag in dynamicTags"
            :closable="!readOnly"
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{ tag }}
        </el-tag>
        <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
        >
        </el-input>
        <el-button v-else @click="showInput" v-if="!readOnly">增加</el-button>
    </div>
</template>
<style lang="scss">
.el-tag + .el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
<script type="text/ecmascript-6">
import Sortable from 'sortablejs'

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
        }
    },
    data() {
        return {
            dynamicTags: [],
            inputVisible: false,
            inputValue: ''
        }
    },
    watch: {
        value: {
            immediate: true, deep: true, handler(val) {
                if (jv.dataEquals(val, this.dynamicTags)) {
                    return;
                }
                this.dynamicTags = val
            }
        },
        dynamicTags: {
            immediate: true, handler(v) {
                this.$emit("input", v);
            }
        }
    },
    mounted() {
    },
    methods: {
        // 行拖拽
        rowDrop() {
            // 此时找到的元素是要拖拽元素的父容器
            const tbody = this.$el;
            const _this = this;
            this.sortable = Sortable.create(tbody, {
                //  指定父元素下可被拖拽的子元素
                handle: ".list-item",
                onEnd({newIndex, oldIndex}) {
                    const currRow = _this.tableData.data.splice(oldIndex, 1)[0];
                    _this.tableData.data.splice(newIndex, 0, currRow);
                }
            });
        },
        handleClose(tag) {
            this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
        },

        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },

        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (inputValue) {
                this.dynamicTags.push(inputValue);
            }
            this.inputVisible = false;
            this.inputValue = '';
        }
    }
}
</script>
