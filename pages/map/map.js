// paginate/map/map.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '设备地图',
			color: '#fff',
			class: 'app_bg_title'
		},
		location: wx.getStorageSync('location'),
		markers: [
			// {id: 2, latitude: "31.35246", longitude: "118.43313", width: 50, height: 50, iconPath: '/images/dw.png',
			// },
		],
		iShidden: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.getLocation();
	},

	getLocation() {
		const that = this;
		wx.getLocation({
			type: 'wgs84',
			success(res) {
				console.log('定位成功:', res);
				wx.setStorageSync('location', res);
				that.getInfo();
			},
			fail(err) {
				console.error('定位失败:', err);
				wx.showModal({
					title: '提示',
					content: '附近信息需要授权位置消息，是否设置为默认位置（北京天安门）？',
					confirmText: '设置默认',
					cancelText: '拒绝',
					success: modalRes => {
						if (modalRes.confirm) {
							// 设置默认位置为北京天安门
							const defaultLocation = {
								latitude: 39.908823,
								longitude: 116.39747
							};
							wx.setStorageSync('location', defaultLocation);
							that.getInfo(); // 使用默认位置获取信息
						} else {
							wx.showToast({
								title: '定位失败，无法获取附近信息',
								icon: 'none'
							});
						}
					}
				});
			}
		});
	},
	async getInfo() {
		let params = {};
		if (wx.getStorageSync('location')) {
			let location = wx.getStorageSync('location');
			params.user_lng = location.longitude;
			params.user_lat = location.latitude;
		}
		const res = await app.post('userSiteOrder/nearSite', params);
		res.data.map(item => {
			item.latitude = parseFloat(item.addr_lat);
			item.longitude = parseFloat(item.addr_lng);
			item.width = 35;
			item.height = 35;
			item.iconPath = '/images/dw.png';
			item.title = item.addr_name;
		});
		this.setData({ markers: res.data });
	},
	// 标记点导航
	markertap(e) {
		return;
	},
	callouttap(e) {
		console.log(e);
		let data;
		this.data.markers.map(item => {
			if (e.detail.markerId == item.id) {
				data = item;
			}
			return item;
		});
		wx.showModal({
			title: '提示',
			content: '您需要导航前往该地址吗',
			success(res) {
				if (res.confirm) {
					wx.openLocation({
						latitude: parseFloat(data.latitude),
						longitude: parseFloat(data.location),
						scale: 18,
						name: data.addr_name
					});
				}
			}
		});
	},
	signIn() {
		var mapCtx = wx.createMapContext('map');
		mapCtx.moveToLocation();
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
