// paginate/hehuoren/cheji_admin.js
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parameter: {
            'return': '1',
            'title': '撤机设备',
            'color': '#fff',
            'class': 'app_bg_title'
        },
        list: [],
        list2: [],
        type: '1',
        current: 0,
        searchValue: '',
        top: '',
        params: {
            pageNo: 1,
            size: 10,
            only_code: '',
            name: '',
        },
        totalPage: 1,
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
    },
    getList(params) {
        if (this.data.type == '1') {
            let data = this.data.params
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
            data.type = '1'
            app.post('manageNetSite/vmDeviceList', data).then(res => {
                this.setData({
                    list: res.data.datas,
                    totalPage: res.data.totalPage
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
                    list2: res.data
                })
            })
        }
    },
    changeTab(e) {
        this.setData({
            type: e.currentTarget.dataset.type,
            current: e.currentTarget.dataset.type == '1' ? 0 : 1
        })
        // this.getList()
    },
    changeSwiper(e) {
        if (e.detail.current == 0) {
            this.setData({
                type: '1'
            })
        } else {
            this.setData({
                type: '2'
            })
        }
        this.setData({
            searchValue: ''
        })
        this.getList()
    },
    changeInput(e) {
        this.setData({
            searchValue: e.detail.value
        })
    },
    search(e) {
        console.log(e);
        this.getList(e.detail.value.search)
    },
    cheji(e) {
        let data = e.currentTarget.dataset.item
        wx.showModal({
            title: '提示',
            content: `您确定将${data.name}撤机`,
            success: res => {
                if (res.confirm) {
                    if (this.data.type == '1') {
                        app.post('manageNetSite/delVMDevice', { vmdevice_id: data.id }).then(res => {
                            wx.showToast({
                                title: res.data, icon: 'none'
                            })
                            this.getList()
                        }).catch(err => {
                            wx.showToast({
                                title: err, icon: 'none'
                            })
                        })
                    } else if (this.data.type == '2') {
                        app.post('rentalBox/delRentalBox', { rentalbox_id: data.id }).then(res => {
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

                }
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
        if (this.data.params.pageNo < this.data.totalPage) {
            this.data.params.pageNo = this.data.params.pageNo + 1
            this.getList()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})