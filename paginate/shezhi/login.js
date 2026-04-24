// paginate/shezhi/login.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '登录',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    identity: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      identity: options.identity
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  submit(e) {
    console.log(e);
    let data = e.detail.value
    if (!data.username) return wx.showToast({
      title: '请输入用户名', icon: 'none'
    })
    if (!data.password) return wx.showToast({
      title: '请输入密码', icon: 'none'
    })
    if (this.data.identity == '代理') {
      app.post('manage/login', e.detail.value).then(res => {
        wx.setStorageSync('agent-id', res.data.user_id)
        wx.setStorageSync('agent-token', res.data.token)
        wx.setStorageSync('agent_info', res.data)
        wx.redirectTo({
          url: '/paginate/hehuoren/hehuoren',
        })
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    } else if (this.data.identity == '商家') {
      app.post('shoper/login', e.detail.value).then(res => {
        wx.setStorageSync('shoper-id', res.data.user_id)
        wx.setStorageSync('shoper-token', res.data.token)
        wx.setStorageSync('shoper_info', res.data)
        wx.redirectTo({
          url: '/paginate/order/hexiao',
        })
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})