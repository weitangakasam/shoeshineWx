// import { list, updateGoodsNum, deleteGoods } from '../../api/mall';
const App = getApp();
const app = getApp();
// 工具类
// import Util from '../../utils/util.js';

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '购物车',
			color: '#fff',
			class: 'fff',
			navH: App.globalData.navHeight
		},
		isLogin: false,

		// 商品列表
		goods_list: [],

		// 当前动作
		action: 'complete',

		// 选择的商品
		checkedData: [],

		// 是否全选
		checkedAll: true,

		// 商品总价格
		cartTotalPrice: '0.00',
		totalPage: 1 // 总页数
	},
	onShow() {
		// this.setData({
		// 	isLogin: app.globalData.isLogin
		// });
		// this.getCartList();
		this.triggerOrder();
	},
	triggerOrder() {
		try {
			let shop = wx.getStorageSync('shop') ?? {
				selectedIndexes: [],
				goodsList: []
			};
			const { selectedIndexes, goodsList } = shop;
			const selectList = Array.from(goodsList)
				.filter((it) => {
					return selectedIndexes.some((i) => i.id == it.id);
				})
				.map((it) => {
					it.num = selectedIndexes.find((i) => i.id == it.id).num;
					return it;
				});

			this.setData({
				goods_list: selectList,
				price: selectList.reduce((acc, item) => {
					return acc + (item.num * parseInt(item.price * 100) ?? 0);
				}, 0)
			});
		} catch (error) {
			console.log(error);
		}
	},
	onChange(e) {
		// console.log(e);
		switch (e.detail) {
			case 0:
				// wx.navigateTo({
				// 	url: '/pages/mall/mall'
				// });
				break;
			case 2:
				wx.redirectTo({
					url: '/pages/mallOrder/index',
					fail: console.error
				});
				break;
		}
	},
	async onSubmit(e) {
		try {
			let shop = wx.getStorageSync('shop') ?? {};
			const { goods_list } = this.data;
			const { data } = await app.post(
				'wXAPIV3PubKey/createNetSiteGoodsOrder',
				{
					goods_id: JSON.stringify(
						goods_list
							.map((it) => ({ id: it.id, num: it.num }))
							.filter((i) => i)
							.filter((i) => i.num > 0)
					),
					imei: shop.imei
				}
			);
			await app.payV3(data);
			wx.showModal({
				title: '提示',
				content:
					'请确认您当前处于对应机柜面前然后点击确认，以避免对您造成不必要的损失',
				showCancel: false,
				complete: () => {
					wx.removeStorage('shop');
					wx.navigateTo({
						url: '/paginate/rent/rent?isUse=true'
					});
				}
			});
		} catch (error) {
			console.log(error);
			app.showError(error);
		}
	},
	/**
	 * 加法
	 */
	mathadd(arg1, arg2) {
		return (Number(arg1) + Number(arg2)).toFixed(2);
	},

	/**
	 * 减法
	 */
	mathsub(arg1, arg2) {
		return (Number(arg1) - Number(arg2)).toFixed(2);
	},

	/**
	 * 去购物
	 */
	goShopping() {
		wx.navigateTo({
			url: '/pages/index/index',
			fail: console.log
		});
	}
});
