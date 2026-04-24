// paginate/hehuoren/shebei_admin.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    list: [],
    editValue: {},
    addr_id: null,
    type: '1',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    if (options.hasOwnProperty('addr_id')) {
      this.setData({
        addr_id: options.addr_id
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
    this.getList()
  },
  getList(params) {
    if (this.data.type == '1') {
      let data = {}
      if (this.data.addr_id) {
        data.addr_id = this.data.addr_id
      }
      if (params) {
        if (!Number(params)) {
          data.name = params
        } else {
          data.dev_id = params
        }
      }
      console.log(data);
      app.post('bluetoothManage/boxList', data).then(res => {
        this.setData({
          list: res.data
        })
      })
    }
    else if (this.data.type == '2') {
      let data = {}
      if (this.data.addr_id) {
        data.addr_id = this.data.addr_id
      }
      if (params) {
        if (!Number(params)) {
          data.name = params
        } else {
          data.dev_id = params
        }
      }
      console.log(data);
      app.post('rentalBox/rentalBoxList', data).then(res => {
        this.setData({
          list: res.data
        })
      })
    }

  },
  changeTab(e) {
    this.setData({
      type: e.currentTarget.dataset.type
    })
    this.getList()
  },
  search(e) {
    console.log(e);
    this.getList(e.detail.value.search)
  },
  goPages(e) {
    let url = e.currentTarget.dataset.url
    let item = e.currentTarget.dataset.item
    if (item) {
      wx.navigateTo({
        url: '/paginate/hehuoren/shebei_admin?id=' + item.id,
      })
    } else {
      if (url == '/paginate/hehuoren/shebeiAdd') {
        wx.scanCode({
          success: (res) => {
            console.log(res);
            let arr = []
            if (res.result.indexOf('type') != '-1' && res.result.indexOf("%26") != '-1') {
              arr = res.result.split("%3F")[1].split("%26").map(item => {
                return item.split("%3D")[1]
              })
            } else if (res.result.indexOf('type') != '-1' && res.result.indexOf("&") != '-1') {
              arr = res.result.split("?")[1].split("&").map(item => {
                return item.split("=")[1]
              })
            }
            if (arr[1] != '1' && arr[1] != '2') {
              wx.showModal({
                title: '提示',
                content: '二维码错误',
                showCancel: false,
              })
              return
            }
            // console.log(decodeURIComponent(res.path));
            wx.navigateTo({
              url: url + '?dev_id=' + arr[0] + '&addr_id=' + this.data.addr_id + '&type=' + arr[1],
            })
          }
        })
      } else {
        wx.navigateTo({
          url: url,
        })
      }
    }

  },
  edit(e) {
    this.setData({
      isEdit: true,
      editValue: e.currentTarget.dataset.item
    })
  },
  edit_close() {
    this.setData({
      isEdit: false
    })
  },
  addNum() {
    this.setData({
      'editValue.amount': this.data.editValue.amount + 1
    })
  },
  delNum() {
    if (this.data.editValue.amount < 2) {
      return
    }
    this.setData({
      'editValue.amount': this.data.editValue.amount - 1
    })
  },
  changeInput(e) {
    console.log(e);
    let value = e.detail.value
    if (parseInt(value) < 1 || !value) {
      this.setData({
        'editValue.amount': this.data.editValue.amount
      })
      return
    }
    this.setData({
      'editValue.amount': parseInt(value)
    })
  },
  sure() {
    app.post('bluetoothManage/editVMDevice', { ...this.data.editValue, ...{ vmdevice_id: this.data.editValue.id, address_id: this.data.editValue.addr_id } }).then(res => {
      wx.showToast({
        title: res.data, icon: 'none'
      })
      this.getList()
    }).catch(err => {
      wx.showToast({
        title: err, icon: 'none'
      })
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