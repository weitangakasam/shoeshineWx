// paginate/hehuoren/renyuan_admin.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '人员管理',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    page: 1,
    left: 0,
    totalPage: 5,
    isAdd: false,
    list: [],
    searchValue: '',
    top: 0,
    type: '0',
    current: 0,
    form: {
      city_id: null,
      type: null,
    },
    typeArray: ['代理', '商户'],
    multiArray: [],
    objectMultiArray: [],
    multiIndex: [0, 0, 0],
    tishi: '',
    disabled: false,
    isAdd2: false,
    isEdit: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: app.globalData.navHeight })
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
    // 分页
    if (this.data.totalPage < 5) {
      this.setData({
        left: 78 * (5 - this.data.totalPage)
      })
    }
  },
  getList(params) {
    // if(Number(params))
    let data = {}
    if (params) {
      if (!Number(params)) {
        data.username = params
      } else {
        data.mobile = params
      }
    }
    data.type = this.data.type
    console.log(data);
    app.post('manageOperator/operatorList', data).then(res => {
      if (this.data.type == '0') {
        this.setData({
          list: res.data
        })
        return
      }
      if (this.data.type == '1') {
        this.setData({
          list2: res.data
        })
      }
    })
  },
  add() {
    this.setData({
      isAdd: true, isAdd2: true
    })
    // app.post('manageOperator/getOverRate').then(res => {
    //   this.setData({ tishi: Math.floor(res.data * 100) / 100 })
    // })
    app.post('manage/personInfo').then(res => {
      this.setData({ tishi: Math.floor(res.data.rate * 100) / 100 })
    })
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
  add_close() {
    this.setData({
      isAdd: false,
    })
  },
  add_close2() {
    this.setData({
      isAdd2: false, isEdit:false,
      'form.type': null, 'form.city_id': null,
    })
  },
  addSubmit(e) {
    console.log(e);
    let data = { ...e.detail.value, ...this.data.form }
    if (!data.mobile) return wx.showToast({ title: '请输入手机号', icon: 'none' })
    if (!data.username) return wx.showToast({ title: '请输入用户名', icon: 'none' })
    if (!data.password) return wx.showToast({ title: '请输入登录密码', icon: 'none' })
    if (!data.password2) return wx.showToast({ title: '请输入确认密码', icon: 'none' })
    if (!data.type) return wx.showToast({ title: '请选择角色类型', icon: 'none' })
    if (!data.city_id) return wx.showToast({ title: '请选择经营地区', icon: 'none' })
    if (!data.rate) return wx.showToast({ title: '请输入分成比例', icon: 'none' })
    if (!(/^1[3456789]\d{9}$/.test(data.mobile))) return app.showToast('请输入与正确的手机号') 
    if (data.password != data.password2) return wx.showToast({ title: '两次密码输入不一致', icon: 'none' })
    if (parseFloat(data.rate) > this.data.tishi * 100) return wx.showToast({ title: '请输入正确分成比例', icon: 'none' })
    data.rate = parseFloat(data.rate) / 100
    if (!this.data.disabled) {
      this.data.disabled = true
      setTimeout(() => {
        this.data.disabled = false
      }, 1500)
      app.post('manageOperator/addOperator', data).then(res => {
        wx.showToast({
          title: res.data, icon: 'none'
        })
        setTimeout(() => {
          this.setData({
            isAdd: false,
          })
          this.getList()
        }, 1000)

      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    }

  },
  search() {
    this.getList(this.data.searchValue)
  },
  changeInputValue(e) {
    console.log(e.detail.value);
    this.setData({ searchValue: e.detail.value })
  },
  del(e) {
    const data = e.currentTarget.dataset.item
    console.log(data);
    if (JSON.stringify(data.daili_rate) != '{}' && data.daili_rate - wx.getStorageSync('agent_info').daili_rate != 1) {
      app.showToast('您没有操作该用户权限')
      return
    }
    if (data.status == '暂不启用') {
      wx.showModal({
        title: '提示',
        content: `你确定要启用操作员：${data.username}吗？`,
        success: res => {
          if (res.confirm) {
            app.post('manageOperator/reductionOperator', { operator_id: data.id }).then(result => {
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
    else if (data.status == '启用') {
      wx.showModal({
        title: '提示',
        content: `你确定要禁用操作员：${data.username}吗？`,
        success: res => {
          if (res.confirm) {
            app.post('manageOperator/delOperator', { operator_id: data.id }).then(result => {
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
  edit(e) {
    let data = e.currentTarget.dataset
    this.setData({
    isAdd: true, isEdit: true, editInfo: {...data.item, ...{rate: data.item.rate * 100}}
    })
    app.post('manage/personInfo').then(res => {
      this.setData({ tishi: Math.floor(res.data.rate * 100) / 100 })
    })
  },
  changeInput(e) {
    console.log(e);
    let data = e.currentTarget.dataset
    this.data.editInfo[data.type] = e.detail.value
    this.setData({
      editInfo: this.data.editInfo
    })
  },
  async editSubmit(e) {
    let data = { ...e.detail.value, ...this.data.editInfo }
    if (!data.rate) return wx.showToast({ title: '请输入分成比例', icon: 'none' })
    if (parseFloat(data.rate) > this.data.tishi * 100) return wx.showToast({ title: '请输入正确分成比例', icon: 'none' })
    try {
      const res = await app.post('manageOperator/editRate', {operator_id:data.id, rate: data.rate / 100})
      app.showToast(res.data)
      this.add_close()
      this.onShow()
    } catch (error) {
      app.showToast(error)
    }
  },
  changeTab(e) {
    this.setData({
      type: e.currentTarget.dataset.type,
      current: e.currentTarget.dataset.type == '0' ? 0 : 1
    })
  },
  changeSwiper(e) {
    if (e.detail.current == 0) {
      this.setData({
        type: '0'
      })
    } else {
      this.setData({
        type: '1'
      })
    }
    this.setData({
      searchValue: ''
    })
    this.getList()
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      'form.city_id': this.data.objectMultiArray[2][e.detail.value[2]].id,
      multiIndex: e.detail.value
    })

    console.log(this.data.objectMultiArray[2][e.detail.value[2]]);
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
      objectMultiArray: this.data.objectMultiArray
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
              multiArray: this.data.multiArray,
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
            multiArray: this.data.multiArray,
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
  bindPickerChange(e) {
    console.log(e);
    this.setData({
      'form.type': e.detail.value
    })
  },

  // 分页
  changePage(e) {
    console.log(e);
    let page = e.currentTarget.dataset.page
    this.setData({
      page
    })
    if (page == '1' || parseInt(page) < 4 && this.data.totalPage > 4) {
      this.setData({
        left: 0
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) > 1 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 3)
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) == 1 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 4)
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) == 0 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 5)
      })
    }
    // ? 0 : -60 * parseInt(page)
  },
  tiaozhuan(e) {
    console.log(e);
    let page = e.detail.value.page
    if (parseInt(page) > this.data.totalPage) {
      return
    }
    this.setData({
      page: page,
    })
    if (page == '1' || parseInt(page) < 4 && this.data.totalPage > 4) {
      this.setData({
        left: 0
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) > 1 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 3)
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) == 1 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 4)
      })
    } else if (parseInt(page) > 3 && this.data.totalPage - parseInt(page) == 0 && this.data.totalPage > 4) {
      this.setData({
        left: -78 * (parseInt(page) - 5)
      })
    }
  },
  // 分页结束

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