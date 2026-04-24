// paginate/yijian/add.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '意见反馈',
			color: '#fff',
			class: 'app_bg_title'
		},
		params: {
			imgs: []
		},
		title: '',
		phone: '',
		content: ''
	},
	deleteImage({
		currentTarget: {
			dataset: { index }
		}
	}) {
		const { params } = this.data;
		const { imgs } = params;
		imgs.splice(index, 1);
		this.setData({
			'params.imgs': imgs
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	chooseMedia() {
		let that = this;
		wx.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			camera: 'back',
			success(res) {
				wx.uploadFile({
					url: app.globalData.baseUrlUpload, //仅为示例，非真实的接口地址
					filePath: res.tempFiles[0].tempFilePath,
					name: 'file',
					formData: {
						'lt-id': wx.getStorageSync('lt-id'),
						'lt-token': wx.getStorageSync('lt-token')
					},
					success(res) {
						console.log(res);
						const img = [JSON.parse(res.data).data];
						that.setData({
							'params.imgs': [...that.data.params.imgs, ...img]
						});
					}
				});
			}
		});
	},
	changeText(e) {
		this.setData({ content: e.detail.value });
	},
	//提交
	submit() {
		let _this = this;
		if (_this.data.content.length <= 0) {
			wx.showToast({
				title: '内容不能为空'
			});
			return false;
		}
		// let zz = /^1[3-9]\d{9}$/;
		// if(!zz.test(_this.data.phone)){
		//   wx.showToast({
		//     title: '请填写正确手机号',
		//   })
		//   return false;
		// }
		let params = {
			title: _this.data.title,
			mobile: 0,
			content: _this.data.content,
			imageUrl: _this.data.params.imgs.join(',')
		};
		app.post('user/feedback', params).then((res) => {
			console.log(res);
			wx.showToast({
				title: res.data,
				success: (a) => {
					setTimeout(() => {
						wx.navigateBack(
							{
								delta: 1
							},
							1500
						);
					});
				}
			});
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
