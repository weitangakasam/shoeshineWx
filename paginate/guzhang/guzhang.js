// paginate/guzhang/guzhang.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '故障申报',
      'color': '#fff',
      'class': 'app_bg_title',
      'navH': app.globalData.navHeight
    },
    radioList: [
      {name: '设备无反应'},
      {name: '设备故障'},
      {name: '结算错误'}
    ],
    params: {
      imgs: [],
      only_code: null,
    }
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

  },

  chooseMedia() {
    let that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        wx.uploadFile({
          url: app.globalData.baseUrlUpload, //仅为示例，非真实的接口地址
          filePath: res.tempFiles[0].tempFilePath,
          name: 'file',
          formData: {
            'lt-id': wx.getStorageSync('lt-id'),
            'lt-token': wx.getStorageSync('lt-token')
          },
          success(res) {
            console.log(res);
            const img = [JSON.parse(res.data).data]
            that.setData({ 'params.imgs': [...that.data.params.imgs, ...img]})
          }
        })
      }
    })
  },

  del(e) {
    console.log(e);
    let data = e.currentTarget.dataset
    this.data.params.img.splice(data.index, 1)
    this.setData({
      'params.imgs': this.data.params.imgs
    })
  },
  scan() {
    let that = this
    wx.scanCode({
      success: (res) => {
        console.log(res);
        let q = decodeURIComponent(res.result)
        console.log(q);
        if (q.indexOf("dev_id") == -1) {
          wx.showModal({
            title: '提示',
            content: '二维码错误',
            showCancel: false
          })
          return
        }
        let dev_id = q.split('?')[1].split('=')[1]
        this.setData({ 'params.only_code':dev_id })
        // that.getList()
      }
    })
  },
  changeInput(e) {
    let data= e.currentTarget.dataset
    this.data.params[data.name] = e.detail.value
    this.setData({
      params: this.data.params
    })
  },
  async sure(e) {
    let data = {...e.detail.value, ...this.data.params}
    if (!data.only_code) return app.showToast("请输入设备号")
    if (!data.type) return app.showToast("请选择故障类型")
    if (!data.info) return app.showToast("请输入故障信息")
    if (data.imgs.length == 0) return app.showToast("请上传图片")
    if (!data.name) return app.showToast("请输入联系人")
    if (!data.mobile) return app.showToast("请输入联系电话")
    if (!(/^1[3456789]\d{9}$/.test(data.mobile))) return app.showToast('请输入正确联系人电话') 
    data.imgs = data.imgs.join(',')
    try {
      const res = await app.post('userSiteOrder/addFaultInfo', data)
      wx.showModal({
        title: '提示',
        content: res.data,
        showCancel: false,
        success: a => {
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    } catch (error) {
      app.showToast(error)
    }
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