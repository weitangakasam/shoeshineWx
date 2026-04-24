// paginate/hehuoren/hehuoren.js
let app = getApp();
Page({
	data: {
		parameter: {
			return: '1',
			title: '齐飞帮洗',
			color: '#fff',
			class: 'app_bg_title'
		},
		background: [
			{
				money: 0,
				num: 0,
				dayMoney: 0,
				name1: '当日分成金额(元)',
				name2: '当日订单数',
				name3: '当日销售额'
			},
			{
				money: 0,
				num: 0,
				dayMoney: 0,
				name1: '当月分成金额(元)',
				name2: '当月订单数',
				name3: '当月销售额'
			},
			{
				money: 0,
				num: 0,
				dayMoney: 0,
				name1: '当年分成金额(元)',
				name2: '当年订单数',
				name3: '当年销售额'
			}
		],
		current: 0,
		info: {},
		shuaxin: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({
			agent_info: wx.getStorageSync('agent_info')
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},
	linkTo(e) {
		app.linkTo(e);
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		wx.setNavigationBarTitle({
			title: wx.getStorageSync('agent_info').type
		});
		this.getInfo();
	},
	getInfo() {
		app.post('manage/homeInfo').then((res) => {
			if (res.data.out_device_count === 0) {
				res.data.qhl = 0;
			} else {
				res.data.qhl =
					parseFloat(
						parseFloat(
							(res.data.out_device_count /
								res.data.online_device_count) *
								1000
						).toFixed(2)
					) / 10;
			}

			console.log(res.data.qhl);
			this.data.background[0].money = res.data.day_awards;
			this.data.background[0].num = res.data.day_order_count;
			this.data.background[0].dayMoney = res.data.day_order_money;
			this.data.background[1].money = res.data.month_awards;
			this.data.background[1].num = res.data.month_order_count;
			this.data.background[1].dayMoney = res.data.month_order_money;
			this.data.background[2].money = res.data.year_awards;
			this.data.background[2].num = res.data.year_order_count;
			this.data.background[2].dayMoney = res.data.year_order_money;
			this.setData({ info: res.data, background: this.data.background });
		});
	},
	changeSwiper(e) {
		console.log(e);
		this.setData({ current: e.detail.current });
	},
	goPages(e) {
		console.log(e);
		let url = e.currentTarget.dataset.url;
		if (url == '退出') {
			wx.removeStorageSync('agent-id');
			wx.removeStorageSync('agent-token');
			wx.removeStorageSync('agent_info');
			wx.switchTab({
				url: '/pages/user/user'
			});
			app.globalData.set_back2 = true;
		} else if (
			url == '/paginate/hehuoren/puhuo' ||
			url == '/paginate/hehuoren/xiajia'
		) {
			wx.scanCode({
				success: (res) => {
					console.log(res);
					let arr = [];
					if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('%26') != '-1'
					) {
						arr = res.path
							.split('%3F')[1]
							.split('%26')
							.map((item) => {
								return item.split('%3D')[1];
							});
					} else if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('&') != '-1'
					) {
						arr = res.result
							.split('?')[1]
							.split('&')
							.map((item) => {
								return item.split('=')[1];
							});
					}
					console.log(arr);
					if (arr[1] != '1') {
						wx.showModal({
							title: '提示',
							content: '二维码错误',
							showCancel: false
						});
						return;
					}
					wx.navigateTo({
						url: url + '?dev_id=' + arr[0]
					});
				}
			});
		} else if (url == '/paginate/hehuoren/shebei_admin') {
			if (e.currentTarget.dataset.ids == undefined) {
				wx.navigateTo({
					url: url
				});
				return;
			}
			if (e.currentTarget.dataset.ids.join(',') == '') {
				return;
			}
			wx.navigateTo({
				url: url + '?ids=' + e.currentTarget.dataset.ids.join(',')
			});
		} else {
			wx.navigateTo({
				url: url
			});
		}
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
	onPullDownRefresh() {
		this.setData({
			shuaxin: true
		});
		this.getInfo();
		wx.setBackgroundTextStyle({
			textStyle: 'light' // 下拉背景字体、loading 图的样式为dark
		});
		wx.setBackgroundColor({
			backgroundColor: '#ffffff' // 窗口的背景色为白色
		});
		wx.stopPullDownRefresh();
		this.setData({
			shuaxin: false
		});
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});
