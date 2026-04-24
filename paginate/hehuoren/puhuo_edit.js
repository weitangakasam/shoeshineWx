// paginate/hehuoren/puhuo_edit.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {
      title: '',
      money: 0.01,
      num: 6
    },
    isSelect: false,
    shopList: [],
    shopInfo: {
      count: 1,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    this.setData({shopInfo: {...this.data.shopInfo, ...options}})
    if (options.user_vm_goods_id != '0') {
      app.post('vendingMachine/goodsList', {type: 1}).then(res => {
        res.data.map(item => {
          if (item.user_vm_goods_id == parseInt(options.user_vm_goods_id)) {
            this.setData({
              shopInfo: {...this.data.shopInfo, ...item}
            })
          }
        })
      })
    }
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
  selectShop() {
    app.post('vendingMachine/goodsList', {type: 1}).then(res => {
      this.setData({
        isSelect: true,
        shopList: res.data
      })
    })

  },
  select_close() {
    this.setData({
      isSelect: false
    })
  },
  changeRadio(e) {
    let data = e.currentTarget.dataset.item
    this.setData({
      isSelect: false,
      shopInfo: {...this.data.shopInfo, ...data}
    })
  },
  delNum(e) {
    if (parseInt(this.data.shopInfo.count) < 2) {
      return
    }
    this.data.shopInfo.count = parseInt(this.data.shopInfo.count) - 1
    this.setData({
      shopInfo: this.data.shopInfo
    })
  },
  addNum(e) {
    this.data.shopInfo.count = parseInt(this.data.shopInfo.count) + 1
    this.setData({
      shopInfo: this.data.shopInfo
    })
  },
  changeNum(e) {
    if (parseInt(e.detail.value ) < 2) {
      this.data.shopInfo.count = 1
      this.setData({
        shopInfo: this.data.shopInfo
      })
      return
    }
    this.data.shopInfo.count = parseInt(e.detail.value)
    this.setData({
      shopInfo: this.data.shopInfo
    })
  },
  sureSubmit(e) {
    console.log(this.data.shopInfo);
    app.post('vendingMachine/setVMGoods', this.data.shopInfo).then(res => {
      wx.showToast({
        title: res.data, icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000)
    }).catch(err => {
      wx.showToast({
        title: err, icon: 'none'
      })
    })
  },
  changeMoney(e) {

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