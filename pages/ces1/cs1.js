/** @format */

// index.js
// 获取应用实例
import util from "../../utils/util2";
const app = getApp();

Page({
	data: {
		parameter: {
			return: "0",
			title: "首页",
			color: "#fff",
			class: "fff",
			navH: app.globalData.navHeight
		},
		iShidden: true,
		hidden: false,
		info: {},
		userInfo: {},
		timeMoney: null,
		isOrder: false,
		url: null,
		disbale: false,
		login: false,
		dan: null
	},
	async onLoad(e) {
		try {
			if (e.hasOwnProperty("q")) {
				const q = decodeURIComponent(e.q);
				app.globalData.dev_id = q.split("?")[1].split("=")[1];
				if (!wx.getStorageSync("lt-id")) {
					this.setData({
						iShidden: false
					});
				} else {
					const res = await app.post("userSiteOrder/getNowOrder");
					if (res.data.status == "使用中") {
						let e = {
							currentTarget: {
								dataset: {
									url: "stop"
								}
							}
						};
						this.goPages(e);
						return;
					} else {
						wx.navigateTo({
							url: "/paginate/charge_info/charge_info"
						});
					}
				}
			}
		} catch (error) {
			if (error == "需要登录！") {
				this.setData({
					iShidden: false
				});
			} else {
				app.showToast(error);
			}
		}
		this.getInfo();
		if (wx.getStorageSync("userInfo").is_coupon == "y") {
			this.setData({
				hidden: true,
				userInfo: wx.getStorageSync("userInfo")
			});
		}
		// this.orderInfo()
	},
	onLoadFun(e) {
		if (wx.getStorageSync("lt-id")) {
			this.setData({
				login: false
			});
		} else {
			this.setData({
				login: true
			});
		}
		if (wx.getStorageSync("userInfo").is_coupon == "y") {
			this.setData({
				hidden: true,
				userInfo: wx.getStorageSync("userInfo")
			});
			return;
		}

		if (this.data.url) {
			let params = {
				currentTarget: {
					dataset: {
						url: this.data.url
					}
				}
			};
			this.goPages(params);
			this.setData({
				url: null
			});
			return;
		}

		if (app.globalData.dev_id) {
			app.post("userSiteOrder/getNowOrder").then(res => {
				if (res.data.status == "使用中") {
					let e = {
						currentTarget: {
							dataset: {
								url: "stop"
							}
						}
					};
					this.goPages(e);
					return;
				} else {
					wx.navigateTo({
						url: "/paginate/charge_info/charge_info"
					});
				}
			});
			return;
		}
	},
	onShow() {
		if (wx.getStorageSync("lt-id")) {
			this.setData({
				login: false
			});
		} else {
			this.setData({
				login: true
			});
		}
		// this.setData({
		//   hidden: true
		// })
		this.orderStatus();
	},

	async getInfo() {
		const res = await app.post("banner/imgList");
		const res2 = await app.post("user/platformNoticeList");
		this.setData({
			swiper: res.data.banner,
			gonggao: res2.data,
			dan: res.data.dan
		});
	},
	getPhoneNumber(e) {
		console.log(e);
		console.log(e.detail.hasOwnProperty("encryptedData"));
		if (e.detail.hasOwnProperty("encryptedData")) {
			this.setData({
				iShidden: false
			});
			app.globalData.mobileCode = e.detail.code;
		}
	},
	async orderStatus() {
		try {
			const res = await app.post("userSiteOrder/getNowOrder");
			if (
				JSON.stringify(res.data) == "{}" ||
				res.data.status == "已取消" ||
				res.data.status == "待付款"
			) {
				this.setData({
					isOrder: false
				});
				return;
			}
			this.setData({
				isOrder: true
			});
		} catch (error) {}
	},
	bindload(e) {
		app.bindload(e, this);
	},
	async goPages(e) {
		console.log(e);
		let url = e.currentTarget.dataset.url;
		if (url === "/paginate/huiyuan/huiyuan") {
			app.alert({
				title: "提示",
				content: "尚未开放"
			});
			return;
		}
		if (!wx.getStorageSync("lt-id") && url.indexOf("/paginate/rich_text/rich_text") == -1) {
			this.setData({
				iShidden: false,
				url
			});
			return;
		}
		if (url == "/paginate/charge_info/charge_info") {
			try {
				// app.globalData.dev_id = '869298055041081'
				// wx.navigateTo({
				//   url,
				// })
				// return
				const res = await app.post("userSiteOrder/getNowOrder");
				if (res.data.status == "使用中") {
					this.setData({
						isOrder: true
					});
					app.showToast("您有正在进行中的订单");
					return;
				}
				this.setData({
					isOrder: false
				});
				wx.scanCode({
					success: async a => {
						console.log(a);
						const q = decodeURIComponent(a.result);
						console.log(q);
						const dev_id = q.split("?")[1].split("=")[1];
						app.globalData.dev_id = dev_id;
						wx.navigateTo({
							url
						});
						return;
					}
				});
			} catch (error) {
				console.error(error);
				app.showToast(error);
			}

			return;
		}
		if (url == "stop") {
			try {
				const res = await app.post("userSiteOrder/getNowOrder");
				if (JSON.stringify(res.data) == "{}" || res.data.status != "使用中") {
					this.setData({
						isOrder: false
					});
					app.showToast("请先扫码使用");
					return;
				}
				this.setData({
					isOrder: true
				});
				wx.showModal({
					title: "提示",
					content: "您需要开门归还设备吗？",
					success: async a => {
						if (a.confirm && !this.data.disbale) {
							this.data.disbale = true;
							setTimeout(() => {
								this.setData({
									disbale: false
								});
							}, 1000);
							wx.showLoading({
								title: "开门中"
							});
							const stop = await app.post("userSiteOrder/scanningQode");
							wx.hideLoading();
							wx.showModal({
								title: "提示",
								content: "门打开成功后请尽快归还，如果门未开时请选择重新开门",
								cancelText: "归还",
								confirmText: "重新开门",
								success: b => {
									if (b.confirm) {
										app.post("userSiteOrder/faultOpenDoor")
											.then(res => {
												wx.showModal({
													title: "提示",
													content: res.data + "",
													showCancel: false
												});
											})
											.catch(err => {
												wx.showModal({
													title: "提示",
													content: err + "",
													showCancel: false
												});
											});
									}
								}
							});
						}
					}
				});
			} catch (error) {
				console.error(error);
				app.showToast(error);
			}
			return;
		}
		if (url == "/paginate/user/apply") {
			app.post("manage/applyRecord").then(res => {
				if (JSON.stringify(res.data) == "{}") {
					wx.navigateTo({
						url: url
					});
					return;
				}
				if (res.data == "拒绝") {
					wx.showModal({
						title: "提示",
						content: "您的申请已被管理员拒绝,请您重新申请",
						showCancel: true,
						success: a => {
							if (a.confirm) {
								wx.navigateTo({
									url: "/paginate/user/apply"
								});
							}
						}
					});
					return;
				}
				if (res.data == "启用") {
					if (wx.getStorageSync("agent-token")) {
						wx.navigateTo({
							url: "/paginate/hehuoren/hehuoren"
						});
					} else {
						wx.navigateTo({
							url: "/paginate/shezhi/login?identity=代理"
						});
					}
					return;
				}
				// wx.navigateTo({
				//   url: url,
				// })
				wx.showModal({
					title: "提示",
					content: res.data,
					showCancel: false
				});
				// app.showToast(res.data)
			});
			return;
		}
		if (url == "/paginate/rich_text/rich_text") {
			wx.navigateTo({
				url: `${url}?type=公告&id=${e.currentTarget.dataset.item.id}`
			});
		}
		// if (url == '/paginate/invest/invest') {
		//   const info = JSON.stringify(this.data.info)
		//   wx.navigateTo({
		//     url: `${url}?money=${this.data.userInfo.money}&info=${info}`,
		//   })
		//   return
		// }
		wx.navigateTo({
			url: url
		});
	},
	async orderInfo() {
		try {
			const res = await app.post("userSiteOrder/getNowOrder");
			let begin = new Date(res.data.begin_time).getTime();
			const info = util.useTime(begin);
			res.data.time = info.time;
			let timeMoney = {
				begin,
				price: null,
				price_y: res.data.price_y,
				base_time_x: res.data.base_time_x,
				price_z: res.data.price_z,
				time: info.time
			};
			if (info.min < res.data.base_time_x) {
				timeMoney.price = res.data.price_y;
			} else {
				const t = info.min - res.data.base_time_x;
				timeMoney.price = res.data.price_y + res.data.price_z * t;
			}
			this.setData({
				timeMoney
			});
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
			timeMoney.price = this.data.timeMoney.price_y + this.data.timeMoney.price_z * t;
		}
		this.setData({
			timeMoney: {
				...this.data.timeMoney,
				...timeMoney
			}
		});
	},
	catchTouchMove() {
		return false;
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		clearInterval(this.timer);
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		clearInterval(this.timer);
	}
});
