const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '余额充值',
			color: '#fff',
			class: 'app_bg_title'
		},
		money: 0,
		info: null,
		list: [],
		active: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// this.setData({money: options.money, info: JSON.parse(options.info)})
		this.getList();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	async getList() {
		const res = await app.post('user/rechargeAwardsList');
		this.setData({ list: res.data });
	},
	changeActive(e) {
		this.setData({
			active: e.currentTarget.dataset.index
		});
	},

	async submitSub(e) {
		console.log(e);
		// let value = e.detail.value
		// if (!value.money) return wx.showToast({ title: '请输入充值金额', icon: 'none' })
		// value.type = 0
		try {
			let data = this.data.list[this.data.active];
			const res = await app.post('user/getRechargeCode', {
				money: data.money,
				recharge_id: data.id
			});
			const res2 = await app.post('wXAPIV3PubKey/createRechargeOrder', {
				order_id: res.data
			});
			app.payV3(res2.data, (e) => {
				if (e == '支付成功') {
					app.showToast('支付成功');
					setTimeout(() => {
						wx.navigateBack({
							delta: 1
						});
					}, 1500);
				}
			});
		} catch (error) {
			app.showToast(error);
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
});
