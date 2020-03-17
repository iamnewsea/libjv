<template>
  <div>
    <el-table :data="tableData" v-loading="loading"
              v-bind="[$props, $attrs]" @row-dblclick="dbClick"
              @row-click="tableRowClick">
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
            border: {type: Boolean, default: true},
            store: {type: Boolean, default: true}, //是否存储查询，分页，总页数
            stripe: {type: Boolean, default: true},
            fit: {type: Boolean, default: true},
            pageSize: {type: Number, default: 10},
            url: {type: String, default: ""},
            query: {
                type: Object, default() {
                    return {};
                }
            },
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
                pageNumber: 1,
                tableData: []
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
            //以后废掉它
            doQuery() {
                this.pageNumber = 1;
                this.loadData();
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
                if(!row) return ;

                this.loading = true;

                var newQuery = {
                    pageNumber: this.pageNumber,
                    skip: (this.pageNumber - 1) * this.pageSize,
                    take: this.pageSize
                };

                newQuery[key] = id;

                let para = Object.assign({}, this.query, newQuery);

                this.$http.post(this.url, para).then(res => {
                    this.$emit("loaded", res, para);
                    var newData = res.data.data[0] || {};

                    this.tableData = this.tableData.map(it=>{
                       if(it[key] == newData[key]){
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

                let para = Object.assign({}, this.query, {
                    pageNumber: this.pageNumber,
                    skip: (this.pageNumber - 1) * this.pageSize,
                    take: this.pageSize
                });

                this.$http.post(this.url, para).then(res => {
                    this.$emit("loaded", res, para);
                    this.tableData = res.data.data;
                    //返回来的total只有第一次获取的时候才有值，第二次获取之后都是-1


                    if (this.store) {
                        this.$store.setJson({query: this.query, pageNumber: this.pageNumber});
                    }

                    if (res.data.total >= 0) {
                        this.total = res.data.total;

                        if (this.store) {
                            this.$store.setJson({total: this.total});
                        }
                    } else {
                        if (this.store && !this.total) {
                            this.total = this.$store.getJson().total;
                        }
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
