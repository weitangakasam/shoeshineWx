/** @format */

const app = getApp();
import util from '../../utils/util2';

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '个人中心',
			color: '#fff',
			class: 'app_bg_title',
			navH: app.globalData.navHeight
		},
		auth: false,
		userInfo: {},
		MyMenus: [],
		iShidden: true,
		hidden: false,
		switchActive: true,
		loginType: app.globalData.loginType,
		orderStatusNum: {}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (wx.getStorageSync('userInfo').is_coupon == 'y') {
			this.setData({
				hidden: true
			});
		}
		this.setData({ MyMenus: app.globalData.MyMenus });
	},
	onShow: function () {
		// 判断有没有授权登录

		if (wx.getStorageSync('lt-token')) {
			this.setData({
				userInfo: wx.getStorageSync('userInfo')
			});
			this.returnInfo();
			this.getUserInfo();
		} else {
			this.setData({ userInfo: {} });
		}
	},
	close: function () {
		this.setData({ switchActive: false });
	},
	/**
	 * 授权回调
	 */
	onLoadFun: function (e) {
		// this.getUserInfo();
		if (wx.getStorageSync('userInfo').is_coupon == 'y') {
			this.setData({
				hidden: true
			});
		}
		this.getUserInfo();
	},
	Setting: function () {
		wx.openSetting({
			success: function (res) {
				console.log(res.authSetting);
			}
		});
	},

	/**
	 * 获取个人用户信息
	 */
	getUserInfo: function () {
		var that = this;
		app
			.post('user/personInfo')
			.then((res) => {
				if (
					JSON.stringify(res.data.full_money) != '{}' &&
					JSON.stringify(res.data.minus_money) != '{}' &&
					res.data.is_use_coupon == 'n'
				) {
					res.data.yhq = 1;
				} else {
					res.data.yhq = 0;
				}
				let info = wx.getStorageSync('userInfo');
				that.setData({ userInfo: { ...info, ...res.data } });
				console.log(this.data.userInfo);
			})
			.catch((err) => {
				if (wx.getStorageSync('lt-token')) {
					that.setData({ userInfo: {} });
				}
			});
	},
	getPhoneNumber(e) {
		console.log(e);
		console.log(e.detail.hasOwnProperty('encryptedData'));
		if (e.detail.hasOwnProperty('encryptedData')) {
			this.setData({
				iShidden: false
			});
			app.globalData.mobileCode = e.detail.code;
		}
	},
	getLocation(url) {
		let that = this;
		wx.getLocation({
			type: 'wgs84',
			success(res) {
				console.log(res);
				wx.setStorageSync('location', res);
				wx.navigateTo({
					url
				});
			},
			fail: (err) => {
				console.error(err);
				wx.showModal({
					title: '提示',
					content: '附近信息，需要授权位置消息',
					confirmText: '去授权',
					cancelText: '拒绝',
					success: (a) => {
						if (a.confirm) {
							wx.openSetting({
								success(res) {
									console.log(res.authSetting);
									// res.authSetting = {
									//   "scope.userInfo": true,
									//   "scope.userLocation": true
									// }
								}
							});
						}
					}
				});
			}
		});
	},
	/**
	 * 页面跳转
	 */
	goPages: function (e) {
		let url = e.currentTarget.dataset.url;
		if (
			!wx.getStorageSync('lt-token') &&
			url != '/paginate/rich_text/rich_text?type=关于我们'
		) {
			this.setData({ iShidden: false });
			//   app.showToast('请先授权登录')
			return;
		}
		console.log(e);
		if (url == '/paginate/user/apply') {
			app.post('manage/applyRecord').then((res) => {
				if (JSON.stringify(res.data) == '{}') {
					wx.navigateTo({
						url
					});
					return;
				}
				if (res.data == '拒绝') {
					wx.showModal({
						title: '提示',
						content: '您的申请已被管理员拒绝,请您重新申请',
						showCancel: true,
						success: (a) => {
							wx.navigateTo({
								url: '/paginate/user/apply'
							});
						}
					});
					return;
				}
				if (res.data == '启用') {
					if (wx.getStorageSync('agent-token')) {
						wx.navigateTo({
							url: '/paginate/hehuoren/hehuoren'
						});
					} else {
						wx.navigateTo({
							url: '/paginate/shezhi/login?identity=代理'
						});
					}
					return;
				}
				wx.showModal({
					title: '提示',
					content: res.data,
					showCancel: false
				});
				// app.showToast(res.data)
			});
			return;
		}
		if (url == '/paginate/hehuoren/hehuoren') {
			if (wx.getStorageSync('agent-token')) {
				wx.navigateTo({
					url: url
				});
			} else {
				wx.navigateTo({
					url: '/paginate/shezhi/login?identity=代理'
				});
			}
			return;
		}
		if (url == '/paginate/map/map') {
			this.getLocation(url);
			return;
		}
if (url == 'close') {
			wx.showModal({
				title: '提示',
				content: '您是否启用故障归还',
				success: (a) => {
					if (a.confirm) {
						app
							.post('userSiteOrder/faultOpenDoor')
							.then((res) => {
								wx.showModal({
									title: '提示',
									content: res.data + '',
									showCancel: false
								});
							})
							.catch((err) => {
								wx.showModal({
									title: '提示',
									content: err + '',
									showCancel: false
								});
							});
					}
				}
			});
			return;
		}
		wx.navigateTo({
			url: url
		});
	},

	async returnInfo() {
		try {
			const res = await app.post('userSiteOrder/getNowOrder');
			if (JSON.stringify(res.data) == '{}' || res.data.status == '已取消')
				return;
			let begin = new Date(res.data.begin_time).getTime();
			const info = util.useTime(begin);
			res.data.time = info.time;
			let timeMoney = {
				begin,
				price: null,
				money: res.data.money,
				time: info.time
			};
			this.setData({ timeMoney });
			this.timer = setInterval(() => {
				this.useTM();
			}, 1000);
		} catch (error) {}
	},
	useTM() {
		let info = util.useTime(this.data.timeMoney.begin);
		let timeMoney = {
			price: 0,
			time: info.time
		};
		if (info.min < this.data.timeMoney.base_time_x) {
			timeMoney.price = this.data.timeMoney.price_y;
		} else {
			const t = info.min - this.data.timeMoney.base_time_x;
			timeMoney.price =
				this.data.timeMoney.price_y + this.data.timeMoney.price_z * t;
		}
		this.setData({ timeMoney: { ...this.data.timeMoney, ...timeMoney } });
	},

	kf_call: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.kf_tel
		});
	},
	handleContact(e) {
		console.log(e.detail.path);
		console.log(e.detail.query);
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		this.setData({ switchActive: false });
		clearInterval(this.timer);
	},

	onPullDownRefresh() {
		wx.setBackgroundTextStyle({
			textStyle: 'dark' // 下拉背景字体、loading 图的样式为dark
		});
		wx.setBackgroundColor({
			backgroundColor: '#ffffff' // 窗口的背景色为白色
		});
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		clearInterval(this.timer);
	},
	// onShow:function(){
	//   let that = this;
	//   let isLog = wx.getStorageSync('isLog');
	//   if (isLog){
	//     this.getUserInfo()
	//   }else{
	//     this.setData({
	//       isLog: false
	//     })
	//   }
	// },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {}
});
