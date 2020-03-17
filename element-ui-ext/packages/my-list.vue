<template>
  <div>
    <el-table :data="tableData"
              v-loading="loading"
              v-bind="[$props, $attrs]"
              @row-dblclick="dbClick"
              @row-click="tableRowClick"
              @rowKey="rowKey"
              :row-class-name="({row,rowIndex})=> jv.evalExpression(row, rowKey || 'id') == lastRowId ? 'last-row': '' "
    >
      <slot></slot>
    </el-table>
    <el-pagination layout="prev, pager, next" v-if="total>pageSize"
                   :total="total" :page-size="pageSize" :currentPage.sync="pageNumber" @current-change="loadData"
                   style="text-align: right;margin-top:20px;">
    </el-pagination>
  </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: "my-list",
        inheritAttrs: false,
        props: {
            rowKey: {type: String, default: ""},
            border: {type: Boolean, default: true},
            store: {type: Boolean, default: true}, //是否存储 页码，总页数,lastRowId
            stripe: {type: Boolean, default: true},
            fit: {type: Boolean, default: true},
            pageSize: {type: Number, default: 10},
            url: {type: String, default: ""},
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
                query: {},
                pageNumber: 1,
                lastRowId: "",
                tableData: []
            }
        },
        mounted() {
            if (this.store) {
                var storeId = this.$el.id || "list";
                var store = this.$store.getJson()[storeId] || {};
                this.total = store.total || 0;
                this.pageNumber = store.pageNumber || 1;
                this.lastRowId = store.lastRowId || "";
                this.queryData = store.query || {};
            }
        },
        watch: {
            value: {
                deep: true, handler(v) {
                    if (!v) return;

                    if (v.data) {
                        this.tableData = v.data;
                    }
                    if (v.total) {
                        this.total = v.total;
                    }
                }
            }
        },
        methods: {
            //获取保存的查询条件
            getStoredQuery() {
                var storeId = this.$el.id || "list";
                return Object.assign({}, this.query, this.queryData, (this.$store.getJson()[storeId] || {}).query);
            },
            setTotal(total) {
                this.total = total;
            },
            setPageNumber(pageNumber) {
                this.pageNumber = pageNumber;
            },
            setLastRowId(lastRowId) {
                this.lastRowId = lastRowId;
                var storeId = this.$el.id || "list";
                var storeData = {};
                storeData[storeId] = {lastRowId: lastRowId}
                this.$store.setJson(storeData)
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
            //仅刷新数据,用于更新后，更新某一条。
            updateById(id, key = "id") {
                if (!id) return;
                var row = this.tableData.find(it => it[key] == id);
                if (!row) return;

                this.loading = true;

                var newQuery = {
                    pageNumber: this.pageNumber,
                    skip: (this.pageNumber - 1) * this.pageSize,
                    take: this.pageSize
                };

                newQuery[key] = id;

                let para = Object.assign({}, this.query, this.queryData, newQuery);

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
            },
            loadData(pageNumber) {
                if (pageNumber) {
                    this.pageNumber = pageNumber;
                } else if (pageNumber === 0) {
                    this.pageNumber = 1;
                }

                if (this.pageNumber == 1) {
                    this.total = 0;
                }

                this.loading = true;

                let para = Object.assign({}, this.query, this.queryData, {
                    pageNumber: this.pageNumber,
                    skip: (this.pageNumber - 1) * this.pageSize,
                    take: this.pageSize
                });


                this.$http.post(this.url, para).then(res => {
                    this.$emit("loaded", res, para);
                    this.tableData = res.data.data;
                    //返回来的total只有第一次获取的时候才有值，第二次获取之后都是-1

                    var storeData = {pageNumber: this.pageNumber, query: Object.assign({}, this.query, this.queryData)};

                    if (res.data.total >= 0) {
                        this.total = res.data.total;
                        storeData.total = this.total;
                    }

                    if (this.store) {
                        var storeId = this.$el.id || "list";
                        var storeJson = {};
                        storeJson[storeId] = storeData;
                        this.$store.setJson(storeJson);
                    }

                    this.$emit("input", this.tableData);
                    this.loading = false;
                });
            },
            dbClick(e) {
                return this.$emit("row-dblclick", e)
            },
            tableRowClick(e) {
                return this.$emit("row-click", e)
            }
        }
    }
</script>
