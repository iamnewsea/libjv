<template>
  <div>
    <el-form :inline="true" :model="query" label-width="100px">
      <el-form-item label="订单号：">
        <el-input v-model="query.orderCode" placeholder="请输入订单号" style="width:217px;"></el-input>
      </el-form-item>
      <el-form-item label="活动类型：">
        <el-select v-model="query.activityType" placeholder="活动类型"
                   @change="query.groupStyle = (groupStatus.indexOf(query.activityType)>=0)">
          <el-option
            v-for="(item,index) in activityTypes"
            :label="item.remark"
            :value="item.name"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分组查询:" v-if="groupStatus.includes(query.activityType)">
        <el-checkbox v-model="query.groupStyle">分组返回</el-checkbox>
      </el-form-item>
      <el-form-item label="子订单数量:" v-if="groupStatus.includes(query.activityType)">
        <div style="display:flex;justify-items:center;">
          <number-range size="small" :min="-1" :map="{'-1':'任意'}" v-model="subOrderRange">
          </number-range>
        </div>
      </el-form-item>
      <el-form-item label="订单状态：">
        <el-select v-model="query.status" placeholder="请选择订单状态">
          <el-option
            v-for="(item,index) in OrderStatusEnum"
            :label="item.remark"
            :value="item.name"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="微信昵称 : ">
        <el-input v-model="query.wxName"></el-input>
      </el-form-item>
      <el-form-item label="手机号 : ">
        <el-input v-model="query.mobile"></el-input>
      </el-form-item>
      <el-form-item label="商品名称：">
        <el-input v-model="query.productName"></el-input>
      </el-form-item>
      <el-form-item label="物流单号 : ">
        <el-input v-model="query.expressNumber"></el-input>
      </el-form-item>
      <el-form-item label="选择日期 : ">
        <el-date-picker
          v-model="date"
          type="daterange"
          placeholder="选择日期范围"
          :editable="false"
          style="width: 230px;">
        </el-date-picker>
      </el-form-item>
      <el-button type="primary" style="margin-left:20px;" @click="total=0;loadData();">查询
      </el-button>
      <el-button @click="$resetData('query')">清空</el-button>
    </el-form>
    <el-table ref="table"
              :data="orderTable"
              @cell-click="cellClick"
              style="width: 100%" border v-loading="loading">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column v-if="groupStyle" width="80" column-key="expand" label="团订单数">
        <template slot-scope="scope" v-if="scope.row.headerOrderCode == scope.row.orderCode">
          <span>{{scope.row.groupOrderCount}}</span>
          <i class="el-icon-arrow-down" v-if="scope.row.expand"></i>
          <i class="el-icon-arrow-right" v-else></i>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="orderCode" width="220" label="订单号">
        <template slot-scope="scope"><i class="el-icon-star-on" style="color:red;"
                                        v-if="groupStyle && scope.row.headerOrderCode == scope.row.orderCode"></i> <a
          class="link" @click="checkOrderDetail(scope.row.orderCode)">{{scope.row.orderCode}}</a></template>
      </el-table-column>

      <el-table-column label="活动类型" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.activityType_res">{{scope.row.activityType_res}}</el-tag>
          <span v-else></span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="createAt_res" label="下单时间"></el-table-column>
      <el-table-column align="center" prop="" label="微信昵称">
        <template slot-scope="scope"><span>{{scope.row.createBy.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="联系方式" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.payInfo.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="商品名称" align="center">
        <template slot-scope="scope">
          {{scope.row.details.map(function (it) {
          it.product.name
          }).join(',')}}
          <!--<span style="display: inline-block;margin: 0 5px 5px 0" v-for="detail in scope.row.details">{{detail.product.name}}</span>-->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="number" label="数量"></el-table-column>
      <el-table-column prop="payInfo.payAmount" label="支付金额" align="center"></el-table-column>
      <el-table-column align="center" prop="status_res" label="状态"></el-table-column>

      <el-table-column align="center" prop="expressName" label="快递公司"></el-table-column>
      <el-table-column align="center" prop="expressNumber" label="快递单号"></el-table-column>
    </el-table>


    <el-pagination layout="prev, pager, next" v-if="total>10"
                   :total="total" :currentPage.sync="page" @current-change="loadData"
                   style="float:right;margin-top:20px;">
    </el-pagination>
  </div>
</template>
<script type="text/javascript">
    export default {
        name: 'order-list',
        props: {},
        data() {
            return {
                subOrderRange: [-1, 9],
                query: {
                    groupStyle: true,
                    activityType: '',
                    orderCode: '',
                    status: '',
                    wxName: '',
                    productName: '',
                    mobile: '',
                    start: '',
                    end: '',
                    expressNumber: ''
                },
                date: [],
                total: 0,
                page: 1,
                OrderStatusEnum: jv.OrderStatusEnum.getData(),
                groupStatus: ["Coin1", "Group2"],
                activityTypes: [],
                groupStyle: "", //结果
                loading: false,
                orderTable: [],
//        dialogFormVisible: false,
//        expressList: [],
//        expressForm: {
//          expressId: '',
//        },
            }
        },
        computed: {
            goods() {
                return window._vue._data.popData.products;
            }
        },
        mounted() {
            this.activityTypes = [{remark: '全部订单', name: ''}, ...jv.ActivityTypeEnum.getData()];
            this.loadData();

//      this.$http.post(this.proxyValue +'/order/getExpressList').then(res => {
//        this.expressList = res.data.data;
//      })
        },
        methods: {
            loadData(page) {
                if (page) {
                    this.page = page;
                }

                var dates = (this.date || []).spliceDate();
                // skip略过的条数，take每页显示多少条
                if (dates[0]) {
                    this.query.start = dates[0];
                }

                if (dates[1]) {
                    this.query.end = dates[1];
                }

//        if (this.groupStatus.indexOf(this.query.activityType) < 0) {
//          this.query.groupStyle = false;
//        }

                var para = Object.assign({}, this.query, {
                    skip: (this.page - 1) * 10,
                    take: 10,
                });

                para.subOrderStart = this.subOrderRange[0];
                para.subOrderEnd = this.subOrderRange[1];

                this.loading = true;

                this.$http.post("/info/order/find", para, {proxy: true}).then(res => {
                    var json = res.data.data;
                    this.groupStyle = this.query.groupStyle;
                    var index = 0;
                    json.forEach(item => {
                        if (this.groupStyle) {
                            item.expand = false;
                            item.display = item.headerOrderCode == item.orderCode;

                            if (item.display) {
                                item.index = (++index);
                            }
                        }

                        jv.OrderStatusEnum.fillRes(item, 'status');
                        jv.ActivityTypeEnum.fillRes(item, 'activityType');
                        item.payInfo.payAmount = item.payInfo.payAmount / 100;
                        item.createAt_res = item.createAt.toDateString('yyyy-MM-dd HH:mm:ss');
                        let counter = item.details.map((_item) => {
                            return _item.number
                        });
                        let number = 0;
                        for (let i = 0; i < counter.length; i++) {
                            number += counter[i];
                        }
                        item.number = number;

                    });
                    this.orderTable = res.data.data;
                    this.updateRowStyle();
                    //返回来的total只有第一次获取的时候才有值，第二次获取之后都是-1
                    if (res.data.total > -1) {
                        this.total = res.data.total;
                    }
                    this.loading = false;
                })

            },

            cellClick(row, column, cell, event) {
                if (column.columnKey == "expand") {
                    if (row.groupOrderCount <= 0) {
                        return;
                    }
                    row.expand = !row.expand;

                    this.orderTable.forEach(it => {
                        if (it.orderCode == row.orderCode) return;
                        if (it.headerOrderCode != row.headerOrderCode) return;
                        it.display = row.expand;
                    })

                    this.updateRowStyle();
                }
            },
            updateRowStyle() {
                this.$nextTick(it => {
                    var rows = this.$refs["table"].$el.querySelector("table.el-table__body").tBodies[0].rows;

                    //重置样式.
                    Array.from(rows).forEach(it => {
                        it.classList.remove("hide")
                        it.classList.remove("child")
                        it.classList.remove("expand")
                    });

                    if (!this.groupStyle) {
                        return;
                    }

                    for (var index in this.orderTable) {
                        var it = this.orderTable[index];
                        if (it.headerOrderCode == it.orderCode) {
                            if (it.groupOrderCount <= 0) {
                                continue;
                            }

                            if (it.expand) {
                                rows[index].classList.add("expand")
                            } else {
                                rows[index].classList.remove("expand")
                            }
                            continue;
                        }

                        if (it.display) {
                            rows[index].classList.add("child")
                            rows[index].classList.remove("hide")
                        } else {
                            rows[index].classList.add("hide")
                        }
                    }
                });
            },
            checkOrderDetail(orderCode) {
                this.$router.push('/info/order/detail?orderCode=' + orderCode)
            }
        }
    }
</script>
