// paginate/yijian/yijian.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '意见反馈',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    list: []
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
    this.getlist();
  },
  //获取建议列表
  getlist() {
    let _this = this;
    app.post('user/feedbackList').then(res => {
      console.log(res);
      this.setData({ list: res.data })
    })
  },
  //跳转详情页面
  godetail(e) {
    let item = e.currentTarget.dataset.item;
    console.log(e);
    wx.navigateTo({
      url: '/paginate/yijian/detail?info=' + JSON.stringify(item),
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