<template>
    <div class="my-text">
        <div @click="popClick">
            <el-tag>
                <slot name="display">
                    {{ value.slice(0, length) }} {{ value.length > 16 ? " ..." : "" }}
                </slot>
            </el-tag>
            <span>({{ value.length }}字)</span>
        </div>

        <el-dialog ref="dialog" :title="'编辑 ' +name" :visible.sync="popOpen" :show-close="false" width="80%"
                   append-to-body>
            <div class="my-text-dlg">
                <div class="my-text-btn">
                    <el-button type="primary" @click="handleClick">确定</el-button>
                    <el-button @click="popOpen=false;">取消</el-button>
                </div>
                <el-input type="textarea" v-model="text" :readOnly="readOnly"></el-input>
            </div>
        </el-dialog>
    </div>
</template>
<script>
/**
 *插槽：
 */
export default {
    components: {},
    name: "my-text",
    props: {
        type: {
            //以下值： markdown,text,docx,pdf,html. 暂时实现 text
            type: String, default: () => ""
        },
        readOnly: {
            type: Boolean, default: () => false
        },
        open: {
            type: Boolean, default: () => false
        },
        name: {
            type: String, default: () => ""
        },
        value: {
            type: String, default: () => ""
        },
        length: {
            type: Number, default: () => 32
        }
    },
    data() {
        return {
            attrs: [],
            text: "", //当前数据
            popOpen: this.open
        }
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler(val) {
                this.text = val;
            }
        }
    },
    methods: {
        popClick() {
            this.popOpen = true;
        },
        handleClick() {
            this.popOpen = false;
            this.$emit('input', this.text);
            this.$emit("change", this.text, this.id)
        }
    }
}
</script>

<style lang="scss">
.my-text {
    display: inline-block;


}

.my-text-dlg {
    margin-top: -20px;
    position: relative;

    .my-text-btn {
        position: absolute;
        top: -40px;
        right: 0;
    }


    /deep/ textarea {
        height: 65vh;
    }
}
</style>
