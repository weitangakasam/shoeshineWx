/** @format */
// paginate/tixian/tixian.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: "1",
			title: "提现",
			color: "#fff",
			class: "app_wodeyajin_title"
		},
		money: 0,
		type: "",
		money2: "", // 实际到账
		withdrawal_proportion: "", // 提现比例
		tongyi: false,
		userInfo: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (options.type === "押金") {
			this.setData({ type: options.type });
			return;
		}

		if (options.type == "会员提现") {
			this.setData({
				money: options.money,
				type: options.type,
				withdrawal_proportion: options.withdrawal_proportion
			});
		} else {
			this.setData({ money: options.money, type: options.type });
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
		if (wx.getStorageSync("tongyi")) {
			this.setData({
				tongyi: true
			});
		}
		const {
			data: { type }
		} = this;
		const url = type === "押金" ? "user/personInfo" : "manage/personInfo";
		const { data } = await app.post(url);
		this.setData({
			userInfo: data
		});
	},
	handleInput(e) {
		this.setData({
			money2: e.detail.value - (e.detail.value * 100 * this.data.withdrawal_proportion) / 100
		});
	},
	// 提现
	async subCash(e) {
		const {
			data: { type }
		} = this;
		if (!e.detail.value.account.trim()) {
			return wx.showToast({ title: "请输入支付宝账号", icon: "none" });
		}
		if (!e.detail.value.account_name.trim()) {
			return wx.showToast({ title: "请输入支付宝姓名", icon: "none" });
		}
		if (type !== "押金" && e.detail.value.money == 0) {
			return wx.showToast({ title: "提现金额不能为0", icon: "none" });
		}
		if (type !== "押金" && !e.detail.value.money) {
			return wx.showToast({ title: "提现金额异常", icon: "none" });
		}

		let params =
			type !== "押金"
				? {
						account: e.detail.value.account.trim(),
						account_name: e.detail.value.account_name.trim(),
						money: e.detail.value.money.trim()
				  }
				: {
						account: e.detail.value.account.trim(),
						account_name: e.detail.value.account_name.trim()
				  };
		const url = type !== "押金" ? "manage/manageUserApply" : "user/yajinWithdraw";
		try {
			const { data } = await app.post(url, params);
			app.showToast(data);
			setTimeout(() => {
				wx.navigateBack({
					delta: 1
				});
			}, 1000);
		} catch (error) {
			app.showToast(error);
		}
	},
	// 同意
	tongyi(e) {
		wx.setStorageSync("tongyi", true);
		this.setData({
			tongyi: true
		});
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
// paginate/tixian/tixian.js
