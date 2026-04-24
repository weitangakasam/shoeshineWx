const app = getApp();
import { baseUrlUpload } from '../../config';
Page({
	/**
	 * 页面的初始数据
	 */
	data: {},
	async getInfo() {
		try {
			const url = 'manageNetSite/boxDoorInfo';
			const { data } = await app.post(url, {
				box_id: this.data.box_id
			});

			this.setData({
				list: data
			});
		} catch (error) {
			app.showToast(error);
		}
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
	modifyImage({
		currentTarget: {
			dataset: { flag }
		}
	}) {
		const url = 'manageNetSite/editImg';
		const self = this;

		wx.chooseMedia({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				try {
					const {
						tempFiles: [{ tempFilePath: path }]
					} = res;
					wx.uploadFile({
						filePath: path,
						name: 'file',
						formData: {
							'lt-id': wx.getStorageSync('lt-id'),
							'lt-token': wx.getStorageSync('lt-token')
						},
						url: baseUrlUpload,
						success: async (res) => {
							const body = JSON.parse(res.data);

							if (body.code !== '000') {
								app.showToast(body.data);
							} else {
								try {
									const { data } = await app.post(url, {
										box_id: self.data.box_id,
										new_img: body.data,
										flag
									});
									app.showToast(data);

									self.getInfo();
								} catch (error) {
									app.showToast(error);
								}
							}
						}
					});
				} catch (error) {}





































			}
		});
	},
	async openDoor({
		currentTarget: {
			dataset: { flag: door_flag }
		}
	}) {
		try {
			const url = 'manageNetSite/openDoor';
			const { data } = await app.post(url, {
				box_id: this.data.box_id,
				door_flag
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
		const { box_id } = options;
		this.setData({
			box_id
		});
		this.getInfo();
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
