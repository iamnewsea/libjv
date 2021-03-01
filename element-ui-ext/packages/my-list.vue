<template>
    <div>
        <div class="query">
            <!-- 通过 slot 传递 query 用法： <template #query="scope"> <input v-model="scope.query.name" /> </template> -->
            <slot name="query" v-bind:query="query2"></slot>
            <slot name="buttons">
                <div class="buttons">
                    <slot name="query-button">
                        <el-button size="mini" icon="el-icon-search" @click="loadData(1)" type="primary">查询</el-button>
                    </slot>
                    <slot name="button">
                    </slot>
                </div>
            </slot>
        </div>

        <slot name="head"></slot>

        <el-table :data="tableData"
                  v-loading="url && loading"
                  v-bind="[attrs]"
                  @row-dblclick="dbClick"
                  @row-click="tableRowClick"
                  @rowKey="rowKey"
        >
            <slot></slot>
        </el-table>
        <el-pagination layout="prev, pager, next" v-if="total>pageSize"
                       :total="total" :page-size="pageSize" :currentPage.sync="pageNumber" @current-change="loadData"
                       style="text-align: right;margin-top:20px;">
        </el-pagination>
    </div>
</template>
<style scoped>
.buttons {
    min-width: auto;
    max-width: unset;
    width: auto;
}

.buttons > * {
    margin-right: 12px;
}

.buttons > *:last-child {
    margin-right: 0;
}

</style>
<style>

.last-row .link {
    font-weight: bold;
}

.el-cell-index .cell div {
    text-align: center;
}

.check-row .el-cell-index .cell div {
    color: white;
    background-color: #df5000;
    border-radius: 30px;
}
</style>
<script type="text/ecmascript-6">
export default {
    name: "my-list",
    inheritAttrs: false,
    props: {
        store: {
            type: Boolean, default: () => true
        }, //是否存储 页码，总页数,lastRowId
        pageSize: {
            type: Number, default: () => 10
        },
        url: {
            type: String, default: () => ""
        },
        //初始化query
        query: {
            type: Object, default() {
                return {};
            }
        },
        //列表数据
        value: {
            type: Object, default() {
                return {};
            }
        }
    },
    data() {
        return {
            loading: false,
            total: 0,
            query2: {}, // 嵌入的query
            pageNumber: 1,
            lastRowId: "",
            tableData: []
        }
    },
    mounted() {
        if (this.store) {
            var storeId = this.$vnode.data.ref || "list";
            var store = this.$my_store.getJson(storeId);
            this.total = store.total || 0;
            this.pageNumber = store.pageNumber || 1;
            this.lastRowId = store.lastRowId || "";
            this.query2 = Object.assign({}, this.query2, store.query, this.query);
        }
        this.loadData();
    },
    computed: {
        rowKey() {
            return this.$attrs.rowKey || 'id';
        },
        attrs() {
            return Object.assign({
                border: true,
                stripe: true,
                "row-class-name": ({row, rowIndex}) => {
                    return jv.evalExpression(row, this.rowKey) == this.lastRowId ? 'last-row' : ''
                }
            }, this.$attrs);
        }
    },
    watch: {
        value: {
            deep: true, immediate: true, handler(v) {
                if (!v) return;

                this.data_setted();

                if (v.data) {
                    this.tableData = v.data;
                }
                if (v.total) {
                    this.total = v.total;
                }
            }
        },
        query: {
            deep: true, handler(v) {
                this.query2 = Object.assign({}, this.query2, this.query);
            }
        },
        url: {
            immediate: false, handler(v) {
                this.loadData();
            }
        }
    },
    methods: {
        //获取保存的查询条件
        getStoredQuery() {
            var storeId = this.$vnode.data.ref || "list";
            return this.$my_store.getJson(storeId).query;
        },
        setTotal(total) {
            this.total = total;
        },
        setPageNumber(pageNumber) {
            this.pageNumber = pageNumber;
        },
        setLastRowId(lastRowId) {
            this.lastRowId = lastRowId;
            var storeId = this.$vnode.data.ref || "list";
            this.$my_store.setJson(storeId, Object.assign(this.$my_store.getJson(storeId), {lastRowId: lastRowId}));
        },
        setLastRow(row) {
            var lastRowId = jv.evalExpression(row, this.rowKey || 'id');
            this.setLastRowId(lastRowId);
        },
        setData(data) {
            if ("total" in data) {
                this.total = data.total;
            }
            if ("pageNumber" in data) {
                this.pageNumber = data.pageNumber;
            }
            if ("lastRowId" in data) {
                this.lastRowId = data.lastRowId;
            }
        },
        //仅刷新数据,用于更新后，更新某一条。
        updateData(data, key = "id") {
            if (!data) return;
            if (!data[key]) return;

            var row = this.tableData.find(it => it[key] == data[key]);
            if (!row) return;
            Object.assign(row, data);

            this.$emit("input", this.tableData);
        },
        getQuery() {
            let para = Object.assign({}, this.query2);
            this.$emit("param", para);
            return para;
        },
        //仅刷新数据,用于更新后，更新某一条。
        updateById(id, key) {
            if (!id) return;
            var row = this.tableData.find(it => it[key] == id);
            if (!row) return;


            let para = Object.assign({}, this.query2);
            para[key || "id"] = id;

            var para_ret;
            this.$emit("param", para, v => para_ret = v);
            if (para_ret === false) {
                return;
            }

            this.loading = true;
            if (this.url) {
                this.$http.post(this.url, para).then(res => {
                    this.$emit("loaded", res, para);
                    var newData = res.data.data[0] || {};

                    this.tableData = this.tableData.map(it => {
                        if (it[key] == newData[key]) {
                            return newData;
                        }
                        return it;
                    });

                    this.$emit("input", this.tableData);
                    this.loading = false;
                });
            }
        },
        loadData(pageNumber) {
            if (!this.url) return;

            if (pageNumber) {
                this.pageNumber = pageNumber;
            } else if (pageNumber === 0) {
                this.pageNumber = 1;
            }

            if (this.pageNumber == 1) {
                this.total = 0;
            }


            let para = Object.assign({}, this.query2, {
                pageNumber: this.pageNumber,
                skip: (this.pageNumber - 1) * this.pageSize,
                take: this.pageSize
            });


            this.data_setted();

            var para_ret;
            /**
             * 如果要阻止继续请求， param 事件需要调用第2个回调参数 ： @param="(param,callback)=> callback(false)"
             */
            this.$emit("param", para, v => para_ret = v);
            if (para_ret === false) {
                return;
            }
            this.loading = true;
            this.$http.post(this.url, para).then(res => {
                this.$emit("loaded", res, para);
                this.tableData = res.data.data;
                //返回来的total只有第一次获取的时候才有值，第二次获取之后都是-1

                var storeData = {pageNumber: this.pageNumber, query: this.query2};

                if (res.data.total >= 0) {
                    this.total = res.data.total;
                    storeData.total = this.total;
                }

                if (this.store) {
                    var storeId = this.$vnode.data.ref || "list";

                    this.$my_store.setJson(storeId, Object.assign(this.$my_store.getJson(storeId), storeData));
                }

                this.$emit("input", this.tableData);
                this.loading = false;

            });
        },
        data_setted() {
            if (jv.isNull(this.attrs["cell-class-name"])) {
                this.attrs["cell-class-name"] = ({row, column}) => {
                    return column.type == 'index' ? 'el-cell-index' : '';
                }
            }
        },
        dbClick(e) {
            return this.$emit("row-dblclick", e)
        },
        tableRowClick(e) {
            return this.$emit("row-click", e)
        }
    }
}

/**
 * 插槽：
 * 默认： 列表列定义。
 * query: 内嵌的查询方式，可以和外部query配合使用，使用方式：
 <template #query="scope">
 <kv label="名称">
 <el-input v-model="scope.query.name"></el-input>
 </kv>
 </template>
 *
 * 使用说明,必要属性只有一个：url，其余为可选属性：
 * ref "名称" : 当页面有多个列表，需要写义，默认值：list
 * @loaded 事件：需要对返回的数据进行处理，参数 response , 通过 response.data.data 获取列表数据， response.data.total 获取总条数，服务器可以仅在第一页返回总条数即可。
 * query 查询：绑定传递到服务器端的查询条件，额外的，还会增加两个查询字段：skip,take。
 * page-size 每页条数：即 take , 默认10条
 * row-key 返回数据标志每一行的key,默认是 id，lastRowId 使用。
 * store 是否存储： 默认为true。会在查询时，把 query,total,skip,take,pageNumber, 保存到 $my_store.setJson(ref,{}) 中。
 *
 * 使用方式：
 * mounted 方法
 *  //恢复存储数据：
 *  this.query = Object.assign(this.query, this.$refs.list.getStoredQuery());
 *  //加载数据：
 *  this.loadData();
 *
 *  methods里定义查询：
 *  //查询
 *  loadData(pageNumber) {
 *    this.$refs.list.loadData(pageNumber);
 *  }
 *
 *  在点击事件中加入最后行的标志
 *  this.$refs.list.setLastRowId(row.school.id);
 */
</script>
