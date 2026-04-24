// pages/nearby/nearby.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '卡米自助洗车平台',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    list: [],
    swiper: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocation()
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

  },
  async getList() {
    let params = {}
    if (wx.getStorageSync('location')) {
      let location = wx.getStorageSync('location')
      params.user_lng = location.longitude
      params.user_lat = location.latitude
    }
    const res1 = await app.post('banner/imgList')
    const res2 = await app.post('userSiteOrder/nearSite', params)
    res2.data.map(item => {
      if (item.distance < 1) {
        item.distance = (item.distance * 1000).toFixed(2) + 'm'
      } else {
        item.distance = item.distance.toFixed(2) + 'km'
      }
    })
    this.setData({
      swiper: res1.data.banner,
      list: res2.data,
    })
  },
  getLocation() {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res);
        wx.setStorageSync('location', res)
        that.getList()
      },
      fail: err => {
        console.error(err);
        wx.showModal({
          title: '提示',
          content: '附近信息，需要授权位置消息',
          confirmText: '去授权',
          cancelText: '拒绝',
          success: a => {
            if (a.confirm) {
              wx.openSetting({
                success(res) {
                  console.log(res.authSetting)
                  // res.authSetting = {
                  //   "scope.userInfo": true,
                  //   "scope.userLocation": true
                  // }
                }
              })
            }
          }
        })

      }
    })
  },

  goPages(e) {
    console.log(e);
    let url = e.currentTarget.dataset.url
    let item = e.currentTarget.dataset.item
    if (url == '/paginate/rich_text/rich_text') {
      wx.navigateTo({
        url: `${url}?type=公告`,
      })
      return
    }
    item = '869298055041073'
    app.globalData.dev_id = '869298055041073'
    wx.navigateTo({
      url: `${url}?dev_id=${item}`,
    })
  },
  bindload(e) {
    app.bindload(e, this)
  },
  openLocation(e) {
    let item = e.currentTarget.dataset.item
    wx.openLocation({
      latitude: parseFloat(item.addr_lat),
      longitude: parseFloat(item.addr_lng),
      name:item.addr_location,
      scale: 18
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