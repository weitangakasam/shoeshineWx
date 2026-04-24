/** @format */
import {
	getUrlParams
} from '../../utils/util2';
// paginate/hehuoren/shebei_admin.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '继电器列表',
			color: '#fff',
			class: 'app_bg_title',
			navH: app.globalData.navHeight
		},
		hidden: false,
		hidden2: false,
		hidden3: false,
		list: [],
		editValue: {},
		addr_id: null,
		type: '1',
		params: {
			pageNo: 1,
			size: 10,
			only_code: '',
			name: ''
		},
		ids: null,
		totalPage: 1,
		mobile: null,
		id_type: null,
		editArr: [],
		isCheckAll: false,
		doorArr: [], // 门数
		num_door: null, // 需要开的门，
		nums: new Array(11).fill(0).map((_, i) => i + 2)
	},

	async controller({
		currentTarget: {
			dataset: {
				url,
				...params
			}
		}
	}) {
		try {
			const {
				data
			} = await app.post(url, params);
			app.showToast(data);
			this.refresh();
		} catch (error) {
			app.showToast(error);
		}
	},
	async openDoor({
		currentTarget: {
			dataset: {
				url,
				count,
				only_code
			}
		},
		detail: {
			value
		}
	}) {
		try {
			const {
				data
			} = await app.post(url, {
				lock_flag: Math.min(parseInt(value) + 1, parseInt(count)),
				only_code
			});
			app.showToast(data);
		} catch (error) {
			app.showToast(error);
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({
			mobile: wx.getStorageSync('agent_info').mobile,
			id_type: wx.getStorageSync('agent_info').type
		});
		if (options.hasOwnProperty('addr_id')) {
			this.setData({
				addr_id: options.addr_id
			});
		} else if (options.hasOwnProperty('id')) {
			this.setData({
				box_id: options.id
			});
		} else if (options.hasOwnProperty('ids')) {
			this.setData({
				ids: options.ids
			});
		}
	},
	async query({
		currentTarget: {
			dataset: {
				url,
				box_gwid
			}
		}
	}) {
		try {
			const {
				data: {
					ttl_password,
					ttl_status
				}
			} = await app.post(url, {
				box_gwid
			});
			wx.showModal({
				title: '提示',
				content: `标签密码:${ttl_password}\n状态:${
					ttl_status === 0 ? '未检测到' : '已检测到'
				}`
			});
		} catch (error) {
			app.showToast(error);
		}
	},
	async queryLock({
		currentTarget: {
			dataset: {
				url,
				box_gwid
			}
		}
	}) {
		try {
			const {
				data
			} = await app.post(url, {
				box_gwid
			});
			app.showToast(data);
		} catch (error) {
			app.showToast(error);
		}
	},
	powerControl({
		currentTarget: {
			dataset: {
				title,
				url,
				only_code
			}
		}
	}) {
		wx.showModal({
			title: '提示',
			content: `你确定${title}？`,
			complete: async ({
				confirm
			}) => {
				if (confirm) {
					let i = 1;
					let symbol = 1;
					const timer = setInterval(() => {
						wx.showLoading({
							mask: true,
							title: `正在发送指令${new Array(i)
								.fill('.')
								.join('')}`
						});
						if (i === 1) symbol = 1;
						else if (i === 3) symbol = -1;
						i += symbol;
					}, 1000);
					try {
						const {
							data
						} = await app.post(url, {
							only_code
						});
						clearInterval(timer);
						wx.hideLoading();
						app.showToast(data);
					} catch (error) {
						clearInterval(timer);
						wx.hideLoading();
						app.showToast(error);
					}
				}
			}
		});
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.setData({
			list: [],
			'params.pageNo': 1
		});
		this.getList();
	},
	getList(params) {
		this.setData({
			isCheckAll: false
		});
		let data = {
			...this.data.params
		};
		if (this.data.addr_id) {
			data.addr_id = this.data.addr_id;
			data.address_id = this.data.addr_id;
		}
		if (this.data.box_id) {
			data.box_id = this.data.box_id;
		}
		if (this.data.ids != null) {
			data.ids = this.data.ids;
		}
		data.type = '0';
		app.post('manageNetSite/vmDeviceList', data).then((res) => {
			res.data.datas.map((item) => {
				item.checked = false;
			});
			this.setData({
				list: [...this.data.list, ...res.data.datas],
				totalPage: res.data.totalPage
			});
		});
	},
	scan() {
		const self = this;
		wx.scanCode({
			scanType: ['qrCode', 'barCode'],

			success: ({
				result
			}) => {
				const {
					dev_id
				} = getUrlParams(
					decodeURIComponent(result).split('?')[1]
				);
				self.setData({
					'editValue.power_dev_id': dev_id
				});
			}
		});
	},
	changeTab(e) {
		this.setData({
			type: e.currentTarget.dataset.type
		});
		this.getList();
	},
	search(e) {
		const value = e.detail.value.search;
		if (value) {
			if (!Number(value)) {
				this.setData({
					params: {
						pageNo: 1,
						size: 10,
						only_code: '',
						name: value
					},
					list: []
				});
			} else {
				this.setData({
					params: {
						pageNo: 1,
						size: 10,
						only_code: value,
						name: ''
					},
					list: []
				});
			}
		} else {
			this.setData({
				params: {
					pageNo: 1,
					size: 10,
					only_code: '',
					name: ''
				},
				list: []
			});
		}
		this.getList();
	},
	goPages(e) {
		let url = e.currentTarget.dataset.url;
		if (url == '/paginate/hehuoren/shebeiAdd') {
			wx.scanCode({
				success: (res) => {
					let arr = [];
					if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('%26') != '-1'
					) {
						arr = res.result
							.split('%3F')[1]
							.split('%26')
							.map((item) => {
								return item.split('%3D')[1];
							});
					} else if (
						res.result.indexOf('type') != '-1' &&
						res.result.indexOf('&') != '-1'
					) {
						arr = res.result
							.split('?')[1]
							.split('&')
							.map((item) => {
								return item.split('=')[1];
							});
					}
					if (arr[1] != '1' && arr[1] != '2') {
						wx.showModal({
							title: '提示',
							content: '二维码错误',
							showCancel: false
						});
						return;
					}
					//
					wx.navigateTo({
						url: url +
							'?dev_id=' +
							arr[0] +
							'&addr_id=' +
							this.data.addr_id +
							'&type=' +
							arr[1]
					});
				}
			});
		} else {
			if (this.data.addr_id) {
				wx.navigateTo({
					url: url + '?addr_id=' + this.data.addr_id
				});
			} else {
				wx.navigateTo({
					url: url
				});
			}
		}
	},
	changePicker({
		detail: {
			value
		}
	}) {
		this.setData({
			'editValue.count': this.data.nums[value]
		});
	},
	edit(e) {
		const data = e.currentTarget.dataset;
		if (data.type == '开门') {
			let doorArr = [];
			for (let i = 1; i <= data.item.count; i++) {
				doorArr.push(i);
			}
			this.setData({
				hidden: true,
				editValue: data.item,
				doorArr
			});
			return;
		}
		if (data.type == '修改') {
			app.replaceNull(data.item, false, '');
			this.setData({
				hidden2: true,
				editValue: data.item
			});
			return;
		}
		if (data.type == '批量') {
			let isTrue = false;
			this.data.list.map((item) => {
				if (item.checked) {
					isTrue = true;
				}
			});
			if (!isTrue) {
				app.showToast('请先勾选批量修改内容');
				return;
			}
			this.setData({
				hidden3: true
			});
		}
	},
	bindPickerChange(e) {
		this.setData({
			num_door: e.detail.value
		});
	},
	close() {
		this.setData({
			hidden: false,
			hidden2: false,
			hidden3: false,
			doorArr: [],
			num_door: null
		});
	},
	async sure(e) {
		let type = e.currentTarget.dataset.type;
		let params = {};
		if (!this.data.num_door) {
			app.showToast('请选择柜门!');
			return;
		}
		params.only_code = this.data.editValue.only_code;
		params.number = this.data.doorArr[this.data.num_door];
		app.post('manageNetSite/openDoor', params)
			.then((res) => {
				app.showToast(res.data);
				this.close();
			})
			.catch((err) => {
				app.showToast(err);
			});
	},
	addNum() {
		this.setData({
			'editValue.amount': this.data.editValue.amount + 1
		});
	},
	delNum() {
		if (this.data.editValue.amount < 2) {
			return;
		}
		this.setData({
			'editValue.amount': this.data.editValue.amount - 1
		});
	},
	changeInput(e) {
		let data = e.currentTarget.dataset;
		this.data.editValue[data.name] = e.detail.value;
		this.setData({
			editValue: this.data.editValue
		});
	},
	async editSubmit(e) {
		let data = {
			...this.data.editValue,
			...e.detail.value
		};
		const fields = [{
			key: 'name',
			message: '请输入设备名称'
		}];

		for (const field of fields) {
			if (
				typeof data[field.key] === 'undefined' ||
				data[field.key] === null ||
				String(data[field.key]).trim() === ''
			) {
				return wx.showToast({
					title: field.message,
					icon: 'none'
				});
			}
		}
		data.vmdevice_id = data.id;
		try {
			const res = await app.post('manageNetSite/editVMDevice', data);
			wx.showToast({
				title: res.data,
				icon: 'none'
			});
			this.close();
			this.setData({
				params: {
					pageNo: 1,
					size: 10,
					only_code: '',
					name: ''
				},
				list: []
			});
			this.getList();
		} catch (error) {
			wx.showToast({
				title: error,
				icon: 'none'
			});
		}
	},
	editSubmit2(e) {
		if (this.data.editArr.length != 0) {
			if (!e.detail.value.free_time)
				return wx.showToast({
					title: '请输入免费时间',
					icon: 'none'
				});
			if (!e.detail.value.time)
				return wx.showToast({
					title: '请输入计费周期',
					icon: 'none'
				});
			if (!e.detail.value.money)
				return wx.showToast({
					title: '请输入周期价格',
					icon: 'none'
				});
			wx.showLoading({
				title: '批量修改中'
			});
			this.data.editArr.map(async (item, index) => {
				let data = {
					...{
						vmdevice_id: item
					},
					...e.detail.value
				};
				try {
					const res = await app.post(
						'manageNetSite/editVMDevice',
						data
					);
					if (index + 1 == this.data.editArr.length) {
						wx.hideLoading();
						wx.showToast({
							title: res.data,
							icon: 'none'
						});
						setTimeout(() => {
							this.close();
							this.getList();
						}, 1500);
					}
				} catch (error) {
					wx.hideLoading();
					wx.showToast({
						title: error,
						icon: 'none'
					});
				}
			});
			return;
		}
	},
	sure2() {
		app.post('manageNetSite/editVMDevice', {
				...this.data.editValue,
				...{
					vmdevice_id: this.data.editValue.id,
					address_id: this.data.editValue.addr_id
				}
			})
			.then((res) => {
				wx.showToast({
					title: res.data,
					icon: 'none'
				});
				this.getList();
			})
			.catch((err) => {
				wx.showToast({
					title: err,
					icon: 'none'
				});
			});
	},
	checkboxChange(e) {
		//
		//
		//
		return;
	},
	checkAll(e) {
		if (this.data.isCheckAll) {
			this.data.list.map((item) => {
				item.checked = false;
			});
			this.setData({
				isCheckAll: false,
				editArr: [],
				list: this.data.list
			});
		} else {
			let editArr = [];
			this.data.list.map((item) => {
				editArr.push(item.id);
				item.checked = true;
			});
			this.setData({
				isCheckAll: true,
				editArr,
				list: this.data.list
			});
		}
	},
	checkboxChange2(e) {
		let index = e.currentTarget.dataset.index;
		this.data.list[index].checked = !this.data.list[index].checked;
		let editArr = [];
		this.data.list.map((item) => {
			if (item.checked) {
				editArr.push(item.id);
			}
		});
		if (editArr.length == this.data.list.length) {
			this.setData({
				isCheckAll: true
			});
		} else {
			this.setData({
				isCheckAll: false
			});
		}
		this.setData({
			list: this.data.list,
			editArr
		});
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {},
	bindscrolltolower() {
		if (this.data.params.pageNo < this.data.totalPage) {
			this.setData({
				'params.pageNo': this.data.params.pageNo + 1
			});
			this.getList();
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});