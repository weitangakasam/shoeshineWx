const app = getApp();
async function uploadFiles(tempFilePaths) {
	const uploadPromises = tempFilePaths.map((file) => {
		return new Promise((resolve, reject) => {
			wx.uploadFile({
				url: app.globalData.baseUrlUpload, // 上传接口地址
				filePath: file.tempFilePath,
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
	});

	return Promise.allSettled(uploadPromises);
}
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		fileList: []
	},
	onInputEvaluation(e) {
		const content = e.detail;
		this.setData({
			content
		});
	},
	onRateChange(e) {
		console.log(e);
		const mark = e.detail;
		this.setData({
			mark
		});
	},
	async submitEvaluation() {
		const { mark, content, fileList, goods_id, order_id } = this.data;
		const images = fileList.map((i) => i.url).join(',');
		if (!mark) return app.showToast('请选择评分');
		try {
			const { data } = await app.post('orderReview/review', {
				mark,
				content,
				images,
				goods_id,
				order_id
			});
			wx.navigateBack({
				success() {
					app.showToast(data);
				}
			});
		} catch (error) {
			app.showError(error);
		}
	},
	deletePic(event) {
		const { index } = event.detail;
		this.data.fileList.splice(index, 1);
		this.setData({
			fileList: this.data.fileList
		});
	},
	async afterRead(event) {
		console.log(event.detail);
		const { file, index } = event.detail;
		try {
			const images = await uploadFiles([file]);
			let i = images[0].value;
			this.setData({
				[`fileList[${index}]`]: { url: i }
			});
		} catch (error) {}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData(options);
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
