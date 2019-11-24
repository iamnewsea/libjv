<template>
  <div>
    <div class="header-info">
      <p>订单:{{info.orderCode}}</p>
      <el-button size="large" class="receive-btn" type="primary" @click="setPayed" v-if="info.status == 'Created'">
        设置为已付款
      </el-button>
      <el-button size="large" class="receive-btn" type="primary" @click="changeStatusToPrepare"
                 v-if="info.status == 'Payed'">设置为备货
      </el-button>
      <el-button size="large" class="receive-btn" type="primary" @click="openDeliveryDialog"
                 v-if="info.status == 'Prepare'">
        设置物流信息
      </el-button>
    </div>
    <div class="order-detail" v-loading="loading">
      <div>
        <p class="order-number"><span class="padding">订单号：{{info.orderCode}}</span><span>状态：</span>
          <el-tag type="primary">{{info.status_res}}</el-tag>
        </p>
        <el-table :data="info.details" border style="width: 100%">
          <el-table-column prop="product.name" label="产品名称" align="center"></el-table-column>
          <el-table-column prop="price" label="单价" align="center">
            <template slot-scope="scope">
              <div>{{scope.row.price | money}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="number" label="数量" align="center"></el-table-column>
          <el-table-column prop="amount" label="总价" align="center">
            <template slot-scope="scope">
              <div>{{scope.row.amount | money}}</div>
            </template>
          </el-table-column>

          <el-table-column prop="type_res" label="下单类型" align="center"></el-table-column>

        </el-table>
      </div>
      <div class="marginT40 clear-fix" v-if="info.receiveAddress">
        <div class="detailBox marginR20">
          <p class="order-number"><span>收货人信息</span></p>
          <el-card>
            <p class="card-info"><span class="card-text">收货人：</span><span>{{info.receiveAddress.userName}}</span></p>
            <p class="card-info"><span
              class="card-text">地址：</span><span>{{info.receiveAddress.city.name}}{{info.receiveAddress.address}}</span>
            </p>
            <p class="card-info"><span class="card-text">电话：</span><span>{{info.receiveAddress.mobile}}</span></p>
          </el-card>
        </div>
        <div class="detailBox">
          <p class="order-number"><span>配送信息</span></p>
          <el-card>
            <p class="card-info"><span class="card-text">物流单号：</span><span>{{info.expressNumber}}</span></p>
            <p class="card-info"><span class="card-text">物流公司：</span><span>{{info.express && info.express.name}}</span>
            </p>
            <p class="card-info"><span class="card-text">发货时间：</span><span>{{info.sentAt_res}}</span></p>
            <p class="card-info"><span class="card-text">接收时间：</span><span>{{info.receiveAt_res}}</span></p>
          </el-card>
        </div>
        <div class="detailBox marginR20" v-if="info.payInfo">
          <p class="order-number"><span>支付信息</span></p>
          <el-card>
            <p class="card-info"><span class="card-text">支付人：</span><span>{{info.createBy.name}}</span></p>
            <p class="card-info"><span class="card-text">支付方式：</span><span>{{info.payInfo.payType_res}}</span></p>
            <p class="card-info"><span class="card-text">总金额：</span><span>{{info.payInfo.payAmount | money}}</span></p>
            <!--<p class="card-info"><span class="card-text">发票抬头：</span><span>{{info.payInfo.invoice.name}}</span></p>-->
            <!--<p class="card-info"><span class="card-text">发票类型：</span><span>{{info.payInfo.invoice.type_res}}</span></p>-->
            <p class="card-info"><span class="card-text">备注：</span><span>{{info.payInfo.remark}}</span></p>
          </el-card>
        </div>

        <div class="detailBox" v-if="info.payInfo.invoice.name">
          <p class="order-number"><span>发票信息</span></p>
          <el-card>
            <p class="card-info"><span class="card-text">发票抬头：</span><span>{{info.payInfo.invoice.name}}</span></p>
            <p class="card-info"><span class="card-text">发票类型：</span><span>{{info.payInfo.invoice.type_res}}</span></p>
            <p class="card-info" v-if="info.payInfo.invoice.type!='Person'"><span class="card-text">发票税号：</span><span>{{info.payInfo.invoice.corpNumber}}</span>
            </p>
            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'"><span class="card-text">企业地址：</span><span>{{info.payInfo.invoice.address}}</span>
            </p>
            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'"><span class="card-text">电话号码：</span><span>{{info.payInfo.invoice.phone}}</span>
            </p>
            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'"><span class="card-text">开户银行：</span><span>{{info.payInfo.invoice.bankName}}</span>
            </p>
            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'"><span class="card-text">银行账户：</span><span>{{info.payInfo.invoice.bankAccount}}</span>
            </p>

            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'">
              <span class="card-text">营业执照：</span>
              <img style="width: 100px" @click="CheckQualificationClick" :src="info.payInfo.invoice.license.fullUrl"
                   class="image"/>
            </p>

            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'">
              <span class="card-text">纳税人证明：</span>
              <span><img @click="CheckQualificationClick" style="width: 100px"
                         :src="info.payInfo.invoice.taxpayer.fullUrl" class="image"/></span>
            </p>

            <p class="card-info" v-if="info.payInfo.invoice.type=='Tax'">
              <span class="card-text">开户许可证：</span><img @click="CheckQualificationClick" style="width: 100px"
                                                        :src="info.payInfo.invoice.bankImage.fullUrl" class="image"/>
            </p>
          </el-card>
        </div>

      </div>
    </div>

    <!--弹出框-->

    <el-dialog title="物流信息" :visible.sync="deliveryFormVisible" :close-on-click-modal="false" :show-close="false"
               width="50%" v-if="deliveryForm.express">
      <el-form :model="deliveryForm" ref="deliveryForm" label-width="100px">
        <el-form-item label="物流公司: " label-width="90px" chk="*">
          <el-select v-model="deliveryForm.express.id" placeholder="请选择" style="width: 300px;">
            <el-option
              v-for="express in expressList"
              :key="express.id"
              :label="express.name"
              :value="express.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="物流单号：" chk="*">
          <el-input v-model="deliveryForm.expressNumber" placeholder="请输入物流单号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deliveryFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="deliveryInfo()">确认发货</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
    export default {
        name: "order-detail",
        props: {},
        computed: {},
        data() {
            return {
                deliveryFormVisible: false,
                info: {}, //返回的数据
                deliveryForm: {},
                expressList: [],
                loading: false
            }
        },
        filters: {
            money(value) {
                return '￥' + parseFloat(value).toFixed(2)
            }
        },
        mounted() {
            this.getGoods();
            this.$http.post('/info/express/find', {}, {proxy: true}).then(res => {
                this.expressList = res.data.data;
            })
        },
        methods: {
            getGoods() {
                let param = {orderCode: this.$route.query.orderCode};
                if (!param.orderCode) {
                    jv.error("找不到OrderCode,参数非法")
                    return;
                }
                this.loading = true;
                this.$http.post('/info/order/findByOrderCode', param, {proxy: true}).then((res) => {

                    let json = res.data.data;

                    json.details.forEach((item) => {
                        //item.hasCover_res = item.hasCover ? "是" : "否";
                        item.price = parseFloat(item.price) / 100;
                        item.amount = parseFloat(item.amount) / 100
                    });
                    json.receiveAt_res = json.receiveAt.toDateString('yyyy-MM-dd HH:mm:ss');
                    json.sentAt_res = json.sentAt.toDateString('yyyy-MM-dd HH:mm:ss');
                    json.createAt_res = json.createAt.toDateString('yyyy-MM-dd HH:mm:ss');
                    jv.PayTypeEnum.fillRes(json.payInfo, 'payType');
                    jv.InvoiceTypeEnum.fillRes(json.payInfo.invoice,'type');
                    jv.OrderStatusEnum.fillRes(json, 'status');

                    json.payInfo.payAmount = parseFloat(json.payInfo.payAmount) / 100;

                    this.deliveryForm = {express: json.express, expressNumber: json.expressNumber};
                    this.info = json;

                    this.$emit("loaded", this.info);

                    this.loading = false;
                })
            },
            //点击发货
            openDeliveryDialog() {
                this.deliveryFormVisible = true;
            },
            CheckQualificationClick(e) {
                window.open(e.target.src);
            },
            setPayed() {
                this.$http.post('/info/order/setStatus', {
                    orderCode: this.info.orderCode,
                    status: "Payed"
                }, {proxy: true}).then(res => {
                    this.getGoods();
                    this.$message.info('该订单状态已修改为已付款');
                })
            },
            //修改状态为备货状态
            changeStatusToPrepare() {
                this.$http.post('/info/order/setStatus', {
                    orderCode: this.info.orderCode,
                    status: "Prepare"
                }, {proxy: true}).then(res => {
                    this.getGoods();
                    this.$message({
                        message: '该订单状态已修改为备货',
                        type: 'success'
                    });
                })

            },
            //确认发货(物流信息)
            deliveryInfo() {
                if (this.$refs['deliveryForm'].chk() == false) {
                    return;
                }

                this.deliveryForm.express.name = this.expressList.find(it => it.id == this.deliveryForm.express.id).name;

                let para = {
                    express: this.deliveryForm.express,
                    expressNumber: this.deliveryForm.expressNumber,
                    orderCode: this.info.orderCode,
                    status: "Delivered",
                };
                this.$http.post('/info/order/setStatus', para, {proxy: true}).then(res => {
                    this.deliveryFormVisible = false;
                    this.getGoods();
                    this.$message({
                        message: '物流信息修改成功',
                        type: 'success'
                    });
                })


            },
        }
    }
</script>

<style scoped>
  .order-detail {
    margin: 20px 0;
  }

  .order-number {
    padding: 10px;
    font-size: 16px;
  }

  .order-number span.padding {
    padding-right: 30px;
  }

  .detailBox {
    width: 48%;
    float: left;
  }

  .marginR20 {
    margin-right: 20px;
  }

  .marginT40 {
    margin-top: 40px;
  }

  .detailBox .card-info {
    padding: 5px 0;
    font-size: 14px;
  }

  .detailBox .card-info .card-text {
    display: inline-block;
    width: 70px;
    text-align: right;
  }

</style>
