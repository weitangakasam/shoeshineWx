/** @format */

// paginate/shezhi/login.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '我的押金',
			color: '#fff',
			class: 'app_wodeyajin_title'
		},
		userInfo: {},
		identity: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({
			identity: options.identity,
			door_id: options.door_id,
			ya_jin: options.ya_jin
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.personInfo();
	},
	personInfo() {
		var that = this;
		app.post('user/personInfo').then((res) => {
			that.setData({
				userInfo: res.data
			});
		});
	},
	/**
	 *
	 * @deprecated
	 */
	async submitSub(e) {
		// let value = e.detail.value
		// if (!value.money) return wx.showToast({ title: '请输入充值金额', icon: 'none' })
		// value.type = 0

		try {
			let data = this.data.list[this.data.active];
			const res = await app.post('user/personInfo');
			const res1 = await app.post('user/getYaJinCode', {
				res,
				money: data.money,
				recharge_id: data.id,
				door_id: this.data.door_id
			});
			const res2 = await app.post('wXAPIV3PubKey/createRechargeOrder', {
				order_id: res1.data
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
	submit(e) {
		let data = e.detail.value;
		app.post('user/personInfo')
			.then((res) => {
				app.post('user/getYaJinCode', {
					door_id: this.data.door_id
				}).then((res1) => {
					app.post('wXAPIV3PubKey/createRechargeOrder', {
						order_id: res1.data
					}).then((res2) => {
						app.payV3(res2.data, (e) => {
							if (e == '支付成功') {
								wx.navigateBack({
									delta: 1,
									success: () => {
										app.showToast('支付成功');
									}
								});
							}
						});
					});
				});
			})
			.catch((err) => {
				app.showToast(err);
			});
	},
	/**
	 * 提现
	 */
	submitTixian() {
		//
		//  let data = e.detail.value
		//

		wx.navigateTo({
			url: '/paginate/tixian/tixian?type=押金'
		});
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
