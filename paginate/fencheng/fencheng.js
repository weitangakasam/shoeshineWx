

import { Base64 } from '../../utils/util2'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '分成',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    dataType: '售货机',
    orderList: [],
    totalPage: 1,
    params: {
      type: '全部',
      pageNo: 1,
      size: 10,
      only_code: '',
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
    date: null,
    date2: null,
    statusArr: ['全部', '已完成', '待付款', '使用中', '已取消'],
    statusArrIndex: 0,
    money: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let now = new Date(); //当前日期 
    // let nowYear = now.getFullYear(); //当前年
    // let nowMonth = now.getMonth(); //当前月 
    // let day = now.getDate(); // 当前日
    // const start = nowYear + '-' + (((nowMonth + 1) + '').length < 2 ? '0' + (nowMonth + 1) : nowMonth + 1) + '-' + '01'
    // const end = nowYear + '-' + (((nowMonth + 1) + '').length < 2 ? '0' + (nowMonth + 1) : nowMonth + 1) + '-' + (day.length < 2 ? '0' + day : day)
    // const order_time = start + ' 00:00:00' + ',' + end + ' 00:00:00'
    // this.setData({ date: start, date2: end })
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
    if (wx.getStorageSync('agent-token')) {
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
      const params = {}
      if (this.data.date && this.data.date2) {
        params.search_date = this.data.date + ' 00:00:00' + '至' + this.data.date2 + ' 24:00:00'
      }
      app.post('manageOrder/awardsList', {...this.data.params, ...params}).then(res => {
        let base = new Base64();
        res.data.datas.map(item => {
          item.nickname = base.decode(item.nickname);
        })
        this.setData({
          orderList: [...this.data.orderList, ...res.data.datas],
          totalPage: res.data.totalPage
        })
      })
    }
    if (this.data.dataType == '租赁机') {
      app.post('rentalBox/orderList', this.data.params).then(res => {
        this.setData({
          orderList: [...this.data.orderList, ...res.data.datas],
          totalPage: res.data.totalPage
        })
      })
    }
    this.getMoney()
  },

  getMoney() {
    const params = {}
    if (this.data.date && this.data.date2) {
        params.search_date = this.data.date + ' 00:00:00' + '至' + this.data.date2 + ' 24:00:00'
    }
    app.post('manageOrder/record', { ...this.data.params, ...params }).then(res => {
        this.setData({
            money: res.data
        })
    }).catch(err => {
        wx.showModal({
          title: '提示',
          content: err,
          showCancel: false
        })
        this.setData({
            money: 0
        })
    })
},

changeValue(e) {
    this.setData({
        'params.only_code': e.detail.value
    })
},

  // 取消订单
  cancelOrder(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "友情提示",
      content: "确认要取消该订单吗？",
      success(o) {
        if (o.confirm) {
          let params = {
            order_id
          }
          return
          cancel(params).then(res => {
            // console.log(res);
            wx.showToast({
              title: res.data, icon: 'none',
              success: a => {
                _this.setData({
                  orderList: [],
                  'params.page': 1,
                })
                _this.orderList()
              }
            })
          }).catch(err => {
            wx.showToast({
              title: err, icon: 'none'
            })
          })
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
  // 用户信息
  personInfo() {
    app.post('user/personInfo').then(res => {
      this.data.payMode = [
        { name: "微信支付", icon: "icon-weixinzhifu", value: 'weixin', title: '微信快捷支付' },
        { name: "余额支付", icon: "icon-yuezhifu", value: 'yue', title: '可用余额:', number: 100 },]
      console.log(this.data.payMode);
      this.data.payMode[1].number = res.data.money
      // let base = new Base64();
      // res.data.nickname = base.decode(res.data.nickname);
      this.setData({ userInfo: res.data, payMode: this.data.payMode })
    })
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
  bindDateChange(e) {
    console.log(e);
    this.setData({
      date: e.detail.value
    })
    const order_time = e.detail.value + ' 00:00:00' + ',' + this.data.date2 + ' 00:00:00'
  },
  bindDateChange2(e) {
    console.log(e);
    this.setData({
      date2: e.detail.value
    })
    const order_time = this.data.date + ' 00:00:00' + ',' + e.detail.value + ' 00:00:00'
  },
  bindPickerChange3(e) {
    console.log(e);
    this.setData({
      statusArrIndex: parseInt(e.detail.value),
      'params.status': e.detail.value == '0' ? '' : this.data.statusArr[parseInt(e.detail.value)]
    })
  },
  search() {
    // if (!this.data.date || !this.data.date2) {
    //   app.showToast('请选择开始和结束日期')
    //   return
    // }
    this.setData({
      'params.pageNo': 1,
      'params.size': 10,
      orderList: [], totalPage: 1
    })
    this.orderList()
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