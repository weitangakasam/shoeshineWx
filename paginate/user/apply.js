// paginate/submitInfo/submitInfo.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '申请代理',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    position: '',
    city_id: {
      city_id: null,
    },
    multiArray: [],
    objectMultiArray: [
    ],
    multiIndex: [0, 0, 0],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    app.post('manage/getArea', { pid: 0 }).then(res => {
      let arr = [[], [], []]

      app.post('manage/getArea', { pid: res.data[0].id }).then(res2 => {
        app.post('manage/getArea', { pid: res2.data[0].id }).then(res3 => {
          let arr = []
          arr[0] = res.data.map(item => { return item.name })
          arr[1] = res2.data.map(item => { return item.name })
          arr[2] = res3.data.map(item => { return item.name })
          let arr1 = []
          arr1[0] = res.data
          arr1[1] = res2.data
          arr1[2] = res3.data
          console.log(arr1);
          this.setData({
            multiArray: arr, objectMultiArray: arr1
          })
        })
      })

    })
  },
  getPostion() {
    wx.chooseLocation({
      success: res => {
        console.log(res);
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
        this.setData({ position: res.address, address })
      }
    })
  },
  submitForm(e) {
    console.log(e);
    let data = { ...this.data.city_id, ...e.detail.value }
    console.log({ ...this.data.city_id, ...e.detail.value });
    if (!data.username) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    // if (!data.password) return wx.showToast({ title: '请输入密码', icon: 'none' })
    // if (!data.password2) return wx.showToast({ title: '请输入确认密码', icon: 'none' })
    if (!data.mobile) return wx.showToast({ title: '请输入手机号', icon: 'none' })
    if (!data.city_id) return wx.showToast({ title: '请输入经营地区', icon: 'none' })
    if (!(/^1[3456789]\d{9}$/.test(data.mobile))) return app.showToast('请输入与正确的手机号')
    // if (data.password != data.password2) return wx.showToast({ title: '两次密码不一致', icon: 'none' })
    data.password = '111111'
    app.post('manage/apply', data).then(res => {
      wx.showModal({
        title: '提示',
        content: '尊敬的意向合伙人，您的合作申请已提交，请等待客服人员与您电话联系，感谢您的支持！',
        showCancel: false,
        success: (a) => {
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    }).catch(err => {
      wx.showToast({
        title: err, icon: 'none'
      })
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
     'city_id.city_id': this.data.objectMultiArray[2][e.detail.value[2]].id,
      multiIndex: e.detail.value
    })

    console.log(this.data.objectMultiArray[2][e.detail.value[2]]);
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
      objectMultiArray:this.data.objectMultiArray
    };
    console.log(this.data.objectMultiArray);
    let pid = this.data.objectMultiArray[e.detail.column][e.detail.value].id
    console.log(pid);
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        app.post('manage/getArea', { pid: pid }).then(res2 => {
          console.log(res2);
           let arr = res2.data.map(item => { return item.name })
           data.multiArray[1] = arr
          data.objectMultiArray[1] = res2.data
          app.post('manage/getArea', { pid: res2.data[0].id }).then(res3 => {
            data.multiArray[2] = res3.data.map(item => { return item.name })
            data.objectMultiArray[2] = res3.data
            data.multiIndex[1] = 0;
            data.multiIndex[2] = 0;
            this.setData({
              multiArray:this.data.multiArray,
              objectMultiArray: this.data.objectMultiArray,
              multiIndex: this.data.multiIndex
            });
          })
        })

        break;
      case 1:
        app.post('manage/getArea', { pid }).then(res3 => {
          data.multiArray[2] = res3.data.map(item => { return item.name })
          data.objectMultiArray[2] = res3.data
          data.multiIndex[2] = 0;
          this.setData({
            multiArray:this.data.multiArray,
            objectMultiArray: this.data.objectMultiArray,
            multiIndex: this.data.multiIndex
          });
        })
       
        break;
    }
    // this.setData(
    //   objectMultiArray
    // );
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