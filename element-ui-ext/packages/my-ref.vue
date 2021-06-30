<template>
    <div class="my-ref">
        <div @click="popClick">
            <span v-for="(item) in oriValue" :key="item.id" class="tag-product-name"
                  :style="{minWidth: computeWidth(item[displayField] && item[displayField].length)}">


              <el-tag @click.prevent.stop="popClick"
                      :closable="!readOnly" :close-transition="true"
                      @close.prevent.stop="removeTagClose(item.id,$event)"
                      style="margin-right:18px;margin-bottom: 8px;">
    <!--              {{item.name}}-->
                <slot name="display" v-bind:item="item">
                  {{ item[displayField] }}
                </slot>
              </el-tag>
            </span>
            <slot name="button" v-if="!readOnly && !oriValue.length">
                <el-button size="mini" icon="el-icon-folder-opened">选择{{ name }}</el-button>
            </slot>
        </div>

        <el-dialog ref="dialog" :title="'选择 ' +name" :visible.sync="popOpen" :center="true" width="80%" append-to-body>

            <my-list ref="ref" :url="url" :query="query" :page-size="pageSize" @loaded="dataLoaded"
                     @row-dblclick="dbl_click"
                     @row-click="tableRowClick"
                     v-bind="[attrs]"
            >
                <slot></slot>

                <template #query="scope">
                    <slot name="query" v-bind:query="scope.query"></slot>
                </template>

                <template #right-button>
                    <el-dropdown split-button size="small" trigger="click" type="primary" icon="el-icon-goods"
                                 @click="handleClick" v-if="multi" @command="removeTag">
                        选中 {{ dbRefValue.length }} 项
                        <el-dropdown-menu slot="dropdown" title="点击对其删除" style="width:200px;">
                            <el-dropdown-item v-for="item in dbRefValue" :key="item.id" :command="item.id">
                                {{ item.name }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </my-list>
        </el-dialog>
    </div>
</template>

<script>
/**
 *插槽：
 * display: 显示选中的条目，使用方式：<template #display="scope">{{scope.item.name}}</template>
 * query: 嵌入式查询条件，使用方式：
 <template #query="scope">
 <kv label="名称">
 <el-input v-model="scope.query.name"></el-input>
 </kv>
 </template>
 *
 * button: 当没有选中样式时，选择按钮的样式。
 * 默认： 列表列定义。
 */
import MyList from "./my-list.vue"

export default {
    components: {MyList},
    name: "my-ref",
    props: {
        readOnly: {
            type: Boolean, default: () => false
        },
        open: {
            type: Boolean, default: () => false
        },
        multi: {
            type: Boolean, default: () => false
        }, //多选
        url: {
            type: String, default: () => ""
        },
        pageSize: {
            type: Number, default: () => 10
        },
        // minNumber: {type: Number, default: 3},
        name: {
            type: String, default: () => ""
        },
        displayField: {
            type: String, default: () => "name"
        },
        // 回传id
        id: {
            type: [Object, String, Number], default: () => ""
        },
        value: {
            type: [Object, Array], default: () => []
        }
    },
    data() {
        return {
            attrs: [],
            dbRefValue: [],    //实时数据。
            oriValue: [],
            query: {},
            popOpen: this.open
        }
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler(val) {
                // if (jv.dataEquals(val, this.oriValue)) return;
                this.setValue(val);

                // jv.log(this.dbRefValue);
                // jv.log(this.oriValue);
            }
        }
    },
    mounted() {
    },
    methods: {
        setValue(val) {
            if (val instanceof Array) {
                this.oriValue = val.map(it => Object.assign({}, it));
            } else if (val.id) {
                this.oriValue = [Object.assign({}, val)];
            } else {
                this.oriValue = [];
            }


            this.dbRefValue = Object.assign([], this.oriValue);
        },
        loadData(pageNumber) {
            this.$nextTick(() => {
                this.$refs["ref"].loadData(pageNumber);
            });
        },
        dataLoaded(res, option) {
            var json = res.data.data;
            // json.forEach(it => {
            //     it.checked = (this.dbRefValue.findIndex(item => item.id == it.id) >= 0);
            // });

            return this.$emit("loaded", res, option);
        },
        // page_Change(page){
        //   this.skip = (page -1)* this.take;
        // },
        computeWidth(charCount) {
            if (!charCount) return "60px";
            //1个字符宽度为10, 空为60
            if (charCount < 5) return "110px";
            if (charCount < 15) return "220px";
            return "330px";
        },
        removeTag(id) {
            var index = this.dbRefValue.findIndex(it => it.id == id)
            this.dbRefValue.splice(index, 1);
            return false;
        },
        removeTagClose(id) {
            var index = this.dbRefValue.findIndex(it => it.id == id)
            this.dbRefValue.splice(index, 1);
            this.handleClick();
            return false;
        },
        tableRowClick(row) {
            if (!this.multi) {
                return;
            }
            // row.checked = !row.checked;
            var index = this.dbRefValue.findIndex(it => it.id == row.id)

            if (index < 0) {
                this.dbRefValue.push(row);
            } else {
                this.dbRefValue.splice(index, 1);
            }
        },
        popClick() {
            if (this.readOnly) {
                return;
            }

            this.dbRefValue = Object.assign([], this.oriValue);
            this.popOpen = true;

            // this.setValue(this.value);
            this.attrs = Object.assign([], this.$attrs);

            if (jv.isNull(this.attrs["row-class-name"])) {
                this.attrs["row-class-name"] = ({row, rowIndex}) => {
                    return this.dbRefValue.findIndex(it => it.id == row.id) >= 0 ? 'check-row' : ''
                }
            }

            this.loadData(1);
        },
        handleClick() {
            this.popOpen = false;

            // //比较是否相同.
            // if (jv.dataEquals(this.oriValue, this.dbRefValue)) return;

            if (this.multi) {
                this.$emit('input', this.dbRefValue);
                var changed = {added: [], deleted: []};

                //公共Id部分
                var commIds = this.dbRefValue.map(it => it.id).intersect(this.oriValue.map(it => it.id));

                //两部分。 add , delete
                this.dbRefValue.filter(newValue => {
                    if (commIds.some(id => id == newValue.id) == false) {
                        changed.added.push(newValue);
                    }
                });

                this.oriValue.filter(oldValue => {
                    if (commIds.some(id => id == oldValue.id) == false) {
                        changed.deleted.push(oldValue);
                    }
                });

                //比较是否相同.
                if (!changed.added.length && !changed.deleted.length) return;
                this.$emit("change", changed, this.id)
            } else {
                this.$emit('input', this.dbRefValue[0]);
                this.$emit("change", this.dbRefValue[0], this.id)
            }
            this.oriValue = Object.assign([], this.dbRefValue);
        },
        dbl_click(row, event) {
            if (this.multi) return;
            this.dbRefValue = [row];

            this.handleClick();
        }
    }
}
</script>


<style>
.my-ref {
    display: inline-block;
}
</style>