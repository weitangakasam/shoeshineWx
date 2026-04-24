const app = getApp();
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';
async function uploadFiles(tempFilePaths) {
	return new Promise((resolve, reject) => {
		wx.uploadFile({
			url: app.globalData.baseUrlUpload, // 上传接口地址
			filePath: tempFilePaths,
			name: 'file',
			formData: {
				'lt-id': wx.getStorageSync('lt-id'),
				'lt-token': wx.getStorageSync('lt-token')
			},
			success(res) {
				try {
					const img = JSON.parse(res.data).data;
					resolve(img);
				} catch (error) {
					reject(error);
				}
			},
			fail(err) {
				reject(err);
			}
		});
	});
}

async function handleUploadAndSubmit(tempFilePaths, context, index) {
	try {
		const img = await uploadFiles(tempFilePaths);

		// 保存图片信息到本地存储
		const storedFiles = wx.getStorageSync('uploadedFiles') || [];
		storedFiles[index] = img;
		wx.setStorageSync('uploadedFiles', storedFiles);

		context.setData({
			[`files[${index}].error`]: false,
			[`files[${index}].loading`]: false,
			[`files[${index}].url`]: img
		});
	} catch (err) {
		context.setData({
			[`files[${index}].error`]: true,
			[`files[${index}].loading`]: false,
			[`files[${index}].url`]: ''
		});
		app.showToast(err.message || '操作失败');
	}
}
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '上传图片',
			color: '#fff',
			class: 'fff',
			navH: app.globalData.navHeight
		},
		showPreview: false,
		files: new Array(6).fill(null),
		images: [
			{
				url: '/images/取车.png',
				title: '取车视频',
				field: 'images'
			},
			{
				url: '/images/洗车视频.png',
				title: '洗车视频',
				field: 'images2'
			},
			{
				url: '/images/归还停车.png',
				title: '归还停车视频',
				field: 'images3'
			}
		]
	},
	uploadFile(e) {
		const {
			currentTarget: {
				dataset: { index }
			}
		} = e;
		const that = this;
		wx.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (e) => {
				try {
					const {
						tempFiles: [{ tempFilePath }]
					} = e;
					that.setData({
						[`files[${index}]`]: {
							local_url: tempFilePath,
							loading: true,
							error: false,
							url: '',
							field: this.data.images[index].field
						}
					});
					handleUploadAndSubmit(tempFilePath, this, index);
				} catch (error) {}
			}
		});
	},
	hide() {
		this.setData({
			showPreview: false
		});
	},
	deletePic(e) {
		const {
			detail: { url }
		} = e;
		const index = this.data.files.findIndex(
			(it) => it && it.local_url === url
		);
		this.setData({
			[`files[${index}]`]: null
		});

		// 删除本地存储中的图片信息
		const storedFiles = wx.getStorageSync('uploadedFiles') || [];
		storedFiles[index] = null;
		wx.setStorageSync('uploadedFiles', storedFiles);
	},
	previewImage(e) {
		const { index } = e.currentTarget.dataset;
		const previewImageUrls = [];
		this.data.files
			.filter((it) => !!it)
			.forEach((item) => {
				previewImageUrls.push(item.local_url);
			});
		this.setData({
			previewImageUrls,
			previewCurrent: previewImageUrls.findIndex((it) => {
				return it === this.data.files[index].local_url;
			}),
			showPreview: true
		});
	},
	binddelete(e) {
		const { files } = this.data;
		const {
			currentTarget: {
				dataset: { index }
			}
		} = e;
		files[index] = null;
		this.setData({
			files: files
		});
	},
	upload(e) {
		const {
			detail: { tempFilePaths }
		} = e;
		this.setData({
			files: this.data.files.concat(
				Array.from(tempFilePaths).map((i) => ({
					url: i,
					loading: true,
					error: false
				}))
			)
		});
		handleUploadAndSubmit(tempFilePaths, this);
	},
	async submit() {
		const { files, images } = this.data;
		const imgs = files.filter((i) => i && !i.loading && !i.error);
		const errorImages = files.filter((i) => i && i.error);
		if (errorImages.length > 0) {
			return app.showToast('请处理报错的图片，重新上传');
		}
		const loadingImages = files.filter((i) => i && i.loading);
		if (loadingImages.length > 0) {
			return app.showToast('请等待图片上传完成或重新上传');
		}
		try {
			for (let i = 0; i < imgs.length; ++i) {
				if (!imgs[i].url) continue;
				await app.post('order/editOrderImages', {
					order_id: this.data.order_id,
					[`${imgs[i].field}`]: imgs[i].url
				});
			}
			await Dialog.alert({
				message: '视频上传成功'
			});
			wx.navigateBack({
				success: () => {}
			});
		} catch (error) {
			Toast.clear();
			Dialog.alert({
				message: error
			});
			// app.showToast(error);
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData(options);
		// 读取本地存储的图片信息并初始化页面数据
		// const storedFiles = wx.getStorageSync('uploadedFiles') || [];
		// this.setData({
		// 	files: storedFiles.map((file) =>
		// 		file ? {
		// 			url: file,
		// 			loading: false,
		// 			error: false,
		// 			local_url: file
		// 		} :
		// 		null
		// 	)
		// });
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
