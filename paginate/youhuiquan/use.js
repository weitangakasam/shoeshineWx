
import { Base64 } from '../../utils/util'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataType: '售货机',
    orderList: [],
    totalPage: 1,
    params: {
      type: '全部',
      pageNo: 1,
      size: 3,
    },
    isTop: false,
    payMode: [
      { name: "微信支付", icon: "icon-weixinzhifu", value: 'weixin', title: '微信快捷支付' },
      { name: "余额支付", icon: "icon-yuezhifu", value: 'yue', title: '可用余额:', number: 100 },
    ],
    pay_close: false,
    pay_order_id: '',
    totalPrice: '',
    pay_code: '',
    no_more: false,
    isSetInfo: false,
    isReadInfo: false,
    readInfo: {},
    isSkQrcode: false,
    skQrcodeInfo: '',
    isCadInfo: false,
    cadInfo: {},
    isLogin: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
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
    if (wx.getStorageSync('lt-token')) {
      this.data.params.pageNo = 1
      this.setData({ isLogin: true, orderList: [] })
      this.orderList()
    } else {
      this.setData({ isLogin: false })
    }

  },
  // tab切换
  bindHeaderTap(e) {
    // this.setData({ dataType: e.currentTarget.dataset.type })
    this.setData({
      dataType: e.currentTarget.dataset.type,
      list: {},
      isLoading: true,
      no_more: false,
      orderList: [],
      'params.type': e.currentTarget.dataset.type,
      'params.pageNo': 1,
    });
    // 获取订单列表
    this.orderList();

  },
  // 订单列表
  orderList() {
    if (this.data.dataType == '售货机') {
      // app.post('bluetooth/orderList', this.data.params).then(res => {
      //   // let base = new Base64();
      //   // res.data.datas.map(item => {
      //   //   item.nickname = base.decode(item.nickname);
      //   // })
      //   this.setData({
      //     orderList: [...this.data.orderList, ...res.data.datas],
      //     totalPage: res.data.totalPage
      //   })
      // })
      app.post('coupon/myUsedCouponList', this.data.params).then(res => {
        this.setData({
          orderList: [...this.data.orderList, ...res.data],
        })
      })
    }
    if (this.data.dataType == '租赁机') {
      app.post('rentalBox/myOrderList', this.data.params).then(res => {
        this.setData({
          orderList: [...this.data.orderList, ...res.data.datas],
          totalPage: res.data.totalPage
        })
      })
    }
  },

  // 转卖
  resellOrder(e) {
    console.log(e);
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "友情提示",
      content: "确认要转卖该订单吗？",
      success(o) {
        if (o.confirm) {
          let params = {
            order_id
          }
          // 是否有收款方式
          // payeeInfo().then(res => {
          //   const { bank_card, payee_name, wx_img, zfb_img } = res.data
          //   if (bank_card != '' && payee_name != '' || wx_img != '' || zfb_img != '') {
          //     resell(params).then(res => {
          //       // console.log(res);
          //       wx.showToast({
          //         title: res.data, icon: 'none',
          //         success: a => {
          //           _this.setData({
          //             orderList: [],
          //             'params.page': 1,
          //           })
          //           _this.orderList()
          //         }
          //       })
          //     }).catch(err => {
          //       wx.showToast({
          //         title: err, icon: 'none'
          //       })
          //     })
          //   } else {
          //     wx.navigateTo({
          //       url: '/paginate/shoukuan/shoukuan',
          //     })
          //   }
          // })
        }
      }
    });
  },
  // 已付款
  yPay(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "友情提示",
      content: "您已经向卖家付款了吗",
      success(o) {
        if (o.confirm) {
          // collectionCollection({ order_id }).then(res => {
          //   wx.showToast({
          //     title: res.data, icon: 'none'
          //   })
          //   _this.onShow()
          // }).catch(err => wx.showToast({ title: err, icon: 'none' }))
        }
      }
    });
  },

  // 支付弹窗回调
  onChangeFun: function (e) {
    let opt = e.detail;
    this.setData({ pay_close: false })
    this.onShow()
  },
  // 申诉
  appeal(e) {
    wx.navigateTo({
      url: '/pages/user/jianyiadd?order_id=' + e.currentTarget.dataset.id,
    })
  },


  onPayOrder(e) {
    console.log(e);
    let {
      pay_code,
      id,
      pay_money,
      type
    } = e.currentTarget.dataset
    if (type == '积分商品') {
      this.setData({
        payMode: [{ name: "积分支付", icon: "icon-yuezhifu", value: 'jifen', title: '可用积分:', number: this.data.userInfo.integral_money },],
      })
    }
    this.setData({ pay_close: true, pay_order_id: id, totalPrice: pay_money, pay_code });
    let _this = this;
    // 显示支付方式弹窗
    // _this.onTogglePayPopup();
  },
  // 跳转详情页
  navigateToDetail(e) {
    console.log(e);
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../order/detail?order_id=' + order_id
    });
  },
  // 复制
  copy(e) {
    // console.log(e);
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.params.pageNo < this.data.totalPage) {
      this.setData({
        'params.pageNo': this.data.params.pageNo + 1
      })
      this.orderList()
    } else {
      this.setData({ no_more: true })
    }
  },
})