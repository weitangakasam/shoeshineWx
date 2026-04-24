// paginate/hehuoren/changsuo_admin.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '场地管理',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    list: [],
    isEdit: false,
    editValue: {},
    position: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.globalData.nav
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
  goPages(e) {
    let data = e.currentTarget.dataset
    console.log(e);
    // if (data.url == '/paginate/submitInfo/changsuo_list') {
    //   wx.navigateTo({
    //     url: data.url + '?addr_id=' + data.item.id,
    //   })
    // }
    if (data.url == '/paginate/hehuoren/shebei_admin') {
      wx.navigateTo({
        url: data.url + '?addr_id=' + data.item.id,
      })
    } else {
      wx.navigateTo({
        url: data.url
      })
    }

  },
  getList() {
    app.post('manageAddress/addressList').then(res => {
      this.setData({
        list: res.data
      })
    })
  },
  edit(e) {
    console.log(e);
    this.setData({
      isEdit: true,
      editValue: { ...e.currentTarget.dataset.item, ...{ address_id: e.currentTarget.dataset.item.id } },
      position: e.currentTarget.dataset.item.addr_location
    })
  },
  edit_close() {
    this.setData({
      isEdit: false
    })
  },
  getPostion() {
    wx.chooseLocation({
      latitude: this.data.editValue.addr_lat,
      longitude: this.data.editValue.addr_lng,
      success: res => {
        let a
        let address
        if (res.address.indexOf('区') != '-1') {
          a = res.address.split('区')
          address = {
            addr_area: a[0] + '区',
            addr_location: res.name,
            addr_lng: res.longitude,
            addr_lat: res.latitude
          }
        } else {
          a = res.address.split('市')
          console.log(a);
          address = {
            addr_area: a[0] + '市' + a[1] + '市',
            addr_location: res.name,
            addr_lng: res.longitude,
            addr_lat: res.latitude
          }
        }
        this.setData({ position: res.address, editValue: { ...this.data.editValue, ...address } })
      }
    })
  },
  changeInput(e) {
    let name = e.currentTarget.dataset.name
    this.data.editValue[name] = e.detail.value
    this.setData({
      editValue: this.data.editValue
    })
    console.log(this.data.editValue);
  },
  editSubmit(e) {
    let data = { ...this.data.editValue, ...e.detail.value }
    console.log(data);
    if (!data.addr_name) return wx.showToast({ title: '请输入场所名称', icon: 'none' })
    if (!data.addr_area) return wx.showToast({ title: '请选择场所', icon: 'none' })
    if (!data.addr_location) return wx.showToast({ title: '请选择场所', icon: 'none' })
    if (!data.addr_price) return wx.showToast({ title: '请输入场所价格', icon: 'none' })
    if (!data.addr_person_name) return wx.showToast({ title: '请输入场所管理员姓名', icon: 'none' })
    if (!data.addr_person_mobile) return wx.showToast({ title: '请输入场所管理员手机号', icon: 'none' })
    if (!data.img) return wx.showToast({ title: '请上传场所图片', icon: 'none' })
    app.post('manageAddress/editAddress', data).then(res => {
      wx.showToast({
        title: res.data, icon: 'none'
      })
      setTimeout(() => {
        this.setData({
          isEdit: false
        })
        this.getList()
      }, 1500)
    }).catch(err => {
      wx.showToast({
        title: err, icon: 'none'
      })
    })
  },
  del(e) {
    const data = e.currentTarget.dataset.item
    if (data.status == '正常') {
      wx.showModal({
        title: '提示',
        content: `你确定要删除${data.addr_name}吗？`,
        success: res => {
          if (res.confirm) {
            app.post('manageAddress/delAddress', { address_id: data.id }).then(result => {
              wx.showToast({
                title: result.data, icon: 'none'
              })
              this.getList()
            }).catch(err => {
              wx.showToast({
                title: err, icon: 'none'
              })
            })
          }
        }
      })
    } else if (data.status == '删除') {
      wx.showModal({
        title: '提示',
        content: `你确定要还原${data.addr_name}吗？`,
        success: res => {
          if (res.confirm) {
            app.post('manageAddress/reductionAddress', { address_id: data.id }).then(result => {
              wx.showToast({
                title: result.data, icon: 'none'
              })
              this.getList()
            }).catch(err => {
              wx.showToast({
                title: err, icon: 'none'
              })
            })
          }
        }
      })
    }
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
            const img = JSON.parse(res.data).data
            that.setData({ 'editValue.img': img })
          }
        })
      }
    })
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