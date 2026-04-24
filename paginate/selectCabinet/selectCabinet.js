const app = getApp();
Page({
	data: {
		parameter: {
			navbar: '选择柜子',
			return: '1',
			class: 'fff',
			title: ''
		},
		parkingSpace: '', // 车位号
		licensePlate: '', // 车牌号
		selectedFloor: '', // 选中的楼层
		showFloorPicker: false, // 是否显示楼层选择器
		floors: [
			// 楼层选项
			{
				text: '1层',
				value: 1
			},
			{
				text: 'B1层（负一层）',
				value: -1
			},
			{
				text: 'B2层（负二层）',
				value: -2
			},
			{
				text: 'B3层（负三层）',
				value: -3
			}
		],
		validatorStrategies: {
			// 必填校验
			required: (value, field) => ({
				valid: !!value && String(value).trim() !== '',
				message: `${
					{ position: '车位号', king_msg: '楼层选项' }[field]
				}字段不能为空`
			}),
			// 车牌号校验
			carNumber: (value) => ({
				// 支持带分隔符（·）和不带分隔符的车牌
				valid: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Za-hj-np-z][·\s-]?[A-HJ-NP-Za-hj-np-z0-9]{4,5}[A-HJ-NP-Za-hj-np-z0-9挂学警港澳]$/i.test(
					value
				),
				message: '请输入有效的车牌号'
			}),
			// 商品选择校验
			goodsSelected: (value) => ({
				valid: value.length > 0,
				message: '请至少选择一件商品'
			})
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
	// 车牌号输入变化
	onLicensePlateChange: function (e) {
		let value = e.detail.toUpperCase();

		// 移除所有空格（避免重复插入）

		// 2. 智能格式化（自动添加分隔符）
		if (
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z]$/.test(
				value.substring(0, 2)
			)
		) {
			if (value.length >= 3 && !/^.{2}[·]/.test(value)) {
				value = value.replace(/^(.{2})(.*)$/, '$1·$2');
			}
		}

		// 3. 过滤非法字符
		value = value.replace(
			/[^京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-HJ-NP-Z0-9·\s-挂学警港澳]/g,
			''
		);

		this.setData({
			car_num: value
		});
	},

	// 显示楼层选择器
	showFloorPicker: function () {
		this.setData({
			showFloorPicker: true
		});
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
	// 隐藏楼层选择器
	hideFloorPicker: function () {
		this.setData({
			showFloorPicker: false
		});
	},

	// 确认楼层选择
	onFloorConfirm: function (e) {
		const { value, index } = e.detail;
		this.setData({
			king_msg: this.data.floors[index].text,
			showFloorPicker: false
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

			const { data } = await app.post(
				'wXAPIV3PubKey/createNetSiteGoodsOrder',
				{
					goods_id: JSON.stringify(
						selectedIndexes
							.filter((i) => i)
							.filter((i) => i.num > 0)
					),
					imei: app.globalData.dev_id
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
		} finally {
			wx.hideLoading();
			this.setData({
				isSubmitting: false
			});
		}
	},
	async openDoor({
		currentTarget: {
			dataset: { door, door_id, ya_jin, free_time, money, time }
		}
	}) {
		const { used_doors } = this.data;
		if (Array.isArray(used_doors) && used_doors.some((it) => it === door)) {
			app.showToast('当前柜门正在使用中...');
			return;
		}
		app.linkTo('paginate/charge_info/charge_info', {
			door,
			door_id,
			ya_jin,
			free_time,
			money,
			time
		});
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
		try {
			const { data } = await app.post('order/getUserPosition');

			this.setData({
				historyList: [data]
			});
		} catch (error) {}
	},
	previewPictures({
		currentTarget: {
			dataset: { url }
		}
	}) {
		if ('未传图片' === url) {
			return app.showToast('当前图片尚未上传');
		}
		wx.previewImage({
			current: url, // 当前显示图片的http链接
			urls: [url], // 需要预览的图片http链接列表
			success: function (res) {},
			fail: function (res) {
				app.showToast('当前图片尚未上传');
			},
			complete: function (res) {}
		});
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
