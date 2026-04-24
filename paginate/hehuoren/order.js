import Dialog from '@vant/weapp/dialog/dialog';
import { Base64, unique } from '../../utils/util2';
let app = getApp();
Page({
	async finish({
		currentTarget: {
			dataset: { order_id, images, images2, images3 }
		}
	}) {
		try {
			if (
				[images, images2, images3].some(
					(i) => typeof i != 'string' || !i
				)
			) {
				return app.showToast('请上传全部视频');
			}
			await Dialog.confirm({
				title: '提示',
				message: '确定已完成订单？'
			});
			const { data } = await app.post('order/finish', {
				order_id,
				images: [images, images2, images3].join(',')
			});
			app.showToast(data);
			this.onShow();
		} catch (error) {
			app.showToast(error);
		}
	},
	async onTimeChange(e) {
		const { detail } = e;
		try {
			// 获取当前时间戳并转换为 Date 对象
			const now = new Date(detail);

			// 格式化月份（补零）
			const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需 +1

			// 格式化日期（补零）
			const day = String(now.getDate()).padStart(2, '0');

			// 格式化小时（补零）
			const hours = String(now.getHours()).padStart(2, '0');

			// 格式化分钟（补零）
			const minutes = String(now.getMinutes()).padStart(2, '0');

			// 组合成目标格式 "08-13 14:40"
			const formattedTime = `${month}-${day} ${hours}:${minutes}`;

			const {
				data: { order_id }
			} = this;
			const { data } = await app.post('order/agentReceiveOrder', {
				order_id,
				hope_time: formattedTime
			});
			app.showToast(data);
			this.onShow();
			this.closeTimePicker();
		} catch (error) {
			app.showError(error);
		}
	}, // 点击按钮弹出时间选择器
	closeTimePicker() {
		this.setData({
			order_id: null,
			show: false
		});
	},
	showTimePicker(e) {
		const {
			currentTarget: {
				dataset: { order_id }
			}
		} = e;

		this.setData({
			show: true,
			order_id
		});
	},
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '我的订单',
			color: '#fff',
			class: 'app_bg_title'
		},
		dataType: '售货机',
		orderList: [],
		totalPage: 1,
		params: {
			type: '全部',
			pageNo: 1,
			size: 10
		},
		currentDate: Date.now(),
		isTop: false,
		payMode: [
			{
				name: '微信支付',
				icon: 'icon-weixinzhifu',
				value: 'weixin',
				title: '微信快捷支付'
			},
			{
				name: '余额支付',
				icon: 'icon-yuezhifu',
				value: 'yue',
				title: '可用余额:',
				number: 100
			}
		],
		pay_close: false,
		pay_order_id: '',
		totalPrice: '',
		pay_code: '',
		no_more: false,
		isSetInfo: false,
		isReadInfo: false,
		readInfo: {},
		isSkQrcode: false,
		skQrcodeInfo: '',
		isCadInfo: false,
		cadInfo: {},
		isLogin: false,
		date: null,
		date2: null,
		statusArr: ['全部', '已完成', '待付款', '使用中', '已取消'],
		statusArrIndex: 0
	},
	callphone({
		currentTarget: {
			dataset: { phone }
		}
	}) {
		wx.makePhoneCall({
			phoneNumber: phone,
			success: (res) => {},
			fail: (res) => {},
			complete: (res) => {}
		});
	},
	finishOrder({
		currentTarget: {
			dataset: { order_id }
		}
	}) {
		wx.navigateTo({
			url: '/paginate/uploadPhoto/uploadPhoto?order_id=' + order_id
		});
	},
	async openLock({
		currentTarget: {
			dataset: { door, only_code, order_id, type }
		}
	}) {
		try {
			const url =
				type == '处理中'
					? 'manageNetSite/openEmptyDoor'
					: 'manageNetSite/openDoor';
			const { data } = await app.post(url, {
				number: door,
				order_id,
				only_code
			});
			app.showToast(data);
			that.setData({
				'params.pageNo': 1,
				orderList: [],
				no_more: false
			});
			that.orderList(); // 调用刷新订单列表的方法
		} catch (error) {
			app.showError(error);
		}
	},
	async toExamine(e) {
		const that = this; // 保存最外层的 this
		const {
			currentTarget: {
				dataset: { type, url, id: order_id }
			}
		} = e;

		wx.showModal({
			title: '友情提示',
			content: '确认要' + type + '该订单吗？',
			async success(o) {
				if (o.confirm) {
					try {
						const { data } = await app.post(url, {
							order_id
						});
						app.showToast(data);

						// 刷新订单列表
						that.setData({
							'params.pageNo': 1,
							orderList: [],
							no_more: false
						});
						that.orderList(); // 调用刷新订单列表的方法
					} catch (error) {
						app.showToast(error);
					}
				}
			}
		});
	},
	previewImg(e) {
		wx.previewImage({
			current: String(e.currentTarget.dataset.img).split(',')[0],
			urls: String(e.currentTarget.dataset.img).split(',')
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// let now = new Date(); //当前日期
		// let nowYear = now.getFullYear(); //当前年
		// let nowMonth = now.getMonth(); //当前月
		// let day = now.getDate(); // 当前日
		// const start = nowYear + '-' + (((nowMonth + 1) + '').length < 2 ? '0' + (nowMonth + 1) : nowMonth + 1) + '-' + '01'
		// const end = nowYear + '-' + (((nowMonth + 1) + '').length < 2 ? '0' + (nowMonth + 1) : nowMonth + 1) + '-' + (day.length < 2 ? '0' + day : day)
		// const order_time = start + ' 00:00:00' + ',' + end + ' 00:00:00'
		// this.setData({ date: start, date2: end })
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (wx.getStorageSync('agent-token')) {
			this.data.params.pageNo = 1;
			this.setData({
				isLogin: true,
				orderList: []
			});
			this.orderList();
		} else {
			this.setData({
				isLogin: false
			});
		}
	},
	// tab切换
	bindHeaderTap(e) {
		// this.setData({ dataType: e.currentTarget.dataset.type })
		this.setData({
			dataType: e.currentTarget.dataset.type,
			list: {},
			isLoading: true,
			no_more: false,
			orderList: [],
			'params.type': e.currentTarget.dataset.type,
			'params.pageNo': 1
		});
		// 获取订单列表
		this.orderList();
	},
	// 订单列表
	orderList() {
		if (this.data.dataType == '售货机') {
			const params = {};
			if (this.data.date && this.data.date2) {
				params.search_date =
					this.data.date +
					' 00:00:00' +
					'至' +
					this.data.date2 +
					' 24:00:00';
			}
			app.post('manageOrder/orderList', {
				...this.data.params,
				...params
			}).then((res) => {
				let base = new Base64();
				res.data.datas.map((item) => {
					item.nickname = base.decode(item.nickname);
				});
				this.setData({
					orderList: unique(
						[...this.data.orderList, ...res.data.datas],
						'order_id'
					),
					totalPage: res.data.totalPage
				});
			});
		}
		if (this.data.dataType == '租赁机') {
			app.post('rentalBox/orderList', this.data.params).then((res) => {
				this.setData({
					orderList: [...this.data.orderList, ...res.data.datas],
					totalPage: res.data.totalPage
				});
			});
		}
	},
	// 取消订单
	cancelOrder(e) {
		let _this = this;
		let order_id = e.currentTarget.dataset.id;
		wx.showModal({
			title: '友情提示',
			content: '确认要取消该订单吗？',
			success(o) {
				if (o.confirm) {
					let params = {
						order_id
					};
					return;
				}
			}
		});
	},
	// 支付弹窗回调
	onChangeFun: function (e) {
		let opt = e.detail;
		this.setData({
			pay_close: false
		});
		this.onShow();
	},
	// 用户信息
	personInfo() {
		app.post('user/personInfo').then((res) => {
			this.data.payMode = [
				{
					name: '微信支付',
					icon: 'icon-weixinzhifu',
					value: 'weixin',
					title: '微信快捷支付'
				},
				{
					name: '余额支付',
					icon: 'icon-yuezhifu',
					value: 'yue',
					title: '可用余额:',
					number: 100
				}
			];
			console.log(this.data.payMode);
			this.data.payMode[1].number = res.data.money;
			// let base = new Base64();
			// res.data.nickname = base.decode(res.data.nickname);
			this.setData({
				userInfo: res.data,
				payMode: this.data.payMode
			});
		});
	},
	// 复制
	copy(e) {
		// console.log(e);
		wx.setClipboardData({
			data: e.currentTarget.dataset.value,
			success(res) {
				wx.getClipboardData({
					success(res) {
						console.log(res.data); // data
					}
				});
			}
		});
	},
	bindDateChange(e) {
		console.log(e);
		this.setData({
			date: e.detail.value
		});
		const order_time =
			e.detail.value + ' 00:00:00' + ',' + this.data.date2 + ' 00:00:00';
	},
	bindDateChange2(e) {
		console.log(e);
		this.setData({
			date2: e.detail.value
		});
		const order_time =
			this.data.date + ' 00:00:00' + ',' + e.detail.value + ' 00:00:00';
	},
	bindPickerChange3(e) {
		console.log(e);
		this.setData({
			statusArrIndex: parseInt(e.detail.value),
			'params.status':
				e.detail.value == '0'
					? ''
					: this.data.statusArr[parseInt(e.detail.value)]
		});
	},
	search() {
		if (!this.data.date || !this.data.date2) {
			app.showToast('请选择开始和结束日期');
			return;
		}
		this.setData({
			'params.pageNo': 1,
			'params.size': 10,
			orderList: [],
			totalPage: 1
		});
		this.orderList();
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
	onReachBottom: function () {
		if (this.data.params.pageNo < this.data.totalPage) {
			this.setData({
				'params.pageNo': this.data.params.pageNo + 1
			});
			this.orderList();
		} else {
			this.setData({
				no_more: true
			});
		}
	}
});
