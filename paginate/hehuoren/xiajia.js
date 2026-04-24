// paginate/hehuoren/puhuo.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    list: [],
    dev_id: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ dev_id: options.dev_id })
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
    this.getList()
  },
  getList() {
    app.post('vendingMachine/vmGoodsList', { dev_id: this.data.dev_id, status: 0 }).then(res => {
      this.setData({ list: res.data })
    })
  },
  edit(e) {
    console.log(e);
    let data = { ...e.currentTarget.dataset.item, ...{ dev_id: this.data.dev_id } }
    if (data.status == '正常') {
      app.post('vendingMachine/offShelfVMGoods', data).then(res => {
        wx.showToast({
          title: res.data, icon: 'none'
        })
        this.getList()
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    } else {
      app.post('vendingMachine/onShelfVMGoods', data).then(res => {
        wx.showToast({
          title: res.data, icon: 'none'
        })
        this.getList()
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    }
    // this.setData({isEdit: true})
  },
  edit_close() {
    this.setData({ isEdit: false })
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