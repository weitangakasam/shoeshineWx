// paginate/tenter/tenter.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '录入商户',
			color: '#fff',
			class: 'app_bg_title'
		},
		isOpen: false,
		multiArray: [],
		objectMultiArray: [],
		multiIndex: [0, 0, 0]
	},
	bindMultiPickerChange: function (e) {
		this.setData({
			'form.city_id': this.data.objectMultiArray[2][e.detail.value[2]].id,
			multiIndex: e.detail.value
		});
	},
	bindMultiPickerColumnChange: function (e) {
		var data = {
			multiArray: this.data.multiArray,
			multiIndex: this.data.multiIndex,
			objectMultiArray: this.data.objectMultiArray
		};
		let pid =
			this.data.objectMultiArray[e.detail.column][e.detail.value].id;
		data.multiIndex[e.detail.column] = e.detail.value;
		switch (e.detail.column) {
			case 0:
				app.post('manage/getArea', { pid: pid }).then((res2) => {
					console.log(res2);
					let arr = res2.data.map((item) => {
						return item.name;
					});
					data.multiArray[1] = arr;
					data.objectMultiArray[1] = res2.data;
					app.post('manage/getArea', { pid: res2.data[0].id }).then(
						(res3) => {
							data.multiArray[2] = res3.data.map((item) => {
								return item.name;
							});
							data.objectMultiArray[2] = res3.data;
							data.multiIndex[1] = 0;
							data.multiIndex[2] = 0;
							this.setData({
								multiArray: this.data.multiArray,
								objectMultiArray: this.data.objectMultiArray,
								multiIndex: this.data.multiIndex
							});
						}
					);
				});

				break;
			case 1:
				app.post('manage/getArea', { pid }).then((res3) => {
					data.multiArray[2] = res3.data.map((item) => {
						return item.name;
					});
					data.objectMultiArray[2] = res3.data;
					data.multiIndex[2] = 0;
					this.setData({
						multiArray: this.data.multiArray,
						objectMultiArray: this.data.objectMultiArray,
						multiIndex: this.data.multiIndex
					});
				});

				break;
		}
		// this.setData(
		//   objectMultiArray
		// );
	},
	async submit(e) {
		try {
			e.detail.value.username = e.detail.value.n;
			delete e.detail.value.n;
			let data = { ...e.detail.value, ...this.data.form };
			data.type = 0;
			if (!data.mobile)
				return wx.showToast({ title: '请输入手机号', icon: 'none' });
			if (!data.username)
				return wx.showToast({ title: '请输入用户名', icon: 'none' });
			if (!data.password)
				return wx.showToast({ title: '请输入登录密码', icon: 'none' });
			if (!data.password2)
				return wx.showToast({ title: '请输入确认密码', icon: 'none' });
			if (!data.city_id)
				return wx.showToast({ title: '请选择经营地区', icon: 'none' });
			if (!data.rate)
				return wx.showToast({ title: '请输入分成比例', icon: 'none' });
			if (!/^1[3456789]\d{9}$/.test(data.mobile))
				return app.showToast('请输入与正确的手机号');
			if (data.password != data.password2)
				return wx.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				});
			if (parseFloat(data.rate) > this.data.tishi * 100)
				return wx.showToast({
					title: '请输入正确分成比例',
					icon: 'none'
				});
			data.rate = parseFloat(data.rate) / 100;
			await app.post('manageOperator/addOperator', data);
			wx.showModal({
				title: '提示',
				content: '\t\t录入成功，继续录入或者返回上一页',
				confirmText: '继续录入',
				confirmColor: '#02BB00',
				complete: ({ confrm, cancel }) => {
					if (cancel) {
						wx.navigateBack({ delta: 1 });
					}
					if (confrm) {
						this.setData({
							params: {},
							'form.city_id': ''
						});
					}
				}
			});
		} catch (error) {
			app.showToast(
				typeof error === 'string' ? error : '服务器错误，请联系管理员'
			);
		}
	},
	openSelect() {
		this.setData({
			isOpen: true
		});
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		app.post('manage/getArea', { pid: 0 }).then((res) => {
			let arr = [[], [], []];

			app.post('manage/getArea', { pid: res.data[0].id }).then((res2) => {
				app.post('manage/getArea', { pid: res2.data[0].id }).then(
					(res3) => {
						let arr = [];
						arr[0] = res.data.map((item) => {
							return item.name;
						});
						arr[1] = res2.data.map((item) => {
							return item.name;
						});
						arr[2] = res3.data.map((item) => {
							return item.name;
						});
						let arr1 = [];
						arr1[0] = res.data;
						arr1[1] = res2.data;
						arr1[2] = res3.data;
						console.log(arr1);
						this.setData({
							multiArray: arr,
							objectMultiArray: arr1
						});
					}
				);
			});
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});
