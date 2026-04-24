
// import { openOrderSubscribe } from '../../utils/SubscribeMessage.js';

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '我的订单',
      'navH': app.globalData.navHeight,
      'class': 'app_bg_title'
    },
    loading: false,//是否加载中
    loadend: true,//是否加载完毕
    loadTitle: '加载更多',//提示语
    orderList: [],//订单数组
    // 获取订单信息参数
    params: {
      pageNo: 1, // 共几页
      size: 10, //每页显示数量
      type: 0, // 查看的订单状态
      'lt-id': 0,
      'lt-token': ''
    },
    // 获取微信支付请求参数
    wxPay: {
      'lt-id': '',
      'lt-token': '',
      'pay_code': '',
      'total_money': ''
    },
    // 取消订单参数
    orderDel: {
      'lt-id': '',
      'lt-token': '',
      'order_id': ''
    },
    orderData: {},//订单详细统计
    orderStatus: 0,//订单状态
    isClose: false,
    payMode: [
      { name: "微信支付", icon: "icon-weixinzhifu", value: 'weixin', title: '微信快捷支付' },
      { name: "余额支付", icon: "icon-yuezhifu", value: 'yue', title: '可用余额:', number: 0 },
    ],
    pay_close: false,
    pay_order_id: '',
    totalPrice: '0',
    totalPages: 0,
  },

  /**
   * 登录回调
   * 
  */
  onLoadFun: function () {
    // this.getOrderList();
    // this.getUserInfo();
  },
  /**
   * 事件回调
   * 
  */
  onChangeFun: function (e) {
    let opt = e.detail;
    let action = opt.action || null;
    let value = opt.value != undefined ? opt.value : null;
    (action && this[action]) && this[action](value);
  },
  /**
   * 获取用户信息
   * 
  */
  getUserInfo: function () {
    let that = this;
    app.post('user/personInfo').then(res => {
      that.data.payMode[1].number = res.data.money;
      that.setData({ payMode: that.data.payMode });
    })
  },
  /**
   * 关闭支付组件
   * 
  */
  pay_close: function () {
    this.setData({ pay_close: false });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({ 'parameter.return': options.is_return ? '0' : '1'});
    // 判断点击查看订单状态
    if (options.status) this.setData({ orderStatus: options.status });
    console.log(this.data.orderStatus)
    // 获取订单列表
    this.getOrderList()
  },

  // 获取订单列表
  getOrderList() {
    let type = this.data.orderStatus
    this.setData({
      'params.type': type,
      loading: true
    })
    console.log(this.data.params)
    app.post('userSiteOrder/orderList', this.data.params).then(res => {
      console.log(res)
      // 总条数
      const total = res.data.totalRecord
      // 计算分页数量
      // const totalPages = Math.ceil(total / 10)
      const totalPages = res.data.totalPage
      this.setData({
        orderList: [...this.data.orderList, ...res.data.datas],
        loading: false,
        orderStatus: type,
        totalPages: totalPages
      })
    }).catch(err => { this.setData({ loading: false }), console.log(err + '错误') })
  },

  // 立即支付
  goPay(e) {
    console.log('’正在支付');
    console.log(e);
    this.setData({
      wxPay: {
        'lt-id': wx.getStorageSync('lt-id'),
        'lt-token': wx.getStorageSync('lt-token'),
        'pay_code': e.currentTarget.dataset.pay_code,
        'total_money': e.currentTarget.dataset.pay_money
      },
    })
    console.log(this.data.wxPay);
    // 获取微信支付参数
    app.post('wXMiNiProgram/getCodeForOrderPay', this.data.wxPay).then(res => {
      console.log(res)
      // 调用微信支付api
      app.pay(res.data, () => {
        wx.showToast({
          title: '支付成功',
        })
        console.log('支付成功', res)
        this.getOrderList()
      })
    }).catch(err => {
      app.showToast(err)
    })
  },
  // 取消订单
  cancelOrder(e) {
    console.log(e);
    this.setData({
      orderDel: {
        'lt-id': wx.getStorageSync('lt-id'),
        'lt-token': wx.getStorageSync('lt-token'),
        'order_id': e.currentTarget.dataset.order_id
      }
    })
    app.post('order/del', this.data.orderDel).then(res => {
      if (res.data == '取消订单成功') {
        this.getOrderList()
      } else {
        wx.showToast({
          title: '取消订单失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 获取订单统计数据
   * 
  */
  getOrderData: function () {
    var that = this;
    app.post('order/data').then(res => {
      that.setData({ orderData: res.data });
    })
  },
  /**
   * 取消订单
   * 
  */
  cancelOrder1: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    var index = e.currentTarget.dataset.index, that = this;
    if (!order_id) return app.showToast('缺少订单号无法取消订单');
    app.post('order/cancel', order_id).then(res => {
      app.showToast(res.data, success)
      that.data.orderList.splice(index, 1);
      that.setData({ orderList: that.data.orderList, 'orderData.unpaid_count': that.data.orderData.unpaid_count - 1 });
    }).catch(err => {
      app.showToast(err)
    });
  },
  confirmOrder: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    var index = e.currentTarget.dataset.index, that = this;
    if (!order_id) return app.showToast('缺少订单号无法取消订单');
    app.post('order/finish', order_id).then(res => {
      app.showToast('确认成功', 'success')
      that.setData({ loadend: false, page: 1, orderList: [], pay_close: false, pay_order_id: '' });
      that.getOrderList()
    }).catch(err => {
      app.showToast(err)
    })
  },
  Paste() {
    wx.showToast({
      title: '复制成功',
    })
    wx.setClipboardData({
      data: '点击复制的内容',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
  toReview: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order_details/index?order_id=' + order_id })
  },
  /**
   * 打开支付组件
   * 
  */
  goPay1: function (e) {
    let {
      pay_code,
      order_id,
      pay_money
    } = e.currentTarget.dataset
    this.setData({ pay_close: true, pay_order_id: order_id, totalPrice: pay_money, pay_code });
  },
  /**
   * 支付成功回调
   * 
  */
  pay_complete: function () {
    this.setData({ loadend: false, page: 1, orderList: [], pay_close: false, pay_order_id: '' });
    this.getOrderList();
  },
  /**
   * 支付失败回调
   * 
  */
  pay_fail: function () {
    this.setData({ pay_close: false, pay_order_id: '' });
  },
  /**
   * 去订单详情
  */
  goOrderDetails: function (e) {
    console.log(e)
    var order_id = e.currentTarget.dataset.order_id;
    if (!order_id) return app.showToast('缺少订单号无法查看订单详情');
    wx.showLoading({
      title: '正在加载',
    })
    // openOrderSubscribe().then(() => {
    //   wx.hideLoading();
    //   wx.navigateTo({ url: '/pages/order_details/index?order_id=' + order_id })
    // }).catch(() => {
    //   wx.hideLoading();
    // })
  },
  /**
   * 切换类型
  */
  statusClick: function (e) {
    console.log(this.data.orderStatus)
    var status = e.currentTarget.dataset.status;
    console.log(status)
    if (status == this.data.orderStatus) return;
    this.setData({ orderStatus: status, loadend: false, orderList: [], 'params.pageNo': 1 });
    this.getOrderList();
  },
  /**
   * 获取订单列表
  */
  // getOrderList:function(flag){
  //   var that=this;
  //   if(that.data.loadend) return;
  //   if(that.data.loading) return;
  //   that.setData({ loading: true, loadTitle:""});
  //   getOrderList({
  //     status: flag ? '' : that.data.orderStatus,
  //     pageNo: that.data.page,
  //     pageSize: that.data.limit,
  //   }).then(res=>{
  //     var list = res.data.datas || [];
  //     var loadend = list.length < that.data.limit;
  //     that.data.orderList = app.SplitArray(list, that.data.orderList);
  //     that.setData({
  //       orderList: that.data.orderList,
  //       loadend: loadend,
  //       loading: false,
  //       loadTitle: loadend ? "我也是有底线的" : '加载更多',
  //       page: that.data.page + 1,
  //     });
  //   }).catch(err=>{
  //     that.setData({ loading: false, loadTitle: "加载更多" });
  //   })
  // },

  /**
   * 删除订单
  */
  delOrder: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    var index = e.currentTarget.dataset.index, that = this;
    app.post('order/del', this.data.orderDel).then(res => {
      that.data.orderList.splice(index, 1);
      that.setData({ orderList: that.data.orderList, 'orderData.unpaid_count': that.data.orderData.unpaid_count - 1 });
      that.getOrderData();
      return app.showToast('删除成功', 'success');
    }).catch(err => {
      return app.showToast(err);
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var flag = true;
    // if (app.globalData.orderStatus != null) {
    //   flag = false;
    //   this.setData({
    //     orderStatus: app.globalData.orderStatus
    //   })
    // } else {
    //   this.setData({
    //     orderStatus: ""
    //   })
    // }
    // if (wx.getStorageSync('isLog')){
    //   // this.setData({ loadend: false, page: 1, orderList:[]});
    //   // this.getOrderList(flag);
    //   this.getUserInfo();
    // } 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ isClose: true });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getOrderList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  handleBottom() {
    if (this.data.params.pageNo <= this.data.totalPages) {
      let pageNo = this.data.params.pageNo++
      console.log('asdaw');
      console.log(pageNo++);
      this.setData({
        'params.pageNo': pageNo++,
      })
      // console.log(this.data.params.pageNo++);
      this.getOrderList()
    } else {
      wx.showToast({
        title: '已经到底了',
        icon: 'none'
      })
    }
    console.log('135a4wd5wa4');
  }
})