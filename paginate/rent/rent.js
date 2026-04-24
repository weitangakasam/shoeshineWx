// page/rent/rent.js
// import { returnInfor, userConsumption, returnSite, OrderList } from '../../api/dian'
import util, { useTime } from '../../utils/util2';
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '当前订单',
			class: 'app_bg_title'
		},
		returnInfo: {},
		timeInfo: {},
		status: '租借中',
		progress: 0,
		info: {},
		begin: null,
		hidden: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (options.isUse == 'true') {
			wx.setStorageSync('isUse', true);
			this.setData({
				status: '待处理'
			});
			this.returnInfo();
		} else if (options.isUse == undefined) {
			this.setData({
				status: '待处理'
			});
			this.returnInfo();
		} else if (options.isUse == 'false') {
			this.setData({
				status: '已完成'
			});
			this.payInfo();
		}
	},
	callPhone() {
		wx.makePhoneCall({
			phoneNumber: this.data.timeMoney.agent_mobile
		});
	},
	exitMoney() {
		const { order_id } = this.data;
		wx.showModal({
			title: '提示',
			content: '确定要取消订单？',
			async success({ confirm }) {
				if (!confirm) return;
				try {
					const { data } = await app.post('order/cancel', {
						order_id
					});
					app.showToast(data);
					wx.switchTab({
						url: '/pages/order/order'
					});
				} catch (error) {
					app.showError(error);
				}
			}
		});
	},
	async returnInfo() {
		const self = this;
		try {
			const res = await app.post('userSiteOrder/getNowOrder');
			const { status } = res.data;
			console.log(status, status == '待处理');
			if (status == '待处理') {
				let begin = new Date(
					res.data.create_time.replace(/-/g, '/')
				).getTime();
				const info = useTime(begin);
				this.setData({
					status,
					order_id: res.data.id,
					timeMoney: {
						...res.data,
						...{
							time: info.time,
							price: res.data.total_money
						}
					}
				});
				setTimeout(() => {
					self.returnInfo();
				}, 1000);
			}
			if (status == '处理中') {
				let begin = new Date(
					res.data.begin_time.replace(/-/g, '/')
				).getTime();
				const info = useTime(begin);
				this.setData({
					status,
					order_id: res.data.id,
					timeMoney: {
						...res.data,
						...{
							time: info.time,
							price: res.data.total_money
						}
					}
				});
				setTimeout(() => {
					self.returnInfo();
				}, 1000);
			}
		} catch (error) {
			console.log(error);
		}
	},
	async useTM() {
		const res = await app.post('userSiteOrder/getNowOrder');
		// console.log('定时', res);
		if (res.data.status != '使用中' && res.data.status != '待付款') {
			clearInterval(app.globalData.timer);
			let pages = getCurrentPages();
			if (pages.length === 0) return;
			if (pages[pages.length - 1].route === 'paginate/rent/rent') return;
			wx.navigateTo({
				url: '/paginate/rent/rent?isUse=false'
			});
			return;
		}
		let begin = new Date(res.data.begin_time.replace(/-/g, '/')).getTime();
		let info = useTime(begin);
		const { back_status, back_img, total_money } = res.data;
		if (/http/gi.test(back_img) || back_status === '等待审核') {
			const returnInfo = {
				money: res.data.total_money,
				time: info.min
			};
			this.setData({
				status: '等待图片审核',
				returnInfo
			});
			return;
		}

		let timeMoney = {
			begin,
			price: null,
			money: res.data.money,
			time: info.time,
			zhouqi: res.data.time,
			free_time: res.data.free_time
		};
		if (res.data.total_money != 0) {
			timeMoney.price = res.data.total_money;
		} else {
			timeMoney.price =
				(Math.ceil(parseInt(info.min) / timeMoney.zhouqi) *
					(timeMoney.money * 100)) /
				100;
			if (timeMoney.price > 200) {
				timeMoney.price = 200;
			}
		}
		// console.error(timeMoney);
		this.setData({
			timeMoney: {
				...res.data,
				...timeMoney
			}
		});
		// let info = useTime(this.data.timeMoney.begin)
		// let timeMoney = {
		//   price: 0,
		//   time: info.time
		// }
		// timeMoney.price =  parseInt(info.time) / parseInt(this.data.timeMoney.zhouqi) * this.data.timeMoney.money
		// this.setData({ timeMoney: { ...this.data.timeMoney, ...timeMoney } })
	},
	async payInfo() {
		wx.removeStorageSync('isUse');
		clearInterval(app.globalData.timer);
		const res = await app.post('userSiteOrder/orderList', {
			pageNo: 1,
			size: 1,
			type: 0
		});
		console.error(res);
		if (res.data.datas[0].finish_time == '') {
			const returnInfo = {
				money: res.data.datas[0].money,
				time: '0分钟'
			};
			this.setData({
				returnInfo,
				info: res.data.datas[0]
			});
			return;
		}
		let begin = new Date(
			res.data.datas[0].begin_time.replace(/-/g, '/')
		).getTime();
		const info = useTime(begin);
		const returnInfo = {
			money: res.data.datas[0].total_money,
			time: info.time
		};
		this.setData({
			returnInfo,
			info: res.data.datas[0]
		});
		setTimeout(() => {
			this.payInfo2();
		}, 3000);
	},
	async payInfo2() {
		wx.removeStorageSync('isUse');
		clearInterval(app.globalData.timer);
		const res = await app.post('userSiteOrder/orderList', {
			pageNo: 1,
			size: 1,
			type: 0
		});
		// console.error(res);
		if (res.data.datas[0].finish_time == '') {
			const returnInfo = {
				money: res.data.datas[0].money,
				time: '0分钟'
			};
			this.setData({
				returnInfo,
				info: res.data.datas[0]
			});
			return;
		}
		let begin = new Date(
			res.data.datas[0].begin_time.replace(/-/g, '/')
		).getTime();
		const info = useTime(begin);
		const returnInfo = {
			money: res.data.datas[0].total_money,
			time: info.time
		};
		this.setData({
			returnInfo,
			info: res.data.datas[0]
		});
		if (res.data.datas[0].status == '已完成') {
			return;
		}
		setTimeout(() => {
			this.payInfo2();
		}, 1000);
	},
	zujie() {
		if (wx.getStorageSync('lt-token')) {
			wx.scanCode({
				success: (res) => {
					console.log(res);
					if (
						res.result.indexOf('imei') != '-1' &&
						res.result.indexOf('=') != '-1'
					) {
						app.globalData.imei = res.result.split('=')[1];
						wx.setStorageSync('imei', res.result.split('=')[1]);
						wx.navigateTo({
							url: '/page/charge_info/charge_info'
						});
					}
					if (
						res.result.indexOf('imei') != '-1' &&
						res.result.indexOf('3D%') != '-1'
					) {
						app.globalData.imei = wx.setStorageSync(
							'imei',
							res.result.split('3D%')[1]
						);
						wx.navigateTo({
							url: '/page/charge_info/charge_info'
						});
					}
					// if (res.path.indexOf('imei') !== -1) {
					//   app.globalData.imei = res.path.split('%3D')[1]
					//   wx.navigateTo({
					//     url: '/page/charge_info/charge_info',
					//   })
					// }
				}
			});
		} else {
			wx.showToast({
				title: '请重新登录',
				icon: 'none'
			});
		}
	},
	return() {
		wx.switchTab({
			url: '/pages/index/index'
		});
	},
	open() {
		this.setData({
			hidden: true
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	handleProgress(e) {
		console.log(e);
		if (e.detail.curPercent == 100) {
			this.setData({
				status: '租借中'
			});
			this.returnInfo();
		}
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
	},

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
