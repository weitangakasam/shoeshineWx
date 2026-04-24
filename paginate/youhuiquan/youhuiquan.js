// paginate/youhuiquan/youhuiquan.js
let app = getApp()
let style = `
 --navh: 92px
`
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '优惠券',
      'color': '#fff',
      'class': 'app_bg_title',
      'navH': app.globalData.navHeight
    },
    list: null,
    hidden: false,
    hidden2: false,
    buyInfo: {},
    type: '我的优惠券',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.getList()
  },
  changeTab(e) {
    this.setData({
      type: e.currentTarget.dataset.type
    })
    this.getList()
  },
  getList() {
    if (this.data.type == '购买优惠券') {
      app.post('coupon/systemCouponList').then(res => {
        res.data.map(item => {
          let a = item.voucher_rate * 100 + ''
          item.voucher_rate = [parseInt(a.substr(0, 1)), parseInt(a.substr(1, 1))]
        })
        console.log(res);
        this.setData({ list: res.data })
      })
    }
    else if (this.data.type == '我的优惠券') {
      app.post('userSiteOrder/couponInfo').then(res => {
        if (JSON.stringify(res.data.full_money) == '{}' || JSON.stringify(res.data.minus_money) == '{}') {
          return
        }
        // res.data.map(item => {
        //   if (item.rate > 0) {
        //     item.rate2 = [(item.rate * 100 + '').substr(0, 1), (item.rate * 100 + '').substr(1, 1)]
        //   }
        // })
        this.setData({
          list: res.data
        })
      })
    }
  },
  async buy(e) {
    let item = e.currentTarget.dataset.item
    console.log(item);
    this.setData({
      buyInfo: item,
      hidden: true
    })
  },
  useGuize(e) {
    console.log(e);
    let item = e.currentTarget.dataset.item
    this.setData({ hidden2: true, buyInfo: item })
  },
  close() {
    this.setData({ hidden: false, hidden2: false })
  },
  async sure() {
    console.log(this.data.buyInfo);
    try {
      const res = await app.post('coupon/addOrder', { coupon_id: this.data.buyInfo.id })
      const res2 = await app.post('wXMiNiProgram/getCodeForCouponOrderPay', res.data)
      app.pay(res2.data, () => {
        app.showToast('支付成功')
      })
    } catch (error) {
      app.showToast(error)
    }
  },
  goPages(e) {
    let url = e.currentTarget.dataset.url
    wx.setStorageSync('buyInfo', this.data.buyInfo.description)
    wx.navigateTo({
      url: url,
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})