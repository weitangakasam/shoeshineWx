/** @format */

let app = getApp();
const wxParse = require('../../wxParse/wxParse.js');

Page({
	data: {
		parameter: {
			navbar: '1',
			return: '1',
			class: 'fff',
			title: ''
		},
		address: '',
		iShidden: true, //是否隐藏授权登录框
		url: '',
		money: 0,
		dayMoney: 0, //每日封顶
		hidden: true, // 协议是否隐藏
		nodes: '',
		userInfo: null,
		isSelectProduct: false,
		product: 'A',
		SelectType: 'goPages',
		isAgree: false,
		isSubmitting: false // 新增：抗并发点击标志
	},

	onLoad(e) {
		this.setData(e);
		this.getInfo();
		//获取产品
	},

	change(e) {
		console.log(e);
		const {
			detail: { value }
		} = e;
		this.setData({
			isAgree: value[0]
		});
	},

	changeBox(e) {
		const { detail } = e;
		this.setData({
			door: this.data.info.boxs[detail.value].door,
			door_id: this.data.info.boxs[detail.value].door_id,
			ya_jin: this.data.info.boxs[detail.value].ya_jin
		});
	},

	onLoadFun(data) {
		if (wx.openBusinessView) {
			this.goPages();
		} else {
			wx.showToast({
				title: '请先升级微信版本',
				icon: 'none'
			});
			//引导用户升级微信版本
		}
	},

	onShow() {
		this.personInfo();
	},

	async getInfo() {
		try {
			const res = await app.post('userSiteOrder/getInfo', {
				dev_id: app.globalData.dev_id
			});
			this.setData({
				info: res.data
			});
			// if (res.data.status != '在线') {
			//   wx.showModal({
			//     title: '提示',
			//     content: '设备离线，请更换设备',
			//     showCancel: false,
			//     success: a => {
			//       if (a.confirm) {
			//         wx.navigateBack({
			//           delta: 1,
			//         })
			//       }
			//     }
			//   })
			//   return
			// }
			// if (res.data.ht == '00') {
			//   wx.showModal({
			//     title: '提示',
			//     content: '设备已被使用，请更换设备',
			//     showCancel: false,
			//     success: a => {
			//       if (a.confirm) {
			//         wx.navigateBack({
			//           delta: 1,
			//         })
			//       }
			//     }
			//   })
			//   return
			// }
			const { data } = await app.post('userSiteOrder/getPrompt');
			wx.showModal({
				title: '提示',
				content: data,
				showCancel: false
			});
		} catch (error) {
			wx.showModal({
				title: '提示',
				// content: '设备异常，请重试或更换设备！',
				content: `设备异常，${error}; 请重试或更换设备`,
				showCancel: false,
				success: (a) => {
					wx.navigateBack({
						delta: 1
					});
				}
			});
		}
	},

	personInfo() {
		app.post('user/personInfo').then((res) => {
			this.setData({
				userInfo: res.data
			});
		});
	},

	async goPages() {
		let that = this;
		if (!wx.getStorageSync('lt-token')) {
			this.setData({
				iShidden: false
			});
			return;
		}
		try {
			if (that.data.userInfo == null) {
				wx.showModal({
					title: '提示',
					content: '网络异常，请重新试试',
					showCancel: false,
					success: (a) => {
						wx.navigateBack({
							delta: 1
						});
					}
				});
			}

			// 实名验证
			// if (that.data.userInfo && that.data.userInfo.is_check_idcard != "y") {
			// 	wx.showModal({
			// 		title: "提示",
			// 		content: "使用设备前需实名认证，是否进行验证？",
			// 		success: a => {
			// 			wx.navigateTo({
			// 				url: "/paginate/auth_name/auth_name"
			// 			});
			// 		}
			// 	});
			// 	return;
			// }
			clearInterval(this.order);
			if (wx.openBusinessView) {
				const res = await app.post(
					'wxPointPay/getWxServiceOrderParams',
					{
						imei: app.globalData.dev_id,
						product: this.data.product
					}
				);

				wx.openBusinessView({
					businessType: 'wxpayScoreUse',
					extraData: {
						mch_id: res.data.mch_id,
						package: res.data.package,
						timestamp: res.data.timestamp,
						nonce_str: res.data.nonce_str,
						sign_type: res.data.sign_type,
						sign: res.data.sign
					},
					success(res) {
						let index = 0;
						that.order = setInterval(() => {
							app.post('userSiteOrder/getNowOrder').then(
								(res) => {
									index++;
									if (index == 10) {
										clearInterval(that.order);
									}
									if (res.data.status == '使用中') {
										clearInterval(that.order);
										wx.redirectTo({
											url: '/paginate/rent/rent?isUse=true'
										});
									}
								}
							);
						}, 1000);
						if (JSON.stringify(res.extraData) != '{}') {
							//
							// // app.globalData.imei
							// // wx.setStorageSync('isUse', true)
							wx.redirectTo({
								url: '/paginate/rent/rent?isUse=true'
							});
						} else {
						}
					},
					fail(err) {
						//dosomething
					},
					complete() {
						//dosomething
					}
				});
			} else {
				//引导用户升级微信版本
				wx.showModal({
					title: '提示',
					content: '请先升级微信版本',
					showCancel: false
				});
			}
		} catch (error) {
			app.showToast(error + '');
		}
	},

	// ================== 重点优化区域 ==================
	// 添加下单抗并发点击处理
	async goPages1() {
		// 抗并发检查
		if (this.data.isSubmitting) return;

		try {
			this.setData({ isSubmitting: true }); // 锁定按钮

			// 基础校验
			if (!this.data.isAgree) {
				app.showToast('请仔细阅读协议并点击同意');
				return;
			}

			// 登录状态检查
			if (!wx.getStorageSync('lt-token')) {
				try {
					await app.openLogin();
				} catch (error) {
					this.setData({ iShidden: false });
					return;
				}
			}

			// 获取用户信息
			const { data: userInfo } = await app.post('user/personInfo');
			this.setData({ userInfo });

			// 柜门校验
			if (!/^\d+(\.\d+)?$/.test(this.data.door)) {
				app.showToast('请选择柜门');
				return;
			}

			// 押金校验
			if (userInfo.yajin_money < this.data.ya_jin) {
				await this.handleDepositInsufficient(userInfo); // 处理押金不足逻辑
			} else {
				await this.handleNormalOrder(userInfo); // 处理正常下单逻辑
			}
		} catch (error) {
			app.showToast(error.message || JSON.stringify(error));
		} finally {
			this.setData({ isSubmitting: false }); // 释放锁定
		}
	},

	async getCabinet() {
		const { door_id } = this.data;
		const {
			data: { used_doors, status }
		} = await app.post('userSiteOrder/getInfo', {
			dev_id: app.globalData.dev_id
		});

		if (status === '离线') throw new Error('设备离线');
		if (used_doors.includes(door_id)) throw new Error('设备使用中');
	},

	// 处理押金不足逻辑
	handleDepositInsufficient(userInfo) {
		return new Promise((resolve, reject) => {
			wx.showModal({
				title: '提示',
				content:
					'当账户剩余押金小于平台需要缴纳的押金时，禁止下单，需要补缴押金',
				success: async (res) => {
					if (res.confirm) {
						try {
							await this.getCabinet();

							// 获取押金订单号
							const { data: yaJinCode } = await app.post(
								'user/getYaJinCode',
								{
									door_id: this.data.door_id
								}
							);

							// 创建支付订单
							const { data: rechargeOrder } = await app.post(
								'wXAPIV3PubKey/createRechargeOrder',
								{
									order_id: yaJinCode
								}
							);

							// 调起支付
							await app.payV3(rechargeOrder, async (result) => {
								app.showToast(result);
								if (result === '支付成功') {
									await this.handleNormalOrder(userInfo); // 支付成功后重试
									resolve();
								}
							});
						} catch (error) {
							reject(error);
						}
					} else {
						reject('取消支付');
					}
				}
			});
		});
	},

	// 处理正常下单逻辑
	async handleNormalOrder(userInfo) {
		try {
			if (!app.globalData.dev_id) {
				app.showToast('设备不在线');
				return;
			}

			await this.getCabinet();

			const res = await app.post('wxPointPay/yajinPay', {
				userInfo,
				imei: app.globalData.dev_id,
				product: this.data.product,
				door: this.data.door
			});

			app.globalData.isShowUploadImg = false;
			wx.removeStorageSync('uploadedFiles');
			app.showToast('押金支付成功');
			wx.redirectTo({
				url: '/paginate/rent/rent?isUse=true'
			});
		} catch (error) {
			app.showToast(error.message || error);
			throw error; // 继续抛出错误以便外部捕获
		}
	},

	// ================== 其他函数保留 ==================
	async xyf(door) {
		if (door == '01') {
			door = 1;
		} else {
			door = 0;
		}
		try {
			if (wx.openBusinessView) {
				const res = await app.post(
					'wxPointPay/getWxServiceOrderParams',
					{
						imei: app.globalData.dev_id,
						door: door,
						product: this.data.product
					}
				);

				wx.openBusinessView({
					businessType: 'wxpayScoreUse',
					extraData: {
						mch_id: res.data.mch_id,
						package: res.data.package,
						timestamp: res.data.timestamp,
						nonce_str: res.data.nonce_str,
						sign_type: res.data.sign_type,
						sign: res.data.sign
					},
					success(res) {
						//dosomething

						if (JSON.stringify(res.extraData) != '{}') {
							// app.globalData.imei
							// wx.setStorageSync('isUse', true)
							wx.redirectTo({
								url: '/paginate/rent/rent?isUse=true'
							});
						} else {
						}
					},
					fail(err) {
						//dosomething
					},
					complete() {
						//dosomething
					}
				});
			} else {
				//引导用户升级微信版本
				wx.showToast({
					title: '请先升级微信版本',
					icon: 'none'
				});
			}
		} catch (error) {}
	},

	beforeleave(e) {
		this.setData({
			hidden: true
		});
	},

	selectProduct({
		currentTarget: {
			dataset: { type }
		}
	}) {
		this.setData({
			hidden: false,
			isSelectProduct: true,
			selectProduct: type
		});
	},

	radioChange({ detail: { value } }) {
		this.setData({
			product: value
		});
	},

	confrim() {
		const {
			data: { selectProduct }
		} = this;

		this[selectProduct]();
		this.setData({
			hidden: this.data.hidden
		});
	},

	async isHidden(e) {
		if (e.currentTarget.dataset.hasOwnProperty('text')) {
			const res = await app.post('wXMiNiProgram/getParameter');
			res.data.user_agreement = wxParse.wxParse(
				'user_agreement',
				'html',
				res.data.user_agreement,
				this,
				0
			);
			res.data.privacy_policy = wxParse.wxParse(
				'privacy_policy',
				'html',
				res.data.privacy_policy,
				this,
				0
			);

			this.setData({
				// nodes: res.data[e.currentTarget.dataset.text]
				nodes: e.currentTarget.dataset.text
			});
		}
		this.setData({
			hidden: !this.data.hidden,
			isSelectProduct: false
		});
	}
});
