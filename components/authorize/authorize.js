import auth from "../../utils/authService";
const app = getApp();

function compareVersion(v1, v2) {
	v1 = v1.split('.');
	v2 = v2.split('.');
	const len = Math.max(v1.length, v2.length);

	while (v1.length < len) {
		v1.push('0');
	}
	while (v2.length < len) {
		v2.push('0');
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i]);
		const num2 = parseInt(v2[i]);

		if (num1 > num2) {
			return 1;
		} else if (num1 < num2) {
			return -1;
		}
	}

	return 0;
}


Component({
	properties: {
		iShidden: {
			type: Boolean,
			value: true
		},
		//是否自动登录
		isAuto: {
			type: Boolean,
			value: true
		},
		isGoIndex: {
			type: Boolean,
			value: true
		}
	},
	data: {
		cloneIner: null,
		loading: false,
		errorSum: 0,
		errorNum: 3
	},
	observers: {
		iShidden: function (iShidden) {
			if (iShidden) return;
			if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token'))
				auth.login(false, (context = this) => {
					context.setData({
						iShidden: true
					});
					context.triggerEvent('onLoadFun', app.globalData.userInfo);
				});
		}
	},
	lifetimes: {
		attached() {
			if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token')) {
				auth.login(false, (context = this) => {
					context.triggerEvent('onLoadFun', app.globalData.userInfo);
					context.setData({
						iShidden: true
					});

				});
				return;
			}
		}
	},

	methods: {
		close() {
			let pages = getCurrentPages();
			let currPage = pages[pages.length - 1];
			if (this.data.isGoIndex) {
				// wx.navigateTo({url:'/pages/index/index'});
				this.setData({
					iShidden: true
				});
			} else {
				this.setData({
					iShidden: true
				});
				if (currPage && currPage.data.iShidden != undefined) {
					currPage.setData({
						iShidden: true
					});
				}
			}
		},

		// 获取手机号code
		getPhoneNumber(e) {
			if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
				// 用户拒绝授权
				wx.showModal({
					title: '提示',
					content: '用户拒绝授权',
					showCancel: false
				});
			} else if (
				'code' in e.detail &&
				e.detail.hasOwnProperty('encryptedData')
			) {
				app.globalData.mobileCode = e.detail.code;
				auth.login(true, (context = this) => {
					context.setData({
						iShidden: true
					});
					context.triggerEvent('onLoadFun', app.globalData.userInfo);
				});
			} else {
				wx.showModal({
					title: '提示',
					content: '获取手机号码失败'
				});
			}
		}
	}
});