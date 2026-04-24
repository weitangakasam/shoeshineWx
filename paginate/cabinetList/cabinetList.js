const app = getApp();
import util from '../../utils/util2';
import compressImages from '../../utils/image';
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '柜门列表',
			color: '#fff',
			class: 'app_bg_title',
			navH: app.globalData.navHeight
		},
		showDialog: false,
		callback: () => {},
		dialogText: '',
		formValue: {
			dev_id: '',
			direction: ''
		},
		selectShow: false,
		selectAction: [
			{
				text: '左边',
				value: 0
			},
			{
				text: '右边',
				value: 1
			}
		],
		formShowf: false,
		images: '',
		img: ''
	},
	deletePhoto(e) {
		this.setData({
			files: [],
			images: ''
		});
	},
	pImage({
		currentTarget: {
			dataset: { url }
		}
	}) {
		wx.previewImage({
			urls: [url]
		});
	},
	async upload(e) {
		console.log(e);
		const {
			detail: { file, index }
		} = e;
		try {
			const images = await compressImages([
				{
					tempFilePath: file.url
				}
			]);
			console.log(images);
			const imgs = Array.from(images)
				.filter((it) => it.status === 'fulfilled')
				.map((it) => it.value);

			console.log('%c Line:68 🥐', 'color:#ffdd4d', imgs);
			this.setData({
				images: imgs[index],
				files: [
					{
						url: imgs[index],
						loading: false
					}
				]
			});
		} catch (error) {
			console.log(error);
		}
	},
	closeSelect() {
		this.setData({
			selectShow: false
		});
	},
	selectClick({ detail: { value } }) {
		this.closeSelect();
		this.setData({
			'formValue.direction': value
		});
	},
	async openLock({
		currentTarget: {
			dataset: {
				item: { door }
			}
		}
	}) {
		const {
			data: { only_code }
		} = this;
		try {
			const { data } = await app.post('manageNetSite/openDoor', {
				number: door,
				only_code
			});
			app.showToast(data);
			this.getList();
		} catch (error) {
			app.showError(error);
		}
	},
	formInputChange(e) {
		console.log(e);
		const {
			detail: { value },
			currentTarget: {
				dataset: { field }
			}
		} = e;
		this.setData({
			[`formValue.${field}`]: value
		});
	},
	async submit() {
		const {
			data: { formValue }
		} = this;
		try {
			const { data } = await app.post('manageNetSite/editDoor', {
				...formValue,
				img: this.data.images
			});
			app.showToast(data);
			this.closePopup();
			this.getList();
		} catch (error) {
			app.showToast(error);
		}
	},
	closePopup() {
		this.setData({
			formShow: false
		});
	},
	scan() {
		const self = this;
		wx.scanCode({
			success: (res) => {
				const { dev_id, type } = util.getUrlParams(
					res.result.split('?')[1]
				);
				if (/0/.test(type)) return;
				self.setData({
					'formValue.dev_id': dev_id
				});
			}
		});
	},
	select() {
		this.setData({
			selectShow: true
		});
	},
	async op(e) {
		const {
			currentTarget: {
				dataset: {
					item: {
						door_id,
						money,
						free_time,
						ya_jin,
						time,
						img,
						door_name
					}
				}
			}
		} = e;
		this.setData({
			formShow: true,
			files:
				img && img != '未绑定'
					? [
							{
								url: img,
								loading: false
							}
					  ]
					: [],
			images: img,
			formValue: {
				door_id,
				money,
				free_time,
				ya_jin,
				time,
				door_name
			}
		});
	},
	tapDialogButton({ detail: { index } }) {
		if (index === 0) {
			this.setData({
				showDialog: false
			});

			return;
		}

		this.setData(
			{
				showDialog: false
			},
			(e = this) => {
				e.data.callback.call(e);
			}
		);
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData(options, (e = this) => {
			e.getList();
		});
	},
	async getList() {
		try {
			const { data } = await app.post('manageNetSite/doorList', {
				only_code: this.data.only_code
			});
			app.replaceNull(data, true, '未绑定');
			this.setData({
				list: data
			});
		} catch (error) {
			app.showToast(error);
		}
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {},

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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});
