/** @format */
import {
	getUrlParams
} from '../../utils/util2';
// paginate/add_shebi/add_shebei.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '录入设备',
			color: '#fff',
			class: 'app_bg_title'
		},
		params: {
			dev_id: '',
			base_time_x: '',
			address_id: '',
			address: ''
		},
		isSelect: false,
		isDev: false,
		isTrue: false,
		useIndex: 0,
		nums: new Array(100).fill(0).map((_, i) => i + 1),
		index: 0
	},
	bindChange({
		detail: {
			value
		}
	}) {
		this.setData({
			useIndex: value
		});
	},
	changePicker({
		detail: {
			value
		}
	}) {
		this.setData({
			index: value
		});
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (options.hasOwnProperty('addr_id')) {
			this.setData({
				addr_id: options.addr_id
			});
		}
		this.setData({
			top: app.globalData.navHeight
		});
	},
	openModal({
		currentTarget: {
			dataset: {
				field
			}
		}
	}) {
		this.setData({
			[field]: true
		});
	},
	closeModal({
		currentTarget: {
			dataset: {
				field
			}
		}
	}) {
		this.setData({
			[field]: false
		});
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	scan() {
		const self = this;
		const {
			data: {
				useIndex
			}
		} = this;
		const keys = ['params.dev_id', 'params.power_dev_id'];
		// that.getList()
		// return
		wx.scanCode({
			success: (res) => {
				const {
					dev_id
				} = getUrlParams(
					decodeURIComponent(res.result).split('?')[1]
				);
				self.setData({
					[keys[useIndex]]: dev_id,
					isDev: false
				});
				// that.getList()
			}
		});
	},
	async getList() {
		const res = await app.post('manageNetSite/getVMDevice', {
			dev_id: '869298055041073'
		});
	},
	select_changsuo() {
		app.post('manageAddress/addressList').then((res) => {
			this.setData({
				list: res.data,
				isSelect: true
			});
		});
	},
	changeRadio(e) {
		let data = e.currentTarget.dataset.item;
		this.setData({
			isSelect: false,
			'params.address': data.addr_name,
			'params.address_id': data.id,
			'params.money': data.addr_price
		});
	},
	changeInput(e) {
		let type = e.currentTarget.dataset.type;
		this.data.params[type] = e.detail.value;
		this.setData({
			params: this.data.params
		});
	},
	async sure(e) {
		try {
			const {
				value,
				target: {
					dataset: {
						type
					}
				}
			} = e.detail;
			const {
				params,
				nums,
				index,
				list
			} = this.data;
			const requiredFields = [{
					key: 'dev_id',
					message: '请输入设备号'
				},
				{
					key: 'name',
					message: '请输入设备名称'
				},
				// { key: 'video_imei', message: '请输入音响IMEI' },
				{
					key: 'address_id',
					message: '请选择场所'
				},
				{
					key: 'count',
					message: '请输入胡柜门数量'
				}
				// { key: 'free_time', message: '请输入免费时间' },
				// { key: 'time', message: '请输入计费周期' },
				// { key: 'money', message: '请输入周期单价' }
			];

			for (const {
					key,
					message
				} of requiredFields) {
				if (!params[key]) return app.showToast(message);
			}

			const box_info = Array.from({
					length: nums[index]
				},
				(_, i) => `${i + 1}:6`
			).join(';');

			const data = {
				...value,
				...params,
				box_info
			};
			const resp = await app.post('manageNetSite/addVMDevice', data);

			if (type === '继续') {
				app.showToast(resp.data);
				this.setData({
					params: {}
				});
				return;
			}
			wx.navigateBack({
				delta: 1,
				success: () => {
					app.showToast(resp.data);
				}
			});
		} catch (error) {
			app.showToast(error);
		}
	},
	select_close() {
		this.setData({
			isSelect: false
		});
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
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
});