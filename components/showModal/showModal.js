// components/showModal/showModal.js
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: Boolean,
    info: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    async close() {
      try {
        const res = await app.post("userSiteOrder/addCoupon", { dev_id: wx.getStorageSync('userInfo').dev_id })
        let userInfo = wx.getStorageSync('userInfo')
        userInfo.is_coupon = 'n'
        wx.setStorageSync('userInfo', userInfo)
        this.setData({
          hidden: false
        })
        app.showToast(res.data)
      } catch (error) {

      }
    }
  }
})
