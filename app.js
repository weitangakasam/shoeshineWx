// app.js
import request from './utils/request';
import { baseUrlUpload } from './config';
import AuthService from './utils/authService';
App({
	onLaunch() {
		// 获取导航高度；
		wx.getSystemInfo({
			success: res => {
				//导航高度
				this.globalData.windowWidth = res.windowWidth;
				this.globalData.windowHeight = res.windowHeight;
				this.globalData.navHeight = res.statusBarHeight * (750 / res.windowWidth) + 97;
			},
			fail(err) {}
		});
		wx.loadFontFace({
			family: 'DingTalk-JinBuTi',
			source: 'url("https://siyuehanfu.dakakj.com/1.ttf")', //此处需替换为真实字体地址
			global: true,
			success(res) {
				console.log(1, res.status);
			},
			fail: function (res) {
				console.log(2, res.status);
			},
			complete: function (res) {
				console.log(3, res.status);
			}
		});
		// if (wx.getStorageSync('isUse')) {
		//   wx.navigateTo({
		//     url: '/paginate/rent/rent',
		//   })
		// }
		this.repost();
		AuthService.login(false).catch(err => {
			wx.showToast({
				title: '登录失败' + err,
				icon: 'none'
			});
		});
	},
	showError(e) {
		wx.showModal({
			title: '错误',
			content: e,
			showCancel: false,
			complete: res => {
				if (res.cancel) {
				}

				if (res.confirm) {
				}
			}
		});
	},
	/**
	 * 尝试打开一个登录会话。
	 *
	 * 此函数使用 wx.login API 登录系统并检索用户信息。
	 * 然后，它向服务器发送请求以授权用户并获取令牌。
	 * 如果授权成功，则它将令牌和用户信息存储在全局数据和本地存储中。
	 *
	 * @return {Promise} 如果登录成功则解析的Promise，否则拒绝。
	 */ async openLogin() {
		const _this = this;

		return new Promise((suc, fail) => {
			if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token'))
				wx.login({
					success: res1 => {
						wx.getUserInfo({
							// desc: '获取用户信息',
							success: async res => {
								let userInfo = res.userInfo;

								if (res1.code) {
									let code = res1.code;
									let params = {
										code: code
									};
									try {
										let res2 = await _this.post('wXMiNiProgram/authorize', params);
										// 如果没有token
										if (!res2.data.token) {
											fail();
										} else {
											_this.globalData.token = res2.data.token;
											_this.globalData.isLogin = true;
											_this.globalData.userInfo = res2.data;
											wx.setStorageSync('isLogin', true);
											//取消登录提示
											wx.setStorageSync('userInfo', userInfo);
											wx.setStorageSync('open_id', res2.data);
											wx.setStorageSync('lt-id', res2.data.user_id);
											wx.setStorageSync('lt-token', res2.data.token);
											suc();
										}
									} catch (err) {}
								} else {
								}
							},
							fail: console.log
						});
					},
					fail: console.log
				});
			else {
				suc();
			}
		});
	},
	isNull(target) {
		return (
			target === void 0 ||
			target === null ||
			JSON.stringify(target) === '{}' ||
			(typeof target === 'string' && /^\s*$/.test(target))
		);
	},
	/**
	 * 后端在某些情况在一个空值上返回的是一个空对象，将替换掉解决前端显示的异常
	 * @param {object} data 一个后端传回的值
	 * @param {boolean} deep 是否深度替换
	 * @param {string} defalutValue 替换的值
	 */ replaceNull(data, deep = false, defalutValue = '') {
		if (typeof data !== 'object') return;
		const that = this;
		Object.keys(data).forEach(key => {
			if (that.isNull(data[key])) data[key] = defalutValue;
			else if (deep) that.replaceNull(data[key], deep, defalutValue);
		});
	},
	linkTo(url, payload) {
		let uri = '';
		let params = '';
		const _this = this;
		function toUrlParams(payload) {
			return _this.isNull(payload)
				? ''
				: Object.entries(payload)
						.map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
						.join('&');
		}
		if (typeof url === 'object') {
			const {
				currentTarget: {
					dataset: { url: u, ...body }
				}
			} = url;
			uri = u;
			params = toUrlParams(body);
		} else {
			uri = url;
			params = toUrlParams(payload);
		}
		if (!uri.startsWith('/')) uri = `/${uri}`;
		if (/^\/pages\//.test(uri)) {
			wx.switchTab({
				url: uri,
				fail: function () {
					wx.navigateTo({
						url: `${uri}?${params}`
					});
				}
			});
		} else
			wx.navigateTo({
				url: `${uri}?${params}`
			});
	},
	globalData: {
		windowWidth: null,
		windowHeight: null,
		navHeight: null,
		baseUrlUpload,
		dev_id: null,
		timer: null,
		mobileCode: null,
		disabled: false,
		//设置是否显示上传图片按钮变量
		isShowUploadImg: false
	},
	onShow() {},
	post(url, params) {
		return request.post(url, params);
	},
	showToast(text, type, duration) {
		wx.showToast({
			title: text,
			icon: type || 'none',
			duration: duration || 1500
		});
	},
	pay(params, callback) {
		console.log(params);
		wx.requestPayment({
			timeStamp: params.timestamp,
			nonceStr: params.noncestr,
			package: 'prepay_id=' + params.prepayid,
			signType: 'MD5',
			paySign: params.sign,
			// appId: res.data.data.appid,
			success: result => {
				console.log(result);
				callback('支付成功');
			},
			fail: err => {
				callback('支付失败');
				console.log('支付失败', err);
			}
		});
	},
	payV3(params, callback) {
		return new Promise((resolve, reject) => {
			wx.requestPayment({
				timeStamp: params.timeStamp,
				nonceStr: params.nonceStr,
				// package: 'prepay_id=' + params.prepayid,
				package: params.package,
				// signType: 'MD5',
				signType: params.signType,
				paySign: params.paySign,
				// appId: res.data.data.appid,
				success: result => {
					callback?.('支付成功');
					resolve(result);
				},
				fail: err => {
					callback?.('支付失败');
					reject(err);
				}
			});
		});
	},
	// 计算图片宽高
	bindload(e, that) {
		console.log(e);
		// 宽高比
		let ratio = e.detail.width / e.detail.height;
		// 计算的高度值
		let imgHeight = this.globalData.windowWidth / ratio;
		that.setData({
			imgHeight
		});
		return imgHeight;
	},
	repost() {
		var PageTmp = Page;
		Page = function (pageConfig) {
			// 设置全局默认分享
			pageConfig = Object.assign(
				{
					//右上角分享功能
					onShareAppMessage() {
						return {
							// title: '',//分享标题
						};
					},
					onShareTimeline() {
						// 构建页面参数
						return {
							// title: '',
						};
					}
				},
				pageConfig
			);
			PageTmp(pageConfig);
		};
	},
	/**
	 * 跳转到指定页面
	 * 支持tabBar页面
	 */
	navigationTo(url) {
		if (!url || url.length == 0) {
			return false;
		}
		let tabBarLinks = [];
		// tabBar页面
		if (tabBarLinks.indexOf(url) > -1) {
			wx.switchTab({
				url: '/' + url
			});
		} else {
			// 普通页面
			wx.navigateTo({
				url: '/' + url
			});
		}
	}
});
