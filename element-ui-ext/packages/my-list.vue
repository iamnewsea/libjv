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
            loadData(pageNumber) {
                if( pageNumber ){
                    this.pageNumber = pageNumber;
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
                    if (res.data.total >= 0) {
                        this.total = res.data.total;
                    }
                    this.$emit("input", res.data);
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
