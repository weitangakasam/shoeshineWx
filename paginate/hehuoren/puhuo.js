// paginate/hehuoren/puhuo.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isEdit: false,
		dev_id: '',
		list: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({ dev_id: options.dev_id, count: options.count });
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.getList();
	},
	getList() {
		app.post('manageGoods/vmGoodsList', {
			only_code: this.data.dev_id,
			status: 0
		}).then((res) => {
			this.setData({ list: res.data });
		});
	},
	edit(e) {
		wx.navigateTo({
			url:
				'/paginate/hehuoren/puhuo_edit?count=' +
				this.data.count +
				'&only_code=' +
				this.data.dev_id
		});
	},
	edit_close() {
		this.setData({ isEdit: false });
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});
