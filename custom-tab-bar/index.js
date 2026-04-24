/** @format */

const util2 = require('../utils/util2');
function parseURLParams(url) {
	const params = {};
	const urlParts = decodeURIComponent(url).split('?');

	if (urlParts.length === 2) {
		const queryString = urlParts[1];
		const keyValuePairs = queryString.split('&');

		keyValuePairs.forEach((keyValue) => {
			const [key, value] = keyValue.split('=');
			if (key && value) {
				try {
					params[key] = JSON.parse(decodeURIComponent(value));
				} catch (error) {
					params[key] = decodeURIComponent(value);
				}
			}
		});
	}
	return params;
}
const app = getApp();
Component({
	data: {
		selected: 0,
		color: '#7A7E83',
		selectedColor: '#577bd1',
		list: [
			{
				pagePath: '/pages/index/index',
				text: '首页',
				iconPath: '/images/IMG_4997.jpg',
				selectedIconPath: '/images/IMG_4997.jpg'
			},
			{
				pagePath: '/pages/order/order',
				text: '订单',
				iconPath: '/images/IMG_4998.jpg',
				selectedIconPath: '/images/IMG_4998.jpg'
			},
			{
				pagePath: '/pages/user/user',
				text: '我的',
				iconPath: '/images/IMG_4999.jpg',
				selectedIconPath: '/images/IMG_4999.jpg'
			}
		],
		iShidden: true
	},
	attached() {},
	methods: {
		switchTab(e) {
			const data = e.currentTarget.dataset;
			const url = data.path;
			wx.switchTab({ url });
			this.setData({
				selected: data.index
			});
		},
		async checkLogin() {
			if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token')) {
				try {
					wx.showLoading({
						title: '正在登录'
					});
					await app.openLogin();
					wx.hideLoading();
					return true;
				} catch (error) {
					wx.hideLoading();
					this.setData({
						iShidden: false
					});
					return false;
				}
			}
			return true;
		},
		async scan() {
			(await this.checkLogin()) &&
				wx.scanCode({
					onlyFromCamera: false,
					success: async ({ result }) => {
						const { dev_id, num } = parseURLParams(decodeURIComponent(result));
						try {
							const { data } = await app.post('userSiteOrder/beginOrder', {
								dev_id,
								num
							});
							app.showToast(data);
							//TODO 洗车开始
							wx.showModal({
								title: '洗车提示',
								content: '洗车订单创建成功，订单开始计时',
								showCancel: false,
								complete: (res) => {
									wx.navigateTo({
										url: '/pages/index/index?dev_id=' + dev_id
									});
								}
							});
						} catch (error) {
							app.showToast(error);
						}
					},
					fail: (res) => {},
					complete: (res) => {}
				});
		}
	}
});
