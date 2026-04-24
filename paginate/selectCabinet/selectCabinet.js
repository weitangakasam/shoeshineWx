const app = getApp();
Page({
	data: {
		parameter: {
			navbar: '选择柜子',
			return: '1',
			class: 'fff',
			title: ''
		},
		selectedIndexes: []
	}, // 车位号输入变化
	onParkingSpaceChange: function (e) {
		this.setData({
			position: e.detail
		});
	},

	toggleSelect(e) {
		const { detail } = e;
    console.log(detail)
		const {
			index,
			item: { id }
		} = e.currentTarget.dataset; // 获取当前点击商品的索引
		const { selectedIndexes } = this.data; // 获取当前选中索引的数组

		let newSelectedIndexes = [...selectedIndexes]; // 创建数组副本
		if (detail == 0) {
			newSelectedIndexes[index] = {
				num: 0,
				id: id
			};
		} else {
			if (!selectedIndexes[index]) {
				newSelectedIndexes[index] = {
					num: 1,
					id: id
				};
			} else {
				newSelectedIndexes[index] = {
					num: typeof detail == 'object' ? 1 : detail,
					id: id
				};
			}
		}

		// 更新数据，触发渲染
		this.setData(
			{
				selectedIndexes: newSelectedIndexes
			},
			(e = this) => {
				e.refreshPrice();
			}
		);
	},
	refreshPrice() {
		const { selectedIndexes, goodsList } = this.data;

		this.setData({
			totalPrice: Number(
				selectedIndexes
					.map((i, index) => {
						if (!i) return 0;
						if (i.num == 0) return 0;
						return i.num * goodsList[index].price;
					})
					.reduce((a, b) => a + b, 0)
			).toFixed(2),
			goodsList: goodsList
		});
	},
	getPackageInfo: async function () {
		try {
			const { data } = await app.post('goods/goodsList', {
				dev_id: app.globalData.dev_id
			});
			this.setData({
				goodsList: data
			});
		} catch (error) {}
	},


	selectItem(e) {
		console.log(e);
		const {
			currentTarget: {
				dataset: {
					item: { car_num, door, parking_msg, position }
				}
			}
		} = e;
		this.setData({
			position: position,
			door,
			car_num,
			king_msg: parking_msg
		});
	},



	/**
	 * 执行校验（责任链模式）
	 * @param {Array} rules 校验规则数组
	 * @returns {boolean} 是否通过校验
	 */
	validate(rules) {
		for (const rule of rules) {
			const { field, strategy, context } = rule;
			const value = this.data[field];
			const strategyFn = this.data.validatorStrategies[strategy];
			if (!strategyFn) continue;

			const { valid, message } = strategyFn(value, field);
			if (!valid) {
				wx.hideLoading();
				wx.showModal({
					title: message,
					showCancel: false,
					icon: 'none'
				});
				return false;
			}
		}
		return true;
	},
	addShop() {
		const { goodsList, selectedIndexes } = this.data;
		const imei = app.globalData.dev_id;
		wx.setStorageSync('shop', {
			imei,
			goodsList,
			selectedIndexes
		});
	},
	// 提交表单
	onSubmit: async function () {
		if (this.data.isSubmitting) return;
		wx.showLoading({
			title: '加载中...'
		});
		this.setData({
			isSubmitting: true
		});
		try {
			const {
				king_msg,
				car_num,
				position,
				selectedIndexes,
				goodsList
			} = this.data;
			// 这里可以添加提交到服务器的逻辑

			// const { data } = await app.post(
			// 	'wXAPIV3PubKey/createNetSiteGoodsOrder',
			// 	{
			// 		goods_id: JSON.stringify(
			// 			selectedIndexes
			// 				.filter((i) => i)
			// 				.filter((i) => i.num > 0)
			// 		),
			// 		imei: app.globalData.dev_id
			// 	}
			// );
			// await app.payV3(data);
			wx.showModal({
				title: '提示',
				content:
					'请确认您当前处于对应机柜面前然后点击确认，以避免对您造成不必要的损失',
				showCancel: false,
				complete: () => {
					wx.removeStorage('shop');
					wx.switchTab({
						url: '/pages/order/order'
					});
				}
			});
		} catch (error) {
			console.log(error);
			app.showError(error);
		} finally {
			wx.hideLoading();
			this.setData({
				isSubmitting: false
			});
		}
	},
	async onLoad() {
		// this.getCabinet();
		const imei = app.globalData.dev_id;
		const cache = wx.getStorageSync('shop');
		if (imei == cache.imei) {
			this.setData({
				selectedIndexes: cache.selectedIndexes
			});
		}
		this.getPackageInfo();

    //这个好像没用到
		// try {
		// 	const { data } = await app.post('order/getUserPosition');

		// 	this.setData({
		// 		historyList: [data]
		// 	});
		// } catch (error) {}
	},
	async getCabinet() {
		try {
			const {
				data: { boxs, used_doors, status }
			} = await app.post('userSiteOrder/getInfo', {
				dev_id: app.globalData.dev_id
			});
			if (status === '离线')
				wx.navigateBack({
					success: () => {
						app.showToast('当前设备不在线');
					}
				});
			this.setData({
				list: boxs.map((item) => {
					item.used_status = used_doors.some((it) => it === item.door)
						? '使用中'
						: '租赁';
					return item;
				}),
				used_doors
			});
		} catch (e) {
			wx.navigateBack({
				success: () => {
					app.showToast(e);
				}
			});
		}
	}
});
